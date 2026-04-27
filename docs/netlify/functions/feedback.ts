import { createPrivateKey, sign } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'

type FeedbackChoice = 'yes' | 'no'

type FeedbackRequest = {
  type?: FeedbackChoice
  page?: string
  message?: string
}

type NetlifyEvent = {
  httpMethod: string
  body: string | null
}

const GITHUB_REPO = 'interledger/open-payments-docs-feedback'
const GITHUB_API = 'https://api.github.com'

const stripEnvValueQuotes = (value: string) => {
  const t = value.trim()
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1)
  }
  return t
}

const parseEnvFileContent = (content: string) => {
  const map = new Map<string, string>()
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }
    const key = trimmed.slice(0, separatorIndex).trim()
    const value = stripEnvValueQuotes(trimmed.slice(separatorIndex + 1))
    map.set(key, value)
  }
  return map
}

/**
 * Netlify functions often have an unexpected cwd. Walk ancestors and try both
 * each directory and its `docs/` subfolder (monorepo layout).
 */
const walkSearchBases = (): string[] => {
  const out: string[] = []
  const seen = new Set<string>()
  let dir = process.cwd()
  for (let i = 0; i < 12; i++) {
    for (const base of [dir, path.join(dir, 'docs')]) {
      const normalized = path.normalize(base)
      if (!seen.has(normalized)) {
        seen.add(normalized)
        out.push(normalized)
      }
    }
    const parent = path.dirname(dir)
    if (parent === dir) {
      break
    }
    dir = parent
  }
  return out
}

const listEnvFileCandidates = (): string[] =>
  walkSearchBases().map((base) => path.resolve(base, '.env'))

type LocalEnvCache = { map: Map<string, string>; baseDir: string } | null
let localEnvCache: LocalEnvCache | undefined

const getLocalEnvFromDisk = (): LocalEnvCache => {
  if (localEnvCache !== undefined) {
    return localEnvCache
  }
  for (const envPath of listEnvFileCandidates()) {
    try {
      const raw = readFileSync(envPath, 'utf8')
      localEnvCache = {
        map: parseEnvFileContent(raw),
        baseDir: path.dirname(envPath)
      }
      return localEnvCache
    } catch {
      continue
    }
  }
  localEnvCache = null
  return localEnvCache
}

const readLocalEnvVar = (name: string) => getLocalEnvFromDisk()?.map.get(name)

const getEnv = (name: string) => process.env[name] || readLocalEnvVar(name)

const normalizePrivateKey = (raw: string) => raw.trim().replace(/\\n/g, '\n')

const loadPrivateKeyPem = (): string | undefined => {
  const inline = getEnv('GITHUB_APP_PRIVATE_KEY')
  if (inline) {
    return normalizePrivateKey(inline)
  }

  const keyPath = getEnv('GITHUB_APP_PRIVATE_KEY_PATH')
  if (!keyPath) {
    return undefined
  }

  if (path.isAbsolute(keyPath)) {
    try {
      return normalizePrivateKey(readFileSync(keyPath, 'utf8'))
    } catch {
      return undefined
    }
  }

  const bases = new Set(walkSearchBases())
  const local = getLocalEnvFromDisk()
  if (local?.baseDir) {
    bases.add(path.normalize(local.baseDir))
  }

  for (const base of bases) {
    try {
      return normalizePrivateKey(readFileSync(path.join(base, keyPath), 'utf8'))
    } catch {
      continue
    }
  }

  return undefined
}

const base64urlJson = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

const createAppJwt = (appId: string, privateKeyPem: string) => {
  const header = { alg: 'RS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const iat = now - 60
  const exp = iat + 9 * 60
  const payload = { iat, exp, iss: appId }
  const unsigned = `${base64urlJson(header)}.${base64urlJson(payload)}`
  const key = createPrivateKey(privateKeyPem)
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(unsigned, 'utf8'),
    key
  ).toString('base64url')
  return `${unsigned}.${signature}`
}

const githubHeaders = (authorization: string) => ({
  Authorization: authorization,
  Accept: 'application/vnd.github+json',
  'Content-Type': 'application/json',
  'User-Agent': 'OpenPayments-Docs-Feedback-Widget',
  'X-GitHub-Api-Version': '2022-11-28'
})

const getInstallationAccessToken = async (
  appJwt: string,
  installationId: string
) => {
  const response = await fetch(
    `${GITHUB_API}/app/installations/${installationId}/access_tokens`,
    {
      method: 'POST',
      headers: githubHeaders(`Bearer ${appJwt}`),
      body: '{}'
    }
  )

  const data = (await response.json()) as { token?: string }
  if (!response.ok || !data.token) {
    return { ok: false as const, status: response.status }
  }

  return { ok: true as const, token: data.token }
}

const createResponse = (statusCode: number, body: Record<string, unknown>) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})

export const handler = async (event: NetlifyEvent) => {
  if (event.httpMethod !== 'POST') {
    return createResponse(405, {
      success: false,
      error: 'Method not allowed'
    })
  }

  const appId = getEnv('GITHUB_APP_ID')
  const installationId = getEnv('GITHUB_APP_INSTALLATION_ID')
  const privateKey = loadPrivateKeyPem()

  if (!appId || !installationId || !privateKey) {
    return createResponse(500, {
      success: false,
      error: 'GitHub App credentials not configured'
    })
  }

  let payload: FeedbackRequest

  try {
    payload = JSON.parse(event.body || '{}') as FeedbackRequest
  } catch {
    return createResponse(400, {
      success: false,
      error: 'Invalid JSON payload'
    })
  }

  const { type, page, message } = payload

  if ((type !== 'yes' && type !== 'no') || !page) {
    return createResponse(400, {
      success: false,
      error: 'Missing required feedback fields'
    })
  }

  let appJwt: string
  try {
    appJwt = createAppJwt(appId, privateKey)
  } catch {
    return createResponse(500, {
      success: false,
      error: 'Could not sign GitHub App JWT'
    })
  }

  const tokenResult = await getInstallationAccessToken(appJwt, installationId)
  if (!tokenResult.ok) {
    return createResponse(502, {
      success: false,
      error: 'Could not obtain GitHub installation token'
    })
  }

  const emoji = type === 'yes' ? '🙂' : '🙁'
  const sentiment = type === 'yes' ? 'Positive' : 'Negative'
  const issueTitle = `[Feedback] ${emoji} ${page}`
  const issueBody = `**Page:** ${page}
**Feedback Type:** ${sentiment} ${emoji}
**User Message:**

${message || '_No additional feedback provided_'}

---
_Submitted via feedback widget on ${new Date().toISOString()}_`

  const response = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/issues`, {
    method: 'POST',
    headers: githubHeaders(`Bearer ${tokenResult.token}`),
    body: JSON.stringify({
      title: issueTitle,
      body: issueBody,
      labels: [
        'feedback',
        'docs',
        type === 'yes' ? 'feedback-positive' : 'feedback-negative'
      ]
    })
  })

  if (!response.ok) {
    return createResponse(response.status, {
      success: false,
      error: 'GitHub API request failed'
    })
  }

  const issue = (await response.json()) as {
    html_url?: string
    number?: number
  }

  return createResponse(200, {
    success: true,
    issueUrl: issue.html_url,
    issueNumber: issue.number
  })
}

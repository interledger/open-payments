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

const readLocalEnvVar = (name: string) => {
  try {
    const envFile = readFileSync(path.join(process.cwd(), '.env'), 'utf8')
    for (const line of envFile.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) {
        continue
      }

      const separatorIndex = trimmed.indexOf('=')
      if (separatorIndex === -1) {
        continue
      }

      const key = trimmed.slice(0, separatorIndex).trim()
      if (key !== name) {
        continue
      }

      return trimmed.slice(separatorIndex + 1).trim()
    }
  } catch {
    return undefined
  }

  return undefined
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

  const githubToken =
    process.env.GITHUB_TOKEN || readLocalEnvVar('GITHUB_TOKEN')

  if (!githubToken) {
    return createResponse(500, {
      success: false,
      error: 'GitHub token not configured'
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

  const emoji = type === 'yes' ? '🙂' : '🙁'
  const sentiment = type === 'yes' ? 'Positive' : 'Negative'
  const issueTitle = `[Feedback] ${emoji} ${page}`
  const issueBody = `**Page:** ${page}
**Feedback Type:** ${sentiment} ${emoji}
**User Message:**

${message || '_No additional feedback provided_'}

---
_Submitted via feedback widget on ${new Date().toISOString()}_`

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_REPO}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'OpenPayments-Docs-Feedback-Widget'
      },
      body: JSON.stringify({
        title: issueTitle,
        body: issueBody,
        labels: [
          'feedback',
          'docs',
          type === 'yes' ? 'feedback-positive' : 'feedback-negative'
        ]
      })
    }
  )

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

export function stringToUint8Array(str: string) {
  const buffer = new ArrayBuffer(str.length)
  const bufferView = new Uint8Array(buffer)

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufferView[i] = str.charCodeAt(i)
  }

  return bufferView
}

export function binaryToBase64url(value: string): string {
  let base64: string | undefined
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(value, 'binary').toString('base64')
  } else {
    base64 = btoa(value)
  }

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function stringToUint8Array(str: string) {
  const buffer = new ArrayBuffer(str.length)
  const bufferView = new Uint8Array(buffer)

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufferView[i] = str.charCodeAt(i)
  }
  return bufferView
}

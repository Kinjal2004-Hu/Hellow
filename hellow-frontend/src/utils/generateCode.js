export function generateCode(length = 8) {
  const chars = '0123456789ABCDEF'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export function generateMusicCode() {
  return generateCode(6)
}

export function generateMeetingCode() {
  return generateCode(8)
}

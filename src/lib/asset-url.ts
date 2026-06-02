export function resolveUploadUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'
  const origin = apiBase.replace(/\/api\/v1\/?$/, '')
  return `${origin}${path}`
}

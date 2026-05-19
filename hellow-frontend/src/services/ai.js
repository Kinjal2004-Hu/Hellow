import { api } from './api'

export async function generateNote(topic) {
  return api.post('/ai/generate-note', { topic })
}

export async function summarizeArticle(url) {
  return api.post('/ai/summarize', { url })
}

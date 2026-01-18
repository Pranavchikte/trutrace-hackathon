export interface Verification {
  id: string
  type: 'image' | 'text'
  status: 'ai-generated' | 'human-created'
  confidence: number
  hash: string
  timestamp: string
}

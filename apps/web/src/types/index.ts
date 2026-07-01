export type VideoProvider = 'aliyun' | 'jimeng'

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface UploadedAsset {
  id: string
  name: string
  type: 'image' | 'document'
  mimeType: string
  size: number
  previewUrl?: string
  createdAt: string
}

export interface VideoTask {
  id: string
  title: string
  provider: VideoProvider
  status: TaskStatus
  prompt?: string
  assetIds: string[]
  resultUrl?: string
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface ProviderStatus {
  provider: VideoProvider
  label: string
  configured: boolean
  enabled: boolean
}

export interface CreateVideoPayload {
  title: string
  provider: VideoProvider
  prompt: string
  assetIds: string[]
}

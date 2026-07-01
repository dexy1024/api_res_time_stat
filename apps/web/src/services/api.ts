import axios from 'axios'
import type { CreateVideoPayload, ProviderStatus, VideoTask } from '@/types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

export const isStaticDemoMode = !import.meta.env.VITE_API_BASE_URL && import.meta.env.PROD

const client = axios.create({
  baseURL: apiBaseUrl,
  timeout: 60_000,
})

export async function fetchProviderStatus(): Promise<ProviderStatus[]> {
  const { data } = await client.get<{ providers: ProviderStatus[] }>('/providers/status')
  return data.providers
}

export async function createVideoTask(payload: CreateVideoPayload): Promise<VideoTask> {
  const { data } = await client.post<{ task: VideoTask }>('/video/tasks', payload)
  return data.task
}

export async function fetchVideoTasks(): Promise<VideoTask[]> {
  const { data } = await client.get<{ tasks: VideoTask[] }>('/video/tasks')
  return data.tasks
}

export async function fetchVideoTask(id: string): Promise<VideoTask> {
  const { data } = await client.get<{ task: VideoTask }>(`/video/tasks/${id}`)
  return data.task
}

export async function uploadAsset(file: File): Promise<{ assetId: string; previewUrl?: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const { data } = await client.post<{ assetId: string; previewUrl?: string }>(
    '/assets/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return data
}

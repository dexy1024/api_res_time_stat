import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProviderStatus, VideoProvider } from '@/types'

const defaultProviders: ProviderStatus[] = [
  { provider: 'aliyun', label: '阿里云（通义万相）', configured: false, enabled: true },
  { provider: 'jimeng', label: '字节跳动（即梦 AI）', configured: false, enabled: true },
]

interface ProviderState {
  providers: ProviderStatus[]
  defaultProvider: VideoProvider
  setDefaultProvider: (provider: VideoProvider) => void
  toggleProvider: (provider: VideoProvider, enabled: boolean) => void
  syncProviderStatus: (providers: ProviderStatus[]) => void
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      providers: defaultProviders,
      defaultProvider: 'aliyun',
      setDefaultProvider: (provider) => set({ defaultProvider: provider }),
      toggleProvider: (provider, enabled) =>
        set((state) => ({
          providers: state.providers.map((item) =>
            item.provider === provider ? { ...item, enabled } : item,
          ),
        })),
      syncProviderStatus: (providers) =>
        set((state) => ({
          providers: state.providers.map((item) => {
            const remote = providers.find((p) => p.provider === item.provider)
            return remote ? { ...item, configured: remote.configured } : item
          }),
        })),
    }),
    {
      name: 'video-studio-providers',
      partialize: (state) => ({
        defaultProvider: state.defaultProvider,
        providers: state.providers.map(({ provider, label, enabled }) => ({
          provider,
          label,
          configured: false,
          enabled,
        })),
      }),
    },
  ),
)

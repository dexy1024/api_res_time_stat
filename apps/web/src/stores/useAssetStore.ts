import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UploadedAsset } from '@/types'

interface AssetState {
  assets: UploadedAsset[]
  selectedAssetIds: string[]
  addAsset: (asset: UploadedAsset) => void
  removeAsset: (id: string) => void
  toggleAssetSelection: (id: string) => void
  clearSelection: () => void
  setSelectedAssetIds: (ids: string[]) => void
}

export const useAssetStore = create<AssetState>()(
  persist(
    (set) => ({
      assets: [],
      selectedAssetIds: [],
      addAsset: (asset) =>
        set((state) => ({
          assets: [asset, ...state.assets],
        })),
      removeAsset: (id) =>
        set((state) => ({
          assets: state.assets.filter((item) => item.id !== id),
          selectedAssetIds: state.selectedAssetIds.filter((item) => item !== id),
        })),
      toggleAssetSelection: (id) =>
        set((state) => ({
          selectedAssetIds: state.selectedAssetIds.includes(id)
            ? state.selectedAssetIds.filter((item) => item !== id)
            : [...state.selectedAssetIds, id],
        })),
      clearSelection: () => set({ selectedAssetIds: [] }),
      setSelectedAssetIds: (ids) => set({ selectedAssetIds: ids }),
    }),
    {
      name: 'video-studio-assets',
    },
  ),
)

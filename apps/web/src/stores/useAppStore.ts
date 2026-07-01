import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { VideoTask } from '@/types'

interface AppState {
  sidebarCollapsed: boolean
  currentTaskId: string | null
  recentTasks: VideoTask[]
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentTaskId: (taskId: string | null) => void
  upsertTask: (task: VideoTask) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      currentTaskId: null,
      recentTasks: [],
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setCurrentTaskId: (taskId) => set({ currentTaskId: taskId }),
      upsertTask: (task) =>
        set((state) => {
          const others = state.recentTasks.filter((item) => item.id !== task.id)
          return { recentTasks: [task, ...others].slice(0, 20) }
        }),
    }),
    {
      name: 'video-studio-app',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        recentTasks: state.recentTasks,
      }),
    },
  ),
)

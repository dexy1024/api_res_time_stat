import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { AppLayout } from '@/components/AppLayout'
import { AssetsPage } from '@/pages/AssetsPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { TasksPage } from '@/pages/TasksPage'
import { VideoPage } from '@/pages/VideoPage'

const rootRoute = createRootRoute({
  component: AppLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardPage,
})

const videoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/video',
  component: VideoPage,
})

const assetsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/assets',
  component: AssetsPage,
})

const tasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tasks',
  component: TasksPage,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  videoRoute,
  assetsRoute,
  tasksRoute,
  settingsRoute,
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

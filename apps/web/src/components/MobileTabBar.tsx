import {
  DashboardOutlined,
  FileImageOutlined,
  HistoryOutlined,
  SettingOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Link, useRouterState } from '@tanstack/react-router'

const tabs = [
  { key: '/', label: '工作台', icon: DashboardOutlined },
  { key: '/video', label: '生成', icon: VideoCameraOutlined },
  { key: '/assets', label: '素材', icon: FileImageOutlined },
  { key: '/tasks', label: '任务', icon: HistoryOutlined },
  { key: '/settings', label: '配置', icon: SettingOutlined },
]

export function MobileTabBar() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = pathname === tab.key
          return (
            <Link
              key={tab.key}
              to={tab.key}
              className={`flex flex-col items-center justify-center py-2 text-xs ${
                active ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <Icon className="text-lg" />
              <span className="mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

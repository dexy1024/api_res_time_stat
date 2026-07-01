import {
  CloudUploadOutlined,
  DashboardOutlined,
  FileImageOutlined,
  HistoryOutlined,
  MenuOutlined,
  SettingOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Drawer, Layout, Menu, Typography } from 'antd'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import { useState } from 'react'
import { MobileTabBar } from '@/components/MobileTabBar'
import { StaticDemoBanner } from '@/components/StaticDemoBanner'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useAppStore } from '@/stores/useAppStore'

const { Header, Sider, Content } = Layout

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">工作台</Link> },
  { key: '/video', icon: <VideoCameraOutlined />, label: <Link to="/video">视频生成</Link> },
  { key: '/assets', icon: <FileImageOutlined />, label: <Link to="/assets">素材管理</Link> },
  { key: '/tasks', icon: <HistoryOutlined />, label: <Link to="/tasks">任务历史</Link> },
  { key: '/settings', icon: <SettingOutlined />, label: <Link to="/settings">服务配置</Link> },
]

export function AppLayout() {
  const isMobile = useIsMobile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed)
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={[pathname]}
      items={menuItems}
      onClick={() => setDrawerOpen(false)}
    />
  )

  return (
    <Layout className="min-h-screen">
      {!isMobile && (
        <Sider collapsible collapsed={collapsed} onCollapse={setSidebarCollapsed} theme="light">
          <div className="flex h-16 items-center justify-center px-4">
            <CloudUploadOutlined className="text-xl text-blue-500" />
            {!collapsed && (
              <Typography.Text strong className="ml-2">
                视频工作台
              </Typography.Text>
            )}
          </div>
          {menu}
        </Sider>
      )}

      <Layout className={isMobile ? 'pb-16' : ''}>
        <Header className="flex items-center justify-between bg-white px-4 shadow-sm md:px-6">
          <div className="flex items-center gap-3">
            {isMobile && (
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-200"
                onClick={() => setDrawerOpen(true)}
                aria-label="打开菜单"
              >
                <MenuOutlined />
              </button>
            )}
            <Typography.Title level={isMobile ? 5 : 4} className="!mb-0">
              AI 视频生成
            </Typography.Title>
          </div>
          {isMobile && <CloudUploadOutlined className="text-lg text-blue-500" />}
        </Header>

        <Content className="m-2 rounded-lg bg-white p-3 shadow-sm md:m-4 md:p-6">
          <StaticDemoBanner />
          <Outlet />
        </Content>
      </Layout>

      {isMobile && <MobileTabBar />}

      <Drawer
        title="视频工作台"
        placement="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={280}
      >
        {menu}
      </Drawer>
    </Layout>
  )
}

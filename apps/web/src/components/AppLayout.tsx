import {
  CloudUploadOutlined,
  DashboardOutlined,
  FileImageOutlined,
  HistoryOutlined,
  SettingOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Layout, Menu, Typography } from 'antd'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
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
  const collapsed = useAppStore((state) => state.sidebarCollapsed)
  const setSidebarCollapsed = useAppStore((state) => state.setSidebarCollapsed)
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <Layout className="min-h-screen">
      <Sider collapsible collapsed={collapsed} onCollapse={setSidebarCollapsed} theme="light">
        <div className="flex h-16 items-center justify-center px-4">
          <CloudUploadOutlined className="text-xl text-blue-500" />
          {!collapsed && (
            <Typography.Text strong className="ml-2">
              视频工作台
            </Typography.Text>
          )}
        </div>
        <Menu mode="inline" selectedKeys={[pathname]} items={menuItems} />
      </Sider>
      <Layout>
        <Header className="flex items-center bg-white px-6 shadow-sm">
          <Typography.Title level={4} className="!mb-0">
            AI 视频生成后台
          </Typography.Title>
        </Header>
        <Content className="m-4 rounded-lg bg-white p-6 shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

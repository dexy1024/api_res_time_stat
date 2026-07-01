import { Alert } from 'antd'
import { isStaticDemoMode } from '@/services/api'

export function StaticDemoBanner() {
  if (!isStaticDemoMode) {
    return null
  }

  return (
    <Alert
      type="warning"
      showIcon
      className="mb-4"
      message="GitHub Pages 静态演示模式"
      description="当前页面可在手机与电脑浏览器访问。完整功能（上传、生成视频）需要单独部署后端，并在构建时配置 VITE_API_BASE_URL。"
    />
  )
}

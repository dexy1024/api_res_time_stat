import { Alert, Card, Col, Row, Statistic, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { fetchProviderStatus, fetchVideoTasks, isStaticDemoMode } from '@/services/api'
import { useAppStore } from '@/stores/useAppStore'
import { useAssetStore } from '@/stores/useAssetStore'
import { useProviderStore } from '@/stores/useProviderStore'

export function DashboardPage() {
  const recentTasks = useAppStore((state) => state.recentTasks)
  const assets = useAssetStore((state) => state.assets)
  const defaultProvider = useProviderStore((state) => state.defaultProvider)

  const { data: tasks = [] } = useQuery({
    queryKey: ['video-tasks'],
    queryFn: fetchVideoTasks,
    enabled: !isStaticDemoMode,
  })

  const { data: providers = [] } = useQuery({
    queryKey: ['provider-status'],
    queryFn: fetchProviderStatus,
    enabled: !isStaticDemoMode,
  })

  const displayProviders =
    providers.length > 0
      ? providers
      : [
          { provider: 'aliyun' as const, label: '阿里云（通义万相）', configured: false, enabled: true },
          { provider: 'jimeng' as const, label: '字节跳动（即梦 AI）', configured: false, enabled: true },
        ]

  const completedCount = tasks.filter((item) => item.status === 'completed').length
  const processingCount = tasks.filter((item) => item.status === 'processing').length

  return (
    <div className="space-y-4">
      <Typography.Title level={3}>工作台</Typography.Title>
      <Typography.Paragraph type="secondary">
        上传图片与文档，选择阿里云或即梦 AI 服务，生成你想要的视频内容。
      </Typography.Paragraph>

      <Alert
        type="info"
        showIcon
        message="部署说明"
        description="前端可静态部署（如 GitHub Pages）；API Key 必须通过后端服务代理，不能写在前端代码里。"
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="素材数量" value={assets.length} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="已完成任务" value={completedCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="进行中任务" value={processingCount} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="默认服务商"
              value={defaultProvider === 'aliyun' ? '阿里云' : '即梦 AI'}
            />
          </Card>
        </Col>
      </Row>

      <Card title="服务连接状态">
        <Row gutter={[16, 16]}>
          {displayProviders.map((item) => (
            <Col key={item.provider} xs={24} md={12}>
              <Card size="small">
                <Typography.Text strong>{item.label}</Typography.Text>
                <div className="mt-2">
                  配置状态：{item.configured ? '已配置' : '待配置 API Key'}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="最近任务（本地缓存）">
        {recentTasks.length === 0 ? (
          <Typography.Text type="secondary">暂无本地缓存任务，前往「视频生成」创建。</Typography.Text>
        ) : (
          recentTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="mb-2 flex justify-between border-b pb-2 last:border-0">
              <span>{task.title}</span>
              <span>{task.status}</span>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}

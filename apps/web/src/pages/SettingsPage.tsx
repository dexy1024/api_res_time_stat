import { useQuery } from '@tanstack/react-query'
import { Alert, Card, Radio, Switch, Typography } from 'antd'
import { useEffect } from 'react'
import { fetchProviderStatus } from '@/services/api'
import { useProviderStore } from '@/stores/useProviderStore'
import type { VideoProvider } from '@/types'

export function SettingsPage() {
  const defaultProvider = useProviderStore((state) => state.defaultProvider)
  const setDefaultProvider = useProviderStore((state) => state.setDefaultProvider)
  const providers = useProviderStore((state) => state.providers)
  const toggleProvider = useProviderStore((state) => state.toggleProvider)
  const syncProviderStatus = useProviderStore((state) => state.syncProviderStatus)

  const { data: remoteProviders = [] } = useQuery({
    queryKey: ['provider-status'],
    queryFn: fetchProviderStatus,
  })

  useEffect(() => {
    if (remoteProviders.length > 0) {
      syncProviderStatus(remoteProviders)
    }
  }, [remoteProviders, syncProviderStatus])

  return (
    <div className="space-y-4">
      <Typography.Title level={3}>服务配置</Typography.Title>

      <Alert
        type="info"
        showIcon
        message="API Key 配置方式"
        description={
          <div>
            <p>请在服务端环境变量中配置，不要写入前端：</p>
            <ul className="list-disc pl-5">
              <li>ALIYUN_API_KEY — 阿里云通义万相</li>
              <li>JIMENG_API_KEY — 字节跳动即梦 AI</li>
            </ul>
          </div>
        }
      />

      <Card title="默认 AI 服务商">
        <Radio.Group
          value={defaultProvider}
          onChange={(event) => setDefaultProvider(event.target.value as VideoProvider)}
        >
          <Radio value="aliyun">阿里云（通义万相）</Radio>
          <Radio value="jimeng">字节跳动（即梦 AI）</Radio>
        </Radio.Group>
      </Card>

      <Card title="服务商开关">
        {providers.map((item) => (
          <div key={item.provider} className="mb-4 flex items-center justify-between">
            <div>
              <Typography.Text strong>{item.label}</Typography.Text>
              <div className="text-gray-500">
                {item.configured ? '后端已配置 API Key' : '等待你在服务端填入 API Key'}
              </div>
            </div>
            <Switch
              checked={item.enabled}
              onChange={(checked) => toggleProvider(item.provider, checked)}
            />
          </div>
        ))}
      </Card>
    </div>
  )
}

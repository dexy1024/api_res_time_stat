import { InboxOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Alert, Button, Card, Form, Input, Select, Typography, Upload, message } from 'antd'
import type { UploadFile } from 'antd'
import { useState } from 'react'
import { createVideoTask } from '@/services/api'
import { useAppStore } from '@/stores/useAppStore'
import { useAssetStore } from '@/stores/useAssetStore'
import { useProviderStore } from '@/stores/useProviderStore'
import type { VideoProvider } from '@/types'

const { Dragger } = Upload
const { TextArea } = Input

export function VideoPage() {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const assets = useAssetStore((state) => state.assets)
  const selectedAssetIds = useAssetStore((state) => state.selectedAssetIds)
  const setSelectedAssetIds = useAssetStore((state) => state.setSelectedAssetIds)
  const defaultProvider = useProviderStore((state) => state.defaultProvider)
  const providers = useProviderStore((state) => state.providers)
  const upsertTask = useAppStore((state) => state.upsertTask)

  const createMutation = useMutation({
    mutationFn: createVideoTask,
    onSuccess: (task) => {
      upsertTask(task)
      message.success('视频任务已创建，等待生成')
      form.resetFields(['title', 'prompt'])
    },
    onError: () => {
      message.error('任务创建失败，请检查后端服务与 API Key 配置')
    },
  })

  const enabledProviders = providers.filter((item) => item.enabled)

  return (
    <div className="space-y-4">
      <Typography.Title level={3}>视频生成</Typography.Title>
      <Typography.Paragraph type="secondary">
        上传参考图片或文档，填写提示词，选择阿里云（通义万相）或字节即梦 AI 生成视频。
      </Typography.Paragraph>

      <Alert
        type="warning"
        showIcon
        message="API Key 将在后端配置"
        description="你后续提供的阿里云 / 即梦 API Key 会写入服务端环境变量，前端不会保存密钥。"
      />

      <Card title="创建视频任务">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ provider: defaultProvider }}
          onFinish={(values) => {
            createMutation.mutate({
              title: values.title,
              provider: values.provider as VideoProvider,
              prompt: values.prompt,
              assetIds: selectedAssetIds,
            })
          }}
        >
          <Form.Item
            label="任务名称"
            name="title"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="例如：产品宣传视频 v1" />
          </Form.Item>

          <Form.Item
            label="AI 服务商"
            name="provider"
            rules={[{ required: true, message: '请选择服务商' }]}
          >
            <Select
              options={enabledProviders.map((item) => ({
                value: item.provider,
                label: `${item.label}${item.configured ? '' : '（待配置）'}`,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="提示词 / 脚本描述"
            name="prompt"
            rules={[{ required: true, message: '请输入视频描述或脚本' }]}
          >
            <TextArea rows={5} placeholder="描述你想要的视频画面、节奏、风格..." />
          </Form.Item>

          <Form.Item label="关联已有素材">
            <Select
              mode="multiple"
              placeholder="从素材库选择"
              value={selectedAssetIds}
              onChange={setSelectedAssetIds}
              options={assets.map((item) => ({
                value: item.id,
                label: `${item.name} (${item.type})`,
              }))}
            />
          </Form.Item>

          <Form.Item label="上传参考文件（可选）">
            <Dragger
              multiple
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList: nextList }) => setFileList(nextList)}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽图片、文档到此处</p>
              <p className="ant-upload-hint">支持 PNG、JPG、PDF、DOCX 等格式（后续接入上传 API）</p>
            </Dragger>
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
            开始生成视频
          </Button>
        </Form>
      </Card>
    </div>
  )
}

import { DeleteOutlined, UploadOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { Button, Card, Space, Table, Tag, Typography, Upload, message } from 'antd'
import type { UploadProps } from 'antd'
import { uploadAsset } from '@/services/api'
import { useAssetStore } from '@/stores/useAssetStore'
import type { UploadedAsset } from '@/types'

export function AssetsPage() {
  const assets = useAssetStore((state) => state.assets)
  const addAsset = useAssetStore((state) => state.addAsset)
  const removeAsset = useAssetStore((state) => state.removeAsset)
  const selectedAssetIds = useAssetStore((state) => state.selectedAssetIds)
  const toggleAssetSelection = useAssetStore((state) => state.toggleAssetSelection)

  const uploadMutation = useMutation({
    mutationFn: uploadAsset,
    onSuccess: (result, file) => {
      const asset: UploadedAsset = {
        id: result.assetId,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'document',
        mimeType: file.type,
        size: file.size,
        previewUrl: result.previewUrl,
        createdAt: new Date().toISOString(),
      }
      addAsset(asset)
      message.success(`${file.name} 上传成功`)
    },
    onError: () => message.error('上传失败'),
  })

  const uploadProps: UploadProps = {
    showUploadList: false,
    beforeUpload: (file) => {
      uploadMutation.mutate(file)
      return false
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Typography.Title level={3}>素材管理</Typography.Title>
          <Typography.Paragraph type="secondary">
            管理你提供的图片与文档，供视频生成任务引用。
          </Typography.Paragraph>
        </div>
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={uploadMutation.isPending}>
            上传素材
          </Button>
        </Upload>
      </div>

      <Card>
        <Table
          rowKey="id"
          dataSource={assets}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: '文件名', dataIndex: 'name' },
            {
              title: '类型',
              dataIndex: 'type',
              render: (value: UploadedAsset['type']) => (
                <Tag color={value === 'image' ? 'blue' : 'green'}>
                  {value === 'image' ? '图片' : '文档'}
                </Tag>
              ),
            },
            {
              title: '大小',
              dataIndex: 'size',
              render: (size: number) => `${(size / 1024).toFixed(1)} KB`,
            },
            {
              title: '选中',
              render: (_, record) => (
                <Button
                  size="small"
                  type={selectedAssetIds.includes(record.id) ? 'primary' : 'default'}
                  onClick={() => toggleAssetSelection(record.id)}
                >
                  {selectedAssetIds.includes(record.id) ? '已选' : '选择'}
                </Button>
              ),
            },
            {
              title: '操作',
              render: (_, record) => (
                <Space>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => removeAsset(record.id)}
                  />
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

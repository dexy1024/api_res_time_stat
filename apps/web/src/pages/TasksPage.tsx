import { useQuery } from '@tanstack/react-query'
import { Card, Table, Tag, Typography } from 'antd'
import { fetchVideoTasks } from '@/services/api'
import type { TaskStatus, VideoProvider } from '@/types'

const statusColor: Record<TaskStatus, string> = {
  pending: 'default',
  processing: 'processing',
  completed: 'success',
  failed: 'error',
}

const providerLabel: Record<VideoProvider, string> = {
  aliyun: '阿里云',
  jimeng: '即梦 AI',
}

export function TasksPage() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['video-tasks'],
    queryFn: fetchVideoTasks,
    refetchInterval: 5000,
  })

  return (
    <div className="space-y-4">
      <Typography.Title level={3}>任务历史</Typography.Title>
      <Typography.Paragraph type="secondary">
        查看所有视频生成任务的状态与结果（数据存储在 SQLite 后端）。
      </Typography.Paragraph>

      <Card>
        <Table
          rowKey="id"
          loading={isLoading}
          dataSource={tasks}
          pagination={{ pageSize: 10 }}
          columns={[
            { title: '任务名称', dataIndex: 'title' },
            {
              title: '服务商',
              dataIndex: 'provider',
              render: (value: VideoProvider) => providerLabel[value],
            },
            {
              title: '状态',
              dataIndex: 'status',
              render: (value: TaskStatus) => <Tag color={statusColor[value]}>{value}</Tag>,
            },
            { title: '创建时间', dataIndex: 'createdAt' },
            {
              title: '结果',
              dataIndex: 'resultUrl',
              render: (value?: string) =>
                value ? (
                  <a href={value} target="_blank" rel="noreferrer">
                    查看视频
                  </a>
                ) : (
                  '-'
                ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

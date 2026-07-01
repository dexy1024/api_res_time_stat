-- 视频生成任务
CREATE TABLE IF NOT EXISTS video_tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  prompt TEXT,
  asset_ids TEXT,
  result_url TEXT,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- 上传素材元信息
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  mime_type TEXT,
  size INTEGER,
  storage_path TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

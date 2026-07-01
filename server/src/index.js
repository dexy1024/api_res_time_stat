import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import { nanoid } from 'nanoid'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Database from 'better-sqlite3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/studio.db')
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new Database(dbPath)
const schema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf-8')
db.exec(schema)

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({ dest: uploadDir })

app.use(cors())
app.use(express.json())

function getProviderStatus() {
  return [
    {
      provider: 'aliyun',
      label: '阿里云（通义万相）',
      configured: Boolean(process.env.ALIYUN_API_KEY),
      enabled: true,
    },
    {
      provider: 'jimeng',
      label: '字节跳动（即梦 AI）',
      configured: Boolean(process.env.JIMENG_API_KEY),
      enabled: true,
    },
  ]
}

function mapTask(row) {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    status: row.status,
    prompt: row.prompt,
    assetIds: row.asset_ids ? JSON.parse(row.asset_ids) : [],
    resultUrl: row.result_url,
    errorMessage: row.error_message,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/providers/status', (_req, res) => {
  res.json({ providers: getProviderStatus() })
})

app.get('/api/video/tasks', (_req, res) => {
  const rows = db.prepare('SELECT * FROM video_tasks ORDER BY created_at DESC').all()
  res.json({ tasks: rows.map(mapTask) })
})

app.get('/api/video/tasks/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM video_tasks WHERE id = ?').get(req.params.id)
  if (!row) {
    res.status(404).json({ error: 'Task not found' })
    return
  }
  res.json({ task: mapTask(row) })
})

app.post('/api/video/tasks', async (req, res) => {
  const { title, provider, prompt, assetIds = [] } = req.body

  if (!title || !provider || !prompt) {
    res.status(400).json({ error: 'title, provider, prompt are required' })
    return
  }

  const apiKey =
    provider === 'aliyun' ? process.env.ALIYUN_API_KEY : process.env.JIMENG_API_KEY

  if (!apiKey) {
    res.status(400).json({
      error: `Provider ${provider} API key not configured on server`,
    })
    return
  }

  const id = nanoid()
  const now = new Date().toISOString()

  db.prepare(
    `INSERT INTO video_tasks (id, title, provider, status, prompt, asset_ids, created_at, updated_at)
     VALUES (?, ?, ?, 'processing', ?, ?, ?, ?)`,
  ).run(id, title, provider, prompt, JSON.stringify(assetIds), now, now)

  // TODO: 接入阿里云通义万相 / 即梦 AI 真实 API
  // 当前为框架占位：模拟异步完成
  setTimeout(() => {
    db.prepare(
      `UPDATE video_tasks SET status = 'completed', result_url = ?, updated_at = ? WHERE id = ?`,
    ).run(`https://example.com/video/${id}.mp4`, new Date().toISOString(), id)
  }, 3000)

  const row = db.prepare('SELECT * FROM video_tasks WHERE id = ?').get(id)
  res.status(201).json({ task: mapTask(row) })
})

app.post('/api/assets/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' })
    return
  }

  const id = nanoid()
  db.prepare(
    `INSERT INTO assets (id, name, type, mime_type, size, storage_path)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    req.file.originalname,
    req.file.mimetype.startsWith('image/') ? 'image' : 'document',
    req.file.mimetype,
    req.file.size,
    req.file.path,
  )

  res.json({
    assetId: id,
    previewUrl: req.file.mimetype.startsWith('image/') ? `/uploads/${path.basename(req.file.path)}` : undefined,
  })
})

app.listen(PORT, () => {
  console.log(`Video studio API running at http://localhost:${PORT}`)
})

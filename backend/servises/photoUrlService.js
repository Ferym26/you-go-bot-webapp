import express from 'express'
import { Bot } from 'grammy'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

// Инициализация Express и бота
const app = express()
const bot = new Bot(process.env.BOT_TOKEN)

// Middleware
app.use(cors())
app.use(express.json())

// Endpoint для получения фото
app.get('/api/photo/:fileId', async (req, res) => {
  try {
    const file = await bot.api.getFile(req.params.fileId)
    const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`
    res.json({ url })
  } catch (error) {
    console.error('Error getting file:', error)
    res.status(400).json({ error: 'Invalid file ID' })
  }
})

const PORT = 8585
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
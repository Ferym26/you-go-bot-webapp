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

// Endpoint для получения аватара пользователя
app.get('/api/avatar/:userId', async (req, res) => {
	try {
		const photos = await bot.api.getUserProfilePhotos(req.params.userId);
		if (photos?.total_count > 0) {
			const file = await bot.api.getFile(photos.photos[0][0].file_id)
			res.json({ url: `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}` })
		} else {
			res.status(400).json({ error: 'No avatar' });
		}
	} catch (error) {
		console.error('Error getting file:', error);
		res.status(400).json({ error: 'No avatar' })
	}
})

const PORT = 8585
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})
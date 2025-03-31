import { db } from '../utils/firebase.js';
import { getDocs, collection } from 'firebase/firestore';
import { parseTimestamp } from '../utils/timestampFormatter.js';

export function registerPassenger(bot) {
	bot.callbackQuery('role_passenger', async (ctx) => {
		await ctx.answerCallbackQuery();

		await ctx.reply("Выберите действие:", {
			reply_markup: {
				inline_keyboard: [
					[{ text: "🆕 Создать заявку", web_app: { url: `${process.env.WEBAPP_URL}/create-transfer-request` } }],
					[{ text: "📋 Показать мои заявки", callback_data: "show_my_requests" }],
					[{ text: "🗑️ Удалить заявку", callback_data: "delete_request" }],
					[{ text: "Показать все заявки", web_app: { url: `${process.env.WEBAPP_URL}/requests` } }],
					[{ text: "Показать все поездки", web_app: { url: `${process.env.WEBAPP_URL}/trips` } }],
				]
			}
		});
	});

	// Show my requests
	bot.callbackQuery('show_my_requests', async (ctx) => {
		await ctx.answerCallbackQuery();

		const userId = ctx.from.id;
		const querySnapshot = await getDocs(collection(db, 'transfer-requests'));
		const userRequests = [];

		querySnapshot.forEach(doc => {
			const data = doc.data();
			if (data.userId === userId) {
				userRequests.push({ id: doc.id, ...data });
			}
		});

		if (userRequests.length === 0) {
			return ctx.reply("🚫 У вас нет активных заявок.");
		}

		let message = "📋 Ваши заявки:\n";
		userRequests.forEach((req, index) => {
			message += `📌 ${index + 1}. ${req.locationFrom} → ${req.locationTo}, ${parseTimestamp(req.datetime.seconds)}\n`;
		});
		await ctx.reply(message);
	});
}
const helloMessage = `
	🚖 You Go – ваш помощник в поиске междугородних поездок!

	👋 Добро пожаловать в You Go!
	Это бот для поиска поездок между городами и локациями в Грузии.
	Вы можете найти водителя или разместить своё предложение в несколько кликов.

	⚠ Бот находится в стадии разработки
	Функционал может изменяться, добавляться и улучшаться.
	Мы будем рады вашим отзывам и предложениям!

	🎉 Сейчас сервис полностью бесплатный!
	Воспользуйтесь возможностью протестировать его без ограничений.

	Выберите роль:
`;

import { db } from '../utils/firebase.js';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export function start(bot) {
    bot.command('start', async (ctx) => {
        await ctx.reply(helloMessage, {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: '👤 Пассажир', callback_data: 'role_passenger' }],
                    [{ text: '🚗 Водитель', callback_data: 'role_driver' }],
                ]
            }
        });

        // await ctx.reply("Привет!", {
        //     reply_markup: {
        //       inline_keyboard: [[
        //         {
        //           text: "Открыть приложение",
        //           web_app: { url: "https://faithful-kid-apt.ngrok-free.app" },
        //         }
        //       ]]
        //     }
        // });
    });

    // bot.callbackQuery('role_passenger', async (ctx) => {
	// 	await ctx.answerCallbackQuery();

    //     await ctx.reply("Выберите действие:", {
    //         reply_markup: {
    //             inline_keyboard: [
    //                 [{ text: "🆕 Создать заявку", callback_data: "create_transfer_request" }],
    //                 [{ text: "📋 Показать мои заявки", callback_data: "show_my_requests" }],
    //                 [{ text: "🗑️ Удалить заявку", callback_data: "delete_request" }],
    //             ]
    //         }
    //     });
    // });



    // bot.callbackQuery('delete_request', async (ctx) => {
	// 	await ctx.answerCallbackQuery();

    //     const userId = ctx.from.id;
    //     const querySnapshot = await getDocs(collection(db, 'transfer-requests'));
    //     const userRequests = [];

    //     querySnapshot.forEach(doc => {
    //         const data = doc.data();
    //         if (data.userId === userId) {
    //             userRequests.push({ id: doc.id, ...data });
    //         }
    //     });

    //     if (userRequests.length === 0) {
    //         return ctx.reply("У вас нет активных заявок для удаления.");
    //     }

    //     await ctx.reply("Выберите заявку для удаления:", {
    //         reply_markup: {
    //             inline_keyboard: userRequests.map(req => [
    //                 { text: `${req.from} → ${req.to}, ${req.datetime}`, callback_data: `delete_${req.id}` }
    //             ])
    //         }
    //     });
    // });

    // bot.callbackQuery(/delete_(.+)/, async (ctx) => {
	// 	await ctx.answerCallbackQuery();

    //     const requestId = ctx.match[1];
    //     await deleteDoc(doc(db, 'transfer-requests', requestId));
    //     await ctx.reply("✅ Заявка удалена!");
    // });
}

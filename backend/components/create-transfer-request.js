import { db } from '../utils/firebase.js';
import { collection, addDoc } from 'firebase/firestore';

const defaultCities = ["Тбилиси", "Батуми", "Кутаиси"];
const sessions = new Map();

export const createTransferRequest = (bot) => {
    bot.command('create_transfer_request', async (ctx) => {
        sessions.set(ctx.from.id, { step: 1, data: {} });
        await ctx.reply("Выберите город отправления:", {
            reply_markup: {
                inline_keyboard: [
                    ...defaultCities.map(place => [{ text: place, callback_data: `from_${place}` }]),
                    [{ text: "Указать вручную", callback_data: "from_manual" }]
                ]
            }
        });
    });

    bot.callbackQuery(/from_(.+)/, async (ctx) => {
		await ctx.answerCallbackQuery();

        const place = ctx.match[1];
        const userId = ctx.from.id;
        const session = sessions.get(userId);

        if (place === "manual") {
            session.step = 1.5;
            return ctx.reply("Введите город отправления вручную:");
        }

        session.data.from = place;
        session.step = 2;
        await ctx.reply("Выберите город прибытия:", {
            reply_markup: {
                inline_keyboard: [
                    ...defaultCities.map(place => [{ text: place, callback_data: `to_${place}` }]),
                    [{ text: "Указать вручную", callback_data: "to_manual" }]
                ]
            }
        });
    });

    bot.callbackQuery(/to_(.+)/, async (ctx) => {
		await ctx.answerCallbackQuery();

        const place = ctx.match[1];
        const userId = ctx.from.id;
        const session = sessions.get(userId);

        if (place === "manual") {
            session.step = 2.5;
            return ctx.reply("Введите город прибытия вручную:");
        }

        session.data.to = place;
        session.step = 3;
        await ctx.reply("Введите число, месяц и время в формате ДД.ММ ч:м (например, 04.03 14:30):");
    });

    bot.on("message", async (ctx) => {
        const userId = ctx.from.id;
        const session = sessions.get(userId);
        if (!session) return;

        if (session.step === 1.5) {
            session.data.from = ctx.message.text;
            session.step = 2;
            return ctx.reply("Выберите город прибытия:", {
                reply_markup: {
                    inline_keyboard: [
                        ...defaultCities.map(place => [{ text: place, callback_data: `to_${place}` }]),
                        [{ text: "Указать вручную", callback_data: "to_manual" }]
                    ]
                }
            });
        }

        if (session.step === 2.5) {
            session.data.to = ctx.message.text;
            session.step = 3;
            return ctx.reply("Введите число, месяц и время в формате ДД.ММ ч:м (например, 04.03 14:30):");
        }

        if (session.step === 3) {
            session.data.datetime = ctx.message.text;
            session.step = 4;
            await ctx.reply("Укажите количество мест:", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "1", callback_data: "seats_1" }],
                        [{ text: "2", callback_data: "seats_2" }],
                        [{ text: "3", callback_data: "seats_3" }],
                        [{ text: "4", callback_data: "seats_4" }],
                        [{ text: "Другое", callback_data: "seats_manual" }]
                    ]
                }
            });
        }
    });

    bot.callbackQuery(/seats_(.+)/, async (ctx) => {
		await ctx.answerCallbackQuery();

        const seats = ctx.match[1];
        const userId = ctx.from.id;
        const session = sessions.get(userId);

        if (seats === "manual") {
            session.step = 5;
            return ctx.reply("Введите количество мест вручную:");
        }

        session.data.seats = seats;
        session.step = 6;
        await ctx.reply("Есть ли багаж?", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Да", callback_data: "luggage_yes" }],
                    [{ text: "Нет", callback_data: "luggage_no" }]
                ]
            }
        });
    });

    bot.callbackQuery(/luggage_(.+)/, async (ctx) => {
		await ctx.answerCallbackQuery();

        const luggage = ctx.match[1] === "yes";
        const userId = ctx.from.id;
        const session = sessions.get(userId);
        session.data.luggage = luggage;

        const requestSummary = `
			📍 Откуда: ${session.data.from}
			🏁 Куда: ${session.data.to}
			📅 Дата и время: ${session.data.datetime}
			👥 Кол-во мест: ${session.data.seats}
			🎒 Багаж: ${session.data.luggage ? "Да" : "Нет"}
		`;

        await ctx.reply(`Проверьте данные перед отправкой:\n${requestSummary}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Отправить", callback_data: "confirm_request" }],
                    [{ text: "✏️ Редактировать", callback_data: "edit_request" }]
                ]
            }
        });
    });

	bot.callbackQuery("confirm_request", async (ctx) => {
		await ctx.answerCallbackQuery();

        const userId = ctx.from.id;
        const session = sessions.get(userId);
        if (!session) return;

        await addDoc(collection(db, 'transfer-requests'), {
			userId,
			...session.data,
			status: "waiting",
		});
        await ctx.reply("✅ Ваша заявка создана!");
        sessions.delete(userId);
    });

    bot.callbackQuery("edit_request", async (ctx) => {
		await ctx.answerCallbackQuery();
		
        const userId = ctx.from.id;
        const session = sessions.get(userId);
        if (!session) return;

        session.step = 1;
        await ctx.reply("Редактирование начато. Выберите город отправления:", {
            reply_markup: {
                inline_keyboard: [
                    ...defaultCities.map(place => [{ text: place, callback_data: `from_${place}` }]),
                    [{ text: "Указать вручную", callback_data: "from_manual" }]
                ]
            }
        });
    });
};

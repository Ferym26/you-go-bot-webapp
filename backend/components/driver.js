import { db } from '../utils/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const sessions = new Map();

export function registerDriver(bot) {
    // Обработка выбора роли "водитель"
    bot.callbackQuery('role_driver', async (ctx) => {
        await ctx.answerCallbackQuery();
        const userId = ctx.from.id;
        const driverRef = doc(db, 'drivers', String(userId));
        const driverDoc = await getDoc(driverRef);

        if (!driverDoc.exists()) {
            sessions.set(userId, { type: 'driver', step: 'driver_create_profile', data: {} });
            return ctx.reply("Вы не зарегистрированы как водитель. Давайте создадим вашу анкету.", {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "Создать анкету", callback_data: "driver_create_profile" }]
                    ]
                }
            });
        }

        await ctx.reply("Выберите действие:", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Создать предложение о поездке", callback_data: "driver_create_trip" }],
                    [{ text: "Редактировать анкету", callback_data: "driver_edit_profile" }],
                    [{ text: "📄 Посмотреть анкету", callback_data: "driver_view_profile" }],
                ]
            }
        });
    });

    // Обработка начала создания анкеты
    bot.callbackQuery('driver_create_profile', async (ctx) => {
        await ctx.answerCallbackQuery();
        const userId = ctx.from.id;
        sessions.set(userId, { type: 'driver', step: 'driver_create_name', data: {} });
        await ctx.reply("Введите ваше имя:");
    });

    // Обработка начала редактирования анкеты
    bot.callbackQuery('driver_edit_profile', async (ctx) => {
        await ctx.answerCallbackQuery();
        const userId = ctx.from.id;
        const driverRef = doc(db, 'drivers', String(userId));
        const driverDoc = await getDoc(driverRef);

        if (!driverDoc.exists()) {
            return ctx.reply("Вы еще не зарегистрированы как водитель. Сначала создайте анкету.");
        }

        sessions.set(userId, { type: 'driver', step: 'driver_edit_profile', data: driverDoc.data() });
        await ctx.reply("Что вы хотите изменить?", {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Имя", callback_data: "driver_edit_name" }],
                    [{ text: "Автомобиль", callback_data: "driver_edit_car" }],
                    [{ text: "Фото машины", callback_data: "driver_edit_car_photo" }],
                    [{ text: "Описание", callback_data: "driver_edit_description" }]
                ]
            }
        });
    });

    // Обработка выбора поля для редактирования
    bot.callbackQuery(/driver_edit_(.+)/, async (ctx) => {
        await ctx.answerCallbackQuery();
        const userId = ctx.from.id;
        const field = ctx.match[1]; // Получаем поле, которое нужно изменить
        const session = sessions.get(userId);

        if (!session) {
            return ctx.reply("Сессия не найдена. Пожалуйста, начните редактирование заново.");
        }

        // Устанавливаем шаг и поле для редактирования
        session.step = `driver_edit_${field}`;
        sessions.set(userId, session);

        // Запрашиваем новое значение
        let prompt = "Введите новое значение:";
        if (field === "car_photo") {
            prompt = "Отправьте новое фото машины:";
        }
        await ctx.reply(prompt);
    });

    // Обработка входящих сообщений (и для создания, и для редактирования)
    bot.on("message", async (ctx) => {
        const userId = ctx.from.id;
        const session = sessions.get(userId);

        // Игнорируем сообщения, если сессия не начата или не относится к водителю
        if (!session || session.type !== 'driver') {
            return;
        }

        try {
            switch (session.step) {
                // Логика создания анкеты
                case 'driver_create_name':
                    session.data.name = ctx.message.text;
                    session.step = 'driver_create_car';
                    sessions.set(userId, session);
                    await ctx.reply("Введите марку, год и цвет вашего автомобиля (например, Toyota, 2018, черный):");
                    break;

                case 'driver_create_car':
                    session.data.carDetails = ctx.message.text;
                    session.step = 'driver_create_photo';
                    sessions.set(userId, session);
                    await ctx.reply("Отправьте фото вашей машины:");
                    break;

                case 'driver_create_photo':
                    if (!ctx.message.photo) {
                        return ctx.reply("Пожалуйста, отправьте фото машины.");
                    }
                    session.data.carPhoto = ctx.message.photo.pop().file_id;
                    session.step = 'driver_create_description';
                    sessions.set(userId, session);
                    await ctx.reply("Напишите краткое описание о себе и условиях перевозки:");
                    break;

                case 'driver_create_description':
                    session.data.description = ctx.message.text;
                    await setDoc(doc(db, 'drivers', String(userId)), session.data);
                    sessions.delete(userId);
                    await ctx.reply("✅ Ваша анкета создана! Теперь вы можете создавать поездки.", {
                        reply_markup: {
                            inline_keyboard: [
                                [{ text: "Создать поездку", callback_data: "driver_create_trip" }]
                            ]
                        }
                    });
                    break;

                // Логика редактирования анкеты
                case 'driver_edit_name':
                    session.data.name = ctx.message.text;
                    await setDoc(doc(db, 'drivers', String(userId)), session.data, { merge: true });
                    sessions.delete(userId);
                    await ctx.reply("✅ Имя успешно обновлено!");
                    break;

                case 'driver_edit_car':
                    session.data.carDetails = ctx.message.text;
                    await setDoc(doc(db, 'drivers', String(userId)), session.data, { merge: true });
                    sessions.delete(userId);
                    await ctx.reply("✅ Данные автомобиля успешно обновлены!");
                    break;

                case 'driver_edit_car_photo':
                    if (!ctx.message.photo) {
                        return ctx.reply("Пожалуйста, отправьте фото машины.");
                    }
                    session.data.carPhoto = ctx.message.photo.pop().file_id;
                    await setDoc(doc(db, 'drivers', String(userId)), session.data, { merge: true });
                    sessions.delete(userId);
                    await ctx.reply("✅ Фото машины успешно обновлено!");
                    break;

                case 'driver_edit_description':
                    session.data.description = ctx.message.text;
                    await setDoc(doc(db, 'drivers', String(userId)), session.data, { merge: true });
                    sessions.delete(userId);
                    await ctx.reply("✅ Описание успешно обновлено!");
                    break;

                default:
                    sessions.delete(userId);
                    await ctx.reply("❌ Неизвестная команда. Пожалуйста, начните заново.");
                    break;
            }
        } catch (error) {
            console.error("Ошибка:", error);
            await ctx.reply("❌ Произошла ошибка. Пожалуйста, попробуйте снова.");
        }
    });

    // Просмотр анкеты
    bot.callbackQuery("driver_view_profile", async (ctx) => {
        await ctx.answerCallbackQuery();
        const userId = ctx.from.id;
        const driverRef = doc(db, "drivers", String(userId));
        const driverDoc = await getDoc(driverRef);

        if (!driverDoc.exists()) {
            return ctx.reply("Вы еще не зарегистрированы как водитель.");
        }

        const driverData = driverDoc.data();
        const profileText = `
            🚗 <b>Ваш профиль водителя</b>
            👤 Имя: ${driverData.name}
            🚘 Автомобиль: ${driverData.carDetails}
            📄 Описание: ${driverData.description}
        `;

        if (driverData.carPhoto) {
            await ctx.replyWithPhoto(driverData.carPhoto, { caption: profileText, parse_mode: "HTML" });
        } else {
            await ctx.reply(profileText, { parse_mode: "HTML" });
        }
    });
}
import { db } from '../utils/firebase.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const profileTextGen = (data) => {
	return `
		<b>Ваш профиль водителя</b>
		👤 Имя: ${data.name}
		🧭 Стаж: ${data.experience}
		🚗 Автомобиль: ${data.carDetails}
		📄 Описание: ${data.description}
		🐱🐶 Домашние животные: ${data.petsAllowed ? 'Да' : 'Нет'}
		📞 Телефон: ${data.phoneNumber}
	`;
};

const driverMenu = [
	[{ text: "Мои поездки", web_app: { url: `${process.env.WEBAPP_URL}/driver-trip-list` } }],
	[{ text: "Создать поездкy", web_app: { url: `${process.env.WEBAPP_URL}/driver-create-trip` } }],
	[{ text: "Показать все заявки", web_app: { url: `${process.env.WEBAPP_URL}/requests` } }],
	[{ text: "Показать все поездки", web_app: { url: `${process.env.WEBAPP_URL}/trips` } }],
	[{ text: "Посмотреть анкету", callback_data: "driver_view_profile" }],
	[{ text: "Редактировать анкету", callback_data: "driver_edit_profile" }],
]

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
				inline_keyboard: driverMenu,
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
					[{ text: "Стаж", callback_data: "driver_edit_experience" }],
					[{ text: "Автомобиль", callback_data: "driver_edit_car" }],
					[{ text: "Фото машины", callback_data: "driver_edit_car_photo" }],
					[{ text: "Описание", callback_data: "driver_edit_description" }],
					[{ text: "Домашние животные", callback_data: "driver_edit_pets_allowed" }],
					[{ text: "Телефон", callback_data: "driver_edit_phone_number" }],
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
					session.step = 'driver_create_experience';
					sessions.set(userId, session);
					await ctx.reply("Укажите ваш стаж вождения (например: 5 лет):");
					break;

				case 'driver_create_experience':
					session.data.experience = ctx.message.text;
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
					session.step = 'driver_create_pets';
					sessions.set(userId, session);
					await ctx.reply("Готовы ли вы перевозить домашних животных?", {
						reply_markup: {
							inline_keyboard: [
								[
									{ text: "Да", callback_data: "pets_yes" },
									{ text: "Нет", callback_data: "pets_no" }
								]
							]
						}
					});
					break;

				case 'driver_create_phone':
					session.data.phoneNumber = ctx.message.text;
					await setDoc(doc(db, 'drivers', String(userId)), {
						...session.data,
						createdAt: new Date()
					});

					sessions.delete(userId);

					await ctx.reply("✅ Ваша анкета создана! Теперь вы можете создавать поездки.", {
						reply_markup: {
							inline_keyboard: driverMenu,
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

		if (driverData.carPhoto) {
			await ctx.replyWithPhoto(
				driverData.carPhoto,
				{
					caption: profileTextGen(driverData),
					parse_mode: "HTML",
				}
			);
		} else {
			await ctx.reply(
				profileTextGen(driverData),
				{
					parse_mode: "HTML",
				}
			);
		}
	});

	// Обработчик для кнопок выбора перевозки животных
	bot.callbackQuery(/pets_(yes|no)/, async (ctx) => {
		await ctx.answerCallbackQuery();
		const userId = ctx.from.id;
		const session = sessions.get(userId);

		if (!session || session.step !== 'driver_create_pets') {
			return ctx.reply("Произошла ошибка. Пожалуйста, начните регистрацию заново.");
		}

		session.data.petsAllowed = ctx.match[1] === 'yes';
		session.step = 'driver_create_phone';
		sessions.set(userId, session);

		await ctx.reply("Введите ваш номер телефона для связи:");
	});
}

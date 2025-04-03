<template>
	<div class="driver-profile">
		<div class="driver-profile__picture">
			<img
				class="driver-profile__image"
				src="../assets/images/driver-profile.jpg"
				alt="Driver Profile"
			>
		</div>
		<div class="driver-profile__info">
			<div class="driver-profile__info-item">
				<span class="driver-profile__info-item-label">Имя:</span>
				<span class="driver-profile__info-item-value">{{ driverData.userName }}</span>
			</div>
			<div class="driver-profile__info-item">
				<span class="driver-profile__info-item-label">Марка автомобиля:</span>
				<span class="driver-profile__info-item-value">Лексус J300 2024 3.0</span>
			</div>
			<div class="driver-profile__info-item">
				<span class="driver-profile__info-item-label">Описание:</span>
				<span class="driver-profile__info-item-value"></span>
			</div>
		</div>
		<div class="driver-profile__action">
			<el-button
				type="primary"
				size="large"
				@click="openChat"
			>
				Связаться с водителем
			</el-button>
		</div>
		<div class="driver-profile__contacts">
			<div class="driver-profile__contacts-item">
				<span class="driver-profile__contacts-item-label">Телефон:</span>
				<a class="driver-profile__contacts-item-value" href="tel:+995599123456">+995 599 123 456</a>
			</div>

		</div>
	</div>
</template>

<script setup>
import { useTelegram } from '../../composables/useTelegram';

const props = defineProps({
	driverData: {
		type: Object,
		required: true,
	}
});

const { tg, ready } = useTelegram();

const openChat = (user) => {
	if (!ready || !tg) {
		console.error('Telegram WebApp is not available');
		tg.showPopup({
			title: 'Ошибка',
			message: 'ощибка при открытии чата',
			buttons: [{type: 'ok'}]
		});
		return;
	}

	if (!user) {
		tg.showPopup({
			title: 'Ошибка',
			message: 'ID пользователя не найден',
			buttons: [{type: 'ok'}]
		});
		return;
	}

	try {
		const message = `Здравствуйте! Отвезите меня`;
		const encodedMessage = encodeURIComponent(message);
		tg.openTelegramLink(`https://t.me/${props.driverData.userName}?text=${encodedMessage}`);
	} catch (error) {
		console.error('Error opening chat:', error);
		tg.showPopup({
			title: 'Ошибка',
			message: 'Не удалось открыть чат с пользователем',
			buttons: [{type: 'ok'}]
		});
	}
}
</script>

<style src="./style.scss" lang="scss" scoped></style>


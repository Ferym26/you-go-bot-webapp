<template>
	<article
		class="request"
		@click="openChat(request.userName)"
	>
		<header class="request__header">
			<div class="request__route route">
				<span class="route__point">{{ setRealPlaceName(request.locationFrom) }}</span>
				<span class="route__arrow"> → </span>
				<span class="route__point">{{ setRealPlaceName(request.locationTo) }}</span>
			</div>
		</header>

		<div class="request__details details">
			<div class="details__item">
				<i class="details__icon fas fa-calendar"></i>
				<span class="details__text">{{ formatDate(request.datetime) }}</span>
			</div>
			<div class="details__item">
				<i class="details__icon fas fa-users"></i>
				<span class="details__text">{{ request.passengers }} пассажир(ов)</span>
			</div>
		</div>
		<!-- <div class="request__avatar">
			<img
				:src="request.avatar"
				:alt="request.name"
				class="request__avatar-img"
			>
		</div> -->
	</article>
</template>

<script setup>
import { computed } from 'vue';
import { useTelegram } from '../../composables/useTelegram';
import { formatDate } from '../../composables/formatDate';
import { setRealPlaceName } from '../../composables/setRealPlaceName';

const props = defineProps({
	request: {
		type: Object,
		required: true,
	}
});

const { tg, ready } = useTelegram();

const message = () => {
	return `Здравствуйте 👋
		Я по поводу вашей заявки:
		🗺️ ${setRealPlaceName(props.request.locationFrom)} ➡️ ${setRealPlaceName(props.request.locationTo)}
		🗓️ ${formatDate(props.request.datetime)}
		🟢 Готов вас отвезти
	`.replace(/^\s+/gm, '')
}

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
		const encodedMessage = encodeURIComponent(message());
		tg.openTelegramLink(`https://t.me/${user}?text=${encodedMessage}`);
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

<style src="./style.sass" lang="sass" scoped></style>

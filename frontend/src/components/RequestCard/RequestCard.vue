<template>
	<article
		class="request"
		@click="openChat(request.user)"
	>
		<header class="request__header">
			<div class="request__route route">
				<span class="route__point">{{ request.from }}</span>
				<span class="route__arrow"> → </span>
				<span class="route__point">{{ request.to }}</span>
			</div>
			<div class="request__status status" :class="statusClass">
				{{ statusText }}
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
	</article>
</template>

<script setup>
import { computed } from 'vue';
import { useTelegram } from '../../composables/useTelegram';

const props = defineProps({
	request: {
		type: Object,
		required: true
	}
});

const statusText = computed(() => {
	const statuses = {
		pending: 'Ожидает',
		accepted: 'Принята',
		completed: 'Завершена',
		cancelled: 'Отменена'
	};
	return statuses[props.request.status] || props.request.status;
});

const statusClass = computed(() => ({
	[`status--${props.request.status}`]: true
}));

const formatDate = (datetime) => {
	if (!datetime) return '';
	const timestamp = datetime?.seconds ? new Date(datetime.seconds * 1000) : new Date(datetime);

	return new Intl.DateTimeFormat('ru-RU', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit'
	}).format(timestamp);
};

const { tg, ready } = useTelegram();

const openChat = (user) => {
	if (!ready || !tg) {
		console.error('Telegram WebApp is not available');
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
		// tg.openTelegramLink(`https://t.me/${user}`)

		const message = `Здравствуйте! Я по поводу поездки ${props.request.from} → ${props.request.to} ${formatDate(props.request.datetime)}.`;
		const encodedMessage = encodeURIComponent(message);
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

<template>
	<article
		class="request"
		@click="openChat(request.user)"
	>
		<header class="request__header">
			<div class="request__route route">
				<span class="route__point">{{ request.from }}</span>
				<span class="route__arrow">→</span>
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
import { useTelegram } from '../composables/useTelegram';

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
		tg.openTelegramLink(`https://t.me/${user}`)
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

<style lang="scss" scoped>
.request {
	background-color: var(--color-card-bg, #ffffff);
	border-radius: 12px;
	padding: var(--spacing-medium);
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	transition: transform 0.2s ease, box-shadow 0.2s ease;
	cursor: pointer;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
	}

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-medium);
	}

	&__route {
		flex: 1;
		margin-right: var(--spacing-medium);
	}

	&__details {
		margin-top: var(--spacing-medium);
	}
}

.route {
	display: flex;
	align-items: center;
	font-size: 1.1em;
	font-weight: var(--font-weight-medium);

	&__point {
		&:first-child {
			color: var(--color-primary);
		}
	}

	&__arrow {
		margin: 0 var(--spacing-small);
		color: var(--color-text-secondary);
		font-weight: normal;
	}
}

.status {
	padding: 6px 12px;
	border-radius: 20px;
	font-size: 0.9em;
	font-weight: 500;
	white-space: nowrap;

	&--pending {
		background-color: var(--color-warning);
		color: #000;
	}

	&--accepted {
		background-color: var(--color-primary);
		color: #fff;
	}

	&--completed {
		background-color: var(--color-success);
		color: #fff;
	}

	&--cancelled {
		background-color: var(--color-error);
		color: #fff;
	}
}

.details {
	display: flex;
	flex-wrap: wrap;
	gap: var(--spacing-medium);

	&__item {
		display: flex;
		align-items: center;
		gap: var(--spacing-small);
		color: var(--color-text-secondary);
		font-size: 0.9em;
	}

	&__icon {
		color: var(--color-primary);
		width: 16px;
		text-align: center;
		opacity: 0.8;
	}

	&__text {
		white-space: nowrap;
	}
}
</style>

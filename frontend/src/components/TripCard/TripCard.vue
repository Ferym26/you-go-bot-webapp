<template>
	<article
		class="trip"
	>
		<header class="trip__header">
			<div class="trip__route route">
				<span class="route__point">{{ request.locationFrom }}</span>
				<span class="route__arrow"> → </span>
				<span class="route__point">{{ request.locationTo }}</span>
			</div>
		</header>

		<div class="trip__details details">
			<div class="details__item">
				<i class="details__icon fas fa-calendar"></i>
				<span class="details__text">{{ formatDate(request.datetime) }}</span>
			</div>
			<div class="details__item">
				<i class="details__icon fas fa-users"></i>
				<span class="details__text">{{ request.freePlaces }} свободных мест</span>
			</div>
		</div>
		<div class="trip__price">
			<span class="trip__price-text">Цена:</span>
			<span class="trip__price-value">{{ request.price }}</span>
		</div>
		<div class="trip__action">
			<el-button
				type="primary"
				@click="openChat(request.userName)"
			>
				Открыть чат
			</el-button>
			<el-button
				type="info"
				@click="openProfile"
			>
				Открыть анкету
			</el-button>
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
import { useTelegram } from '../../composables/useTelegram';

const props = defineProps({
	request: {
		type: Object,
		required: true,
	}
});

const emit = defineEmits(['openProfile']);

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

const openProfile = () => {
	emit('openProfile', props.request);
};

const openChat = (user) => {
	console.log(1);
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
	console.log(2);
	try {
		const message = `Здравствуйте! Я по поводу поездки ${props.request.from} → ${props.request.to} ${formatDate(props.request.datetime)}.`;
		const encodedMessage = encodeURIComponent(message);
		console.log(user);
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

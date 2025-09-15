<template>
	<article
		class="trip"
	>
		<div class="trip__avatar">
			<el-avatar
				v-if="avatarUrl"
				:src="avatarUrl"
			/>
			<el-avatar
				v-else
			> {{ getUserInitials() }} </el-avatar>
		</div>
		<header class="trip__header">
			<div class="trip__route route">
				<span class="route__point">{{ setRealPlaceName(request.locationFrom) }}</span>
				<span class="route__arrow"> → </span>
				<span class="route__point">{{ setRealPlaceName(request.locationTo) }}</span>
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
	</article>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTelegram } from '../../composables/useTelegram';
import { formatDate } from '../../composables/formatDate';
import { setRealPlaceName } from '../../composables/setRealPlaceName';

const props = defineProps({
	request: {
		type: Object,
		required: true,
	}
});

const emit = defineEmits(['openProfile']);

const { tg, ready } = useTelegram();

const avatarUrl = ref(null);

const openProfile = () => {
	emit('openProfile', props.request);
};

const message = () => {
	return `Здравствуйте 👋
		Я по поводу поездки:
		🗺️ ${setRealPlaceName(props.request.locationFrom)} ➡️ ${setRealPlaceName(props.request.locationTo)}
		🗓️ ${formatDate(props.request.datetime)}
		🟢 Хочу поехать с вами
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
		alert(user)
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

const fetchAvatar = async () => {
	const response = await fetch(`http://localhost:8585/api/avatar/${props.request.userId}`);
	const { url } = await response.json();
	avatarUrl.value = url;
};

const getUserInitials = () => {
	return props.request.userName.slice(0, 2).toUpperCase();
};

onMounted(async () => {
	await fetchAvatar();
});
</script>

<style src="./style.sass" lang="sass" scoped></style>

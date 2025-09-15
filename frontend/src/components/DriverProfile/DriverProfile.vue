<template>
	<div
		v-if="loading"
		class="driver-profile__loading"
	>
		<el-skeleton :rows="3" animated />
	</div>
	<div v-else-if="error" class="driver-profile__error">
		{{ error }}
	</div>
	<div v-else-if="!driverInfo" class="driver-profile__not-found">
		Профиль водителя не найден
	</div>

	<div v-else class="driver-profile">
		<div class="driver-profile__header">
			<div class="driver-profile__car">
				<img
					class="driver-profile__car-img"
					:src="photoUrl"
					@error="handleImageError"
				>
			</div>
		</div>

		<div class="driver-profile__details">
			<div class="driver-profile__section">
				<h4 class="driver-profile__section-title">О водителе</h4>
				<div class="driver-profile__description">
					<p><strong>Имя:</strong>{{ driverInfo.name || 'Не указано' }}</p>
					<p><strong>Стаж:</strong>{{ driverInfo.experience || 'Не указано' }}</p>
				</div>
			</div>

			<div class="driver-profile__section">
				<h4 class="driver-profile__section-title">Автомобиль</h4>
				<div class="driver-profile__car-info">
					<p><strong>Марка:</strong> {{ driverInfo.carDetails || 'Не указано' }}</p>
					<!-- <p><strong>Марка:</strong> {{ driverInfo.carBrand || 'Не указано' }}</p>
					<p><strong>Модель:</strong> {{ driverInfo.carModel || 'Не указано' }}</p>
					<p><strong>Год:</strong> {{ driverInfo.carYear || 'Не указано' }}</p>
					<p><strong>Цвет:</strong> {{ driverInfo.carColor || 'Не указано' }}</p> -->
				</div>
			</div>

			<div class="driver-profile__section">
				<h4 class="driver-profile__section-title">Дополнительно</h4>
				<ul class="driver-profile__features">
					<li v-if="driverInfo.petsAllowed">
						<i class="fas fa-paw"></i> Можно с животными
					</li>
				</ul>
			</div>

			<div class="driver-profile__section">
				<h4 class="driver-profile__section-title">Контакты</h4>
				<ul class="driver-profile__description">
					<p>
						<strong>Телефон:</strong>
						<el-link type="success" :href="`tel:${driverInfo.phoneNumber}`">{{ driverInfo.phoneNumber }}</el-link>
					</p>
				</ul>
			</div>
		</div>

		<div class="driver-profile__action">
			<el-button
				type="primary"
				size="large"
				@click="openChat"
			>
				Чат с водителем
			</el-button>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useTelegram } from '../../composables/useTelegram';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

const props = defineProps({
	driverData: {
		type: Object,
		required: true,
	}
});

const photoUrl = ref('/default-avatar.jpg');
const driverInfo = ref(null);
const loading = ref(true);
const error = ref(null);
const { tg, ready } = useTelegram();

const handleImageError = () => {
	photoUrl.value = '/default-avatar.jpg';
};

const fetchDriverInfo = async () => {
	try {
		loading.value = true;
		error.value = null;

		const driverRef = doc(db, 'drivers', String(props.driverData.userId));
		const driverDoc = await getDoc(driverRef);

		if (driverDoc.exists()) {
			driverInfo.value = driverDoc.data();

			// TODO: фото заработает после переезда фотосервиса на сервак. локально не работает
			// if (driverInfo.value.carPhoto) {
			// 	const response = await fetch(`http://localhost:8585/api/photo/${driverInfo.value.carPhoto}`);
			// 	const { url } = await response.json();
			// 	photoUrl.value = url;
			// }
		} else {
			error.value = 'Профиль водителя не найден';
		}
	} catch (err) {
		console.error('Error fetching driver info:', err);
		error.value = 'Ошибка при загрузке данных водителя';
	} finally {
		loading.value = false;
	}
};

// Следим за изменением userId и обновляем данные
watch(() => props.driverData.userId, (newUserId) => {
	if (newUserId) {
		fetchDriverInfo();
	}
}, { immediate: true });

onMounted(() => {
	fetchDriverInfo();
});

const openChat = () => {
	if (!ready || !tg) {
		console.error('Telegram WebApp is not available');
		tg.showPopup({
			title: 'Ошибка',
			message: 'Ошибка при открытии чата',
			buttons: [{type: 'ok'}]
		});
		return;
	}

	if (!driverInfo.value?.userName) {
		tg.showPopup({
			title: 'Ошибка',
			message: 'Не удалось получить контакт водителя',
			buttons: [{type: 'ok'}]
		});
		return;
	}

	try {
		const message = `Здравствуйте! Я по поводу поездки ${props.driverData.locationFrom} → ${props.driverData.locationTo}`;
		const encodedMessage = encodeURIComponent(message);
		// tg.openTelegramLink(`https://t.me/${props.driverData.name}?text=${encodedMessage}`);
		tg.openTelegramLink(`https://t.me/${driverInfo.value.userName}?text=${encodedMessage}`);

	} catch (error) {
		console.error('Error opening chat:', error);
		tg.showPopup({
			title: 'Ошибка',
			message: 'Не удалось открыть чат с водителем',
			buttons: [{type: 'ok'}]
		});
	}
};
</script>

<style src="./style.scss" lang="scss" scoped></style>

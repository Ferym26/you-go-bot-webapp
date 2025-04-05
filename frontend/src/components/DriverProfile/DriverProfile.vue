<template>
	<div v-if="loading" class="driver-profile__loading">
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
			<div class="driver-profile__avatar">
				<img
					:src="photoUrl"
					:alt="driverInfo.userName"
					@error="handleImageError"
					class="driver-profile__avatar-img"
				>
			</div>
			<div class="driver-profile__info">
				<h3 class="driver-profile__name">{{ driverInfo.userName }}</h3>
				<div class="driver-profile__rating">
					<i class="fas fa-star"></i>
					<span>{{ driverInfo.rating || 'Нет оценок' }}</span>
				</div>
			</div>
		</div>

		<div class="driver-profile__details">
			<div class="driver-profile__section">
				<h4 class="driver-profile__section-title">О водителе</h4>
				<p class="driver-profile__description">
					{{ driverInfo.description || 'Описание не добавлено' }}
				</p>
			</div>

			<div class="driver-profile__section">
				<h4 class="driver-profile__section-title">Автомобиль</h4>
				<div class="driver-profile__car-info">
					<p><strong>Марка:</strong> {{ driverInfo.carBrand || 'Не указано' }}</p>
					<p><strong>Модель:</strong> {{ driverInfo.carModel || 'Не указано' }}</p>
					<p><strong>Год:</strong> {{ driverInfo.carYear || 'Не указано' }}</p>
					<p><strong>Цвет:</strong> {{ driverInfo.carColor || 'Не указано' }}</p>
				</div>
			</div>

			<div class="driver-profile__section">
				<h4 class="driver-profile__section-title">Дополнительно</h4>
				<ul class="driver-profile__features">
					<li v-if="driverInfo.smokingAllowed">
						<i class="fas fa-smoking"></i> Курение разрешено
					</li>
					<li v-if="driverInfo.petsAllowed">
						<i class="fas fa-paw"></i> Можно с животными
					</li>
					<li v-if="driverInfo.musicAvailable">
						<i class="fas fa-music"></i> Есть музыка
					</li>
				</ul>
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
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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

		const driverRef = doc(db, 'drivers', String(props.driverData.userId))
		const driverDoc = await getDoc(driverRef)

		if (driverDoc.exists()) {
			driverInfo.value = driverDoc.data();

			if (driverInfo.value.carPhoto) {
				// TODO: get photo from telegram
				const response = await fetch(`http://localhost:8585/api/photo/${driverInfo.value.carPhoto}`)
				const { url } = await response.json()
				photoUrl.value = url
			}
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

<style lang="scss" scoped>
.driver-profile {
	padding: 20px;

	&__loading,
	&__error,
	&__not-found {
		padding: 20px;
		text-align: center;
		color: var(--el-text-color-secondary);
	}

	&__error {
		color: var(--el-color-danger);
	}

	&__header {
		display: flex;
		align-items: center;
		margin-bottom: 24px;
	}

	&__avatar {
		width: 100px;
		height: 100px;
		margin-right: 20px;
		border-radius: 50%;
		overflow: hidden;

		&-img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}
	}

	&__info {
		flex: 1;
	}

	&__name {
		font-size: 24px;
		margin-bottom: 8px;
	}

	&__rating {
		display: flex;
		align-items: center;
		gap: 4px;
		color: var(--el-color-warning);
	}

	&__section {
		margin-bottom: 24px;

		&:last-child {
			margin-bottom: 0;
		}
	}

	&__section-title {
		font-size: 18px;
		margin-bottom: 12px;
		color: var(--el-text-color-primary);
	}

	&__description {
		color: var(--el-text-color-regular);
		line-height: 1.5;
	}

	&__car-info {
		display: grid;
		gap: 8px;
		color: var(--el-text-color-regular);
	}

	&__features {
		list-style: none;
		padding: 0;
		display: grid;
		gap: 12px;

		li {
			display: flex;
			align-items: center;
			gap: 8px;
			color: var(--el-text-color-regular);

			i {
				color: var(--el-color-primary);
			}
		}
	}
}
</style>

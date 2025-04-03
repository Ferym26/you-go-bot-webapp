<template>
	<div class="requests container page-indent">
		<h1 class="page-title">Список заявок</h1>
		<div class="requests__filters">
			<el-row :gutter="12">
				<el-col :span="24">
					<el-select
						v-model="placeFrom"
						filterable
						clearable
						:allow-create="true"
						:no-match-text="'Нет совпадений'"
						:no-data-text="'Нет данных'"
						size="large"
						placeholder="Откуда"
						@blur="handleBlur($event, 'from')"
					>
						<el-option
							v-for="place in places"
							:key="place.value"
							:label="place.label"
							:value="place.value"
						/>
					</el-select>
				</el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="24">
					<el-select
						v-model="placeTo"
						filterable
						clearable
						:allow-create="true"
						:no-match-text="'Нет совпадений'"
						:no-data-text="'Нет данных'"
						size="large"
						placeholder="Куда"
						@blur="handleBlur($event, 'to')"
					>
						<el-option
							v-for="place in places"
							:key="place.value"
							:label="place.label"
							:value="place.value"
						/>
					</el-select>
				</el-col>
			</el-row>
			<el-row :gutter="12">
				<el-col :span="24">
					<el-date-picker
						v-model="date"
						type="date"
						clearable
						placeholder="Выберите дату"
						size="large"
					/>
				</el-col>
			</el-row>
		</div>

		<div v-if="loading" class="loading">
			Загрузка...
		</div>
		<div v-else-if="error" class="error">
			{{ error }}
		</div>
		<div v-else-if="filteredRequests.length === 0" class="empty">
			<template v-if="placeFrom || placeTo || date">
				Нет заявок по выбранным фильтрам
			</template>
			<template v-else>
				Нет активных заявок
			</template>
		</div>
		<div v-else class="requests-list">
			<RequestCard
				v-for="request in filteredRequests"
				:key="request.id"
				:request="request"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import RequestCard from '../components/RequestCard/RequestCard.vue';
import { places } from '../data/places';

const requests = ref([]);
const loading = ref(true);
const error = ref(null);
const placeFrom = ref('');
const placeTo = ref('');
const date = ref('');

// Обработчик для создания новой опции при потере фокуса
const handleBlur = (event, model) => {
	const value = event.target.value?.trim();
	if (!value) return;

	// Проверяем, существует ли уже такая опция
	const exists = places.some(place =>
		place.value.toLowerCase() === value.toLowerCase() ||
		place.label.toLowerCase() === value.toLowerCase()
	);

	if (!exists) {
		// Если опции нет, добавляем её
		if (model === 'from') {
			placeFrom.value = value;
		} else {
			placeTo.value = value;
		}
	}
};

// Фильтрованный список заявок
const filteredRequests = computed(() => {
	return requests.value.filter(request => {
		let matches = true;

		if (placeFrom.value) {
			matches = matches && request.locationFrom === placeFrom.value;
		}

		if (placeTo.value) {
			matches = matches && request.locationTo === placeTo.value;
		}

		if (date.value) {
			// Преобразуем даты к началу дня для сравнения
			const requestDate = new Date(request.datetime.seconds * 1000);
			requestDate.setHours(0, 0, 0, 0);

			const filterDate = new Date(date.value);
			filterDate.setHours(0, 0, 0, 0);

			matches = matches && requestDate.getTime() === filterDate.getTime();
		}

		return matches;
	});
});

// Храним функцию отписки
let unsubscribe = null;

const subscribeToRequests = () => {
	try {
		loading.value = true;
		error.value = null;

		// Создаем запрос с сортировкой по дате создания
		const q = query(
			collection(db, 'transfer-requests'),
			orderBy('createdAt', 'desc')
		);

		// Подписываемся на изменения
		unsubscribe = onSnapshot(q,
			(snapshot) => {
				requests.value = snapshot.docs.map(doc => ({
					id: doc.id,
					...doc.data()
				}));
				loading.value = false;
			},
			(err) => {
				console.error('Error fetching requests:', err);
				error.value = 'Ошибка при загрузке заявок';
				loading.value = false;
			}
		);
	} catch (err) {
		console.error('Error setting up listener:', err);
		error.value = 'Ошибка при настройке слушателя';
		loading.value = false;
	}
};

onMounted(() => {
	subscribeToRequests();
});

// Отписываемся при размонтировании компонента
onUnmounted(() => {
	if (unsubscribe) {
		unsubscribe();
	}
});
</script>

<style lang="scss" scoped>
.requests {
	&__filters {
		margin-bottom: 20px;
	}
}

.requests-list {
	display: grid;
	gap: 12px;
}

.loading,
.error,
.empty {
	text-align: center;
	padding: 20px;
	color: var(--el-text-color-secondary);
}

.error {
	color: var(--el-color-danger);
}
</style>

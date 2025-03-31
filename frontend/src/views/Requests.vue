<template>
	<div class="requests container page-indent">
		<h1 class="page-title">Список заявок</h1>
		<el-row :gutter="12">
			<el-col :span="24">
				<el-select-v2
					v-model="placeFrom"
					filterable
					:options="places"
					size="large"
					placeholder="Откуда"
				/>
			</el-col>
		</el-row>
		<el-row :gutter="12">
			<el-col :span="24">
				<el-select-v2
					v-model="placeTo"
					filterable
					:options="places"
					size="large"
					placeholder="Куда"
				/>
			</el-col>
		</el-row>
		<el-row :gutter="12">
			<el-col :span="24">
				<el-date-picker
					v-model="date"
					type="date"
					placeholder="Выберите дату"
					size="large"
				/>
			</el-col>
		</el-row>


		<div v-if="loading" class="loading">
			Загрузка...
		</div>
		<div v-else-if="error" class="error">
			{{ error }}
		</div>
		<div v-else-if="requests.length === 0" class="empty">
			Нет активных заявок
		</div>
		<div v-else class="requests-list">
			<RequestCard
				v-for="request in requests"
				:key="request.id"
				:request="request"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

import RequestCard from '../components/RequestCard/RequestCard.vue';

import { places } from '../data/places';

const requests = ref([]);
const loading = ref(true);
const error = ref(null);

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

const placeFrom = ref([]);
const placeTo = ref([]);
const date = ref('');
</script>

<style lang="scss" scoped>
	.requests-list {
		display: grid;
		gap: 12px;
	}
</style>

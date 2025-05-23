<template>
	<div class="trips container page-indent">
		<h1 class="page-title">Список поездок</h1>
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
						:format="'DD.MM.YYYY'"
						:editable="false"
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
		<div v-else class="trips-list">
			<TripCard
				v-for="request in filteredRequests"
				:key="request.id"
				:request="request"
				@open-profile="handleOpenProfile"
			/>
		</div>
	</div>

	<el-dialog
		class="driver-profile-dialog"
		v-model="dialogVisible"
		title="Анкета водителя"
		:close-on-click-modal="true"
		:append-to-body="true"
	>
		<DriverProfile
			v-if="selectedDriver"
			:driver-data="selectedDriver"
		/>
	</el-dialog>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

import TripCard from '../components/TripCard/TripCard.vue';
import DriverProfile from '../components/DriverProfile/DriverProfile.vue';
import { handleBlur } from '../composables/handleBlur.js';

import { places } from '../data/places';

const requests = ref([]);
const loading = ref(true);
const error = ref(null);
const placeFrom = ref('');
const placeTo = ref('');
const date = ref('');
const dialogVisible = ref(false);
const selectedDriver = ref(null);

const handleOpenProfile = (tripData) => {
	selectedDriver.value = {
		userId: tripData.userId,
		locationFrom: tripData.locationFrom,
		locationTo: tripData.locationTo
	};
	dialogVisible.value = true;
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

		const q = query(
			collection(db, 'transfer-proposals'),
			orderBy('createdAt', 'desc')
		);

		unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				snapshot.docChanges().forEach((change) => {
					const docData = change.doc.data();
					const docId = change.doc.id;

					if (change.type === 'added') {
						// Добавляем новый элемент, если status !== 'hidden'
						if (docData.status !== 'hidden') {
							requests.value.push({ id: docId, ...docData });
						}
					}

					if (change.type === 'modified') {
						const index = requests.value.findIndex(item => item.id === docId);
						if (docData.status === 'hidden') {
							// Если статус стал hidden — удаляем из списка
							if (index !== -1) {
								requests.value.splice(index, 1);
							}
						} else {
							if (index !== -1) {
								// Обновляем элемент, если он уже есть
								requests.value[index] = { id: docId, ...docData };
							} else {
								// Если элемента нет, а статус НЕ hidden — добавляем его
								requests.value.push({ id: docId, ...docData });
							}
						}
					}

					if (change.type === 'removed') {
						const index = requests.value.findIndex(item => item.id === docId);
						if (index !== -1) {
							requests.value.splice(index, 1);
						}
					}
				});

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
	.trips {
		&__filters {
			margin-bottom: 20px;
		}
	}

	.trips-list {
		display: grid;
		gap: 12px;
		margin-top: 20px;
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

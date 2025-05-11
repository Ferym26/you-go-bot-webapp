<template>
	<div class="driver-trip-list container page-indent">
		<h1 class="page-title">Список моих маршрутов</h1>
		<div class="driver-trip-list__filters">
			<el-row :gutter="12">
				<el-col :span="24">
					<el-select
						v-model="form.locationFrom"
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
						v-model="form.locationTo"
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
						v-model="form.date"
						type="date"
						clearable
						placeholder="Выберите дату"
						size="large"
					/>
				</el-col>
			</el-row>
		</div>

		<div v-if="loading" class="loading">
			<el-card class="skeleton-card" v-loading="true"></el-card>
		</div>
		<div v-else-if="error" class="error">
			<el-row :gutter="16">
				<el-col :span="24">
					<el-alert
						title="Ошибка при получении данных"
						description="Пожалуйста, обратитесь к администратору"
						type="error"
						:closable="false"
						show-icon
					/>
				</el-col>
			</el-row>
			<el-row :gutter="16">
				<el-col :span="24">
					<el-button
						tag="a"
						href="#"
						type="danger"
						size="large"
						:icon="Message"
						style="width: 100%;"
					>
						Написать сообщение
					</el-button>
				</el-col>
			</el-row>
		</div>
		<div v-else-if="filteredRequests.length === 0" class="empty">
			<template v-if="form.locationFrom || form.locationTo || form.date">
				<el-alert
					title="Нет заявок по выбранным фильтрам"
					description="Выберите другие параметры"
					type="warning"
					:closable="false"
					show-icon
				/>
			</template>
			<template v-else>
				<el-alert
					title="Нет активных заявок"
					type="warning"
					:closable="false"
					show-icon
				/>
			</template>
		</div>
		<div v-else class="requests-list">
			<DriverTripCard
				v-for="request in filteredRequests"
				:key="request.id"
				:request="request"
			/>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { collection, query, orderBy, onSnapshot, getFirestore, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { places } from '../data/places';
import { handleBlur } from '../composables/handleBlur.js';

import { Message } from '@element-plus/icons-vue'

const requests = ref([]);
const loading = ref(true);
const error = ref(null);

const form = ref({
	locationFrom: '',
	locationTo: '',
	date: '',
});

// Фильтрованный список поездок
const filteredRequests = computed(() => {
	return requests.value.filter(request => {
		let matches = true;

		if (form.value.locationFrom) {
			matches = matches && request.locationFrom === form.value.locationFrom;
		}

		if (form.value.locationTo) {
			matches = matches && request.locationTo === form.value.locationTo;
		}

		if (form.value.date) {
			// Преобразуем даты к началу дня для сравнения
			const requestDate = new Date(request.datetime.seconds * 1000);
			requestDate.setHours(0, 0, 0, 0);

			const filterDate = new Date(form.value.date);
			filterDate.setHours(0, 0, 0, 0);

			matches = matches && requestDate.getTime() === filterDate.getTime();
		}

		return matches;
	});
});

async function getUserDocs(userId) {
  const q = query(
    collection(db, "transfer-proposals"), // заменяешь на свою коллекцию
    where("userId", "==", userId),
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    requests.value.push({ id: doc.id, ...doc.data() });
  });
}

// Пример использования
getUserDocs(283612610).then(() => {
	loading.value = false;
})

</script>

<style lang="scss" scoped>
	.driver-trip-list {
		&__filters {
			margin-bottom: 20px;
		}
	}
</style>

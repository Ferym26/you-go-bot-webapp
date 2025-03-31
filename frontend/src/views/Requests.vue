<template>
	<div class="requests container page-indent">
		<h1 class="page-title">Список заявок</h1>
		<el-row :gutter="12">
			<el-col :span="12">
				<el-select-v2
					v-model="placeFrom"
					filterable
					:options="placeFromOptions"
					placeholder="Откуда"
				/>
			</el-col>
			<el-col :span="12">
				<el-select-v2
					v-model="placeTo"
					filterable
					:options="placeToOptions"
					placeholder="Куда"
				/>
			</el-col>
		</el-row>
		<el-row :gutter="12">
			<el-col :span="24">
				<el-date-picker
					v-model="dateRange"
					type="daterange"
					range-separator="To"
					start-placeholder="Start date"
					end-placeholder="End date"
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
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import RequestCard from '../components/RequestCard/RequestCard.vue';

const requests = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchRequests = async () => {
	try {
		loading.value = true;
		error.value = null;

		const querySnapshot = await getDocs(collection(db, 'transfer-requests'));
		requests.value = querySnapshot.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));
	} catch (err) {
		console.error('Error fetching requests:', err);
		error.value = 'Ошибка при загрузке заявок';
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	fetchRequests();
});

const placeFrom = ref([])
const placeTo = ref([])
const placeFromOptions = ref([])
const placeToOptions = ref([])

const dateRange = ref('')
</script>

<style lang="scss" scoped>
	.requests-list {
		display: grid;
		gap: 12px;
	}
</style>

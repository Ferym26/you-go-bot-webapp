<template>
	<div class="requests container page-indent">
		<h1 class="page-title">Список заявок</h1>
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
</script>

<style lang="scss" scoped>
	.requests {
		//
	}

	.requests-list {
		display: grid;
		gap: 12px;
	}
</style>

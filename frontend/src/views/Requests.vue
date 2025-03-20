<template>
	<div class="requests">
		<h1>Заявки на трансфер</h1>
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
import { db } from '../firebase/config';
import RequestCard from '../components/RequestCard.vue';

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
	padding: var(--spacing-medium);
	max-width: 800px;
	margin: 0 auto;

	h1 {
		margin-bottom: var(--spacing-large);
		color: var(--color-text);
		text-align: center;
	}
}

.requests-list {
	display: grid;
	gap: var(--spacing-medium);
}

.loading,
.error,
.empty {
	text-align: center;
	padding: var(--spacing-large);
	color: var(--color-text);
}

.error {
	color: var(--color-error);
}
</style>

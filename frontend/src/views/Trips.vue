<template>
	<div class="trips">
		<h1>Поездки</h1>
		<div class="trips-list">
			<!-- Здесь будет список поездок -->
		</div>
	</div>
</template>

<script setup>
// import { ref, onMounted } from 'vue';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '../firebase/config';

// const trips = ref([]);

// const fetchTrips = async () => {
// 	try {
// 		const querySnapshot = await getDocs(collection(db, 'trips'));
// 		trips.value = querySnapshot.docs.map(doc => ({
// 			id: doc.id,
// 			...doc.data()
// 		}));
// 	} catch (error) {
// 		console.error('Error fetching trips:', error);
// 	}
// };

// onMounted(() => {
// 	fetchTrips();
// });
</script>

<style lang="scss" scoped>
.trips {
	padding: var(--spacing-medium);

	h1 {
		margin-bottom: var(--spacing-large);
		color: var(--color-text);
	}

	.trips-list {
		display: grid;
		gap: var(--spacing-medium);
	}
}
</style>

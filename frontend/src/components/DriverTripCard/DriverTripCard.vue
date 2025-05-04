<template>
	<article
		class="driver-trip-card"
	>
		<header class="driver-trip-card__header">
			<div class="driver-trip-card__route route">
				<span class="route__point">{{ request.locationFrom }}</span>
				<span class="route__arrow"> → </span>
				<span class="route__point">{{ request.locationTo }}</span>
			</div>
		</header>

		<div class="driver-trip-card__details details">
			<div class="details__item">
				<i class="details__icon fas fa-calendar"></i>
				<span class="details__text">{{ formatDate(request.datetime) }}</span>
			</div>
			<div class="details__item">
				<i class="details__icon fas fa-users"></i>
				<span class="details__text">{{ request.freePlaces }} свободных мест</span>
			</div>
		</div>
		<div class="driver-trip-card__price">
			<span class="driver-trip-card__price-text">Цена:</span>
			<span class="driver-trip-card__price-value">{{ request.price }}</span>
		</div>
		<div class="driver-trip-card__action">
			<el-button
				type="success"
				@click="toggleTripStatus()"
			>
				Начать поездку
			</el-button>
			<el-button
				:type="isTripStarted ? 'primary' : 'info'"
				@click="toggleTripStatus()"
			>
				<i :class="isTripStarted ? 'fas fa-eye' : 'fas fa-eye-slash'"></i>

			</el-button>
			<el-button
				type="danger"
				@click="deleteTrip()"
			>
				<i class="fas fa-xmark"></i>
			</el-button>
		</div>
	</article>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getFirestore, doc, deleteDoc, updateDoc, getDoc } from "firebase/firestore";
import { db } from '../../services/firebase';
import { TransferStatus } from '../../types/types';
import { formatDate } from '../../composables/formatDate';


const props = defineProps({
	request: {
		type: Object,
		required: true,
	}
});
const isTripStarted = ref(null);

const toggleTripStatus = () => {
	const docRef = doc(db, "transfer-proposals", props.request.id);
	updateDoc(docRef, {
		status: isTripStarted.value ? TransferStatus.hidden : TransferStatus.ready,
	});
	isTripStarted.value = !isTripStarted.value;
}

const toggleTripVisibility = () => {
	// TODO: here
}

const deleteTrip = () => {
	// deleteDoc(doc(db, "transfer-proposals", props.request.id));
}

onMounted(async () => {
  const docRef = doc(db, "transfer-proposals", props.request.id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    isTripStarted.value = data.status === TransferStatus.ready; // Устанавливаем состояние в зависимости от поля status
  }
});

</script>

<style src="./style.sass" lang="sass" scoped></style>

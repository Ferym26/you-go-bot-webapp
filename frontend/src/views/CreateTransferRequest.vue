<template>
	<div class="create-request">
		<h1>Создать заявку на трансфер</h1>
		<!-- <form @submit.prevent="handleSubmit" class="request-form">
			<div class="form-group">
				<label for="from">Откуда</label>
				<input
					type="text"
					id="from"
					v-model="form.from"
					required
					placeholder="Введите пункт отправления"
				>
			</div>

			<div class="form-group">
				<label for="to">Куда</label>
				<input
					type="text"
					id="to"
					v-model="form.to"
					required
					placeholder="Введите пункт назначения"
				>
			</div>

			<div class="form-group">
				<label for="datetime">Дата и время</label>
				<input
					type="datetime-local"
					id="datetime"
					v-model="form.datetime"
					required
				>
			</div>

			<div class="form-group">
				<label for="passengers">Количество пассажиров</label>
				<input
					type="number"
					id="passengers"
					v-model="form.passengers"
					required
					min="1"
				>
			</div>

			<button type="submit" class="submit-btn">Создать заявку</button>
		</form> -->
	</div>
</template>

<script setup>
import { ref } from 'vue';
// import { collection, addDoc } from 'firebase/firestore';
// import { db } from '../firebase/config';
import { useRouter } from 'vue-router';

const router = useRouter();

const form = ref({
	from: '',
	to: '',
	datetime: '',
	passengers: 1
});

const handleSubmit = async () => {
	try {
		await addDoc(collection(db, 'transfer-requests'), {
			...form.value,
			createdAt: new Date(),
			status: 'pending'
		});

		router.push('/requests');
	} catch (error) {
		console.error('Error creating request:', error);
	}
};
</script>

<style lang="scss" scoped>
.create-request {
	padding: var(--spacing-medium);
	max-width: 600px;
	margin: 0 auto;

	h1 {
		margin-bottom: var(--spacing-large);
		color: var(--color-text);
	}
}

.request-form {
	display: grid;
	gap: var(--spacing-medium);
}

.form-group {
	display: grid;
	gap: var(--spacing-small);

	label {
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
	}

	input {
		padding: 8px 12px;
		border: 1px solid var(--color-border, #ddd);
		border-radius: 4px;
		font-size: var(--font-size-base);

		&:focus {
			outline: none;
			border-color: var(--color-primary);
		}
	}
}

.submit-btn {
	margin-top: var(--spacing-medium);
	background-color: var(--color-primary);
	color: white;
	border: none;
	padding: 12px;
	border-radius: 4px;
	cursor: pointer;
	font-weight: var(--font-weight-medium);

	&:hover {
		opacity: 0.9;
	}
}
</style>

<template>
	<div class="create-request container page-indent">
		<h1 class="page-title">Создать заявку на трансфер</h1>
		<form @submit.prevent="handleSubmit" class="request-form">
			<el-row :gutter="12">
				<el-select
					v-model="form.locationFrom"
					filterable
					required
					placeholder="Выберите пункт отправления"
				>
					<el-option
						v-for="item in places"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-row>
			<el-row :gutter="12">
				<el-select
					v-model="form.locationTo"
					filterable
					required
					placeholder="Выберите пункт назначения"
				>
					<el-option
						v-for="item in places"
						:key="item.value"
						:label="item.label"
						:value="item.value"
					/>
				</el-select>
			</el-row>
			<el-row :gutter="12">
				<el-date-picker
					v-model="form.datetime"
					type="datetime"
					placeholder="Выберите дату и время"
				/>
			</el-row>
			<el-row :gutter="12">
				<el-input-number
					v-model="form.passengers"
					:min="1"
					:max="10"
					placeholder="Количество пассажиров"
				/>
			</el-row>
			<el-row :gutter="12">
				<el-button
					type="primary"
					size="large"
				>
					Создать заявку
				</el-button>
			</el-row>
		</form>
	</div>
</template>

<script setup>
import { ref } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useRouter } from 'vue-router';
import { places } from '../data/places';

const router = useRouter();

const form = ref({
	locationFrom: '',
	locationTo: '',
	datetime: '',
	passengers: 1,
	user: null,
});

const handleSubmit = async () => {
	try {
		await addDoc(collection(db, 'transfer-requests'), {
			...form.value,
			createdAt: new Date(),
			status: 'pending'
		});

		// router.push('/requests');
	} catch (error) {
		console.error('Error creating request:', error);
	}
};
</script>

<style lang="scss" scoped>
	.create-request {
		max-width: 460px;
		margin: 0 auto;
	}
</style>

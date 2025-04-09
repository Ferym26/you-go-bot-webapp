<template>
	<div class="create-request container page-indent">
		<h1 class="page-title">Создать заявку на трансфер</h1>
		<form
			@submit.prevent="handleSubmit"
			class="request-form"
		>
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
			<el-row :gutter="12" class="create-request__action">
				<el-button
					type="primary"
					size="large"
					native-type="submit"
				>
					Создать заявку
				</el-button>
			</el-row>
		</form>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useRouter } from 'vue-router';
import { useTelegram } from '../composables/useTelegram';

import { places } from '../data/places';

const router = useRouter();
const { tg, user } = useTelegram();

const form = ref({
	locationFrom: '',
	locationTo: '',
	datetime: '',
	passengers: 1,
	userId: null,
	userName: null,
	userAvatar: null,
});

onMounted(() => {
	if (user) {
		form.value.userId = user.id;
		form.value.userName = user.username || `${user.first_name} ${user.last_name || ''}`.trim();
		form.value.userAvatar = user.avatar;
	} else {
		tg?.showPopup({
			title: 'Ошибка',
			message: 'Не удалось получить данные пользователя',
			buttons: [{type: 'ok'}],
		});
	}
});

const handleSubmit = async () => {
	if (!form.value.userId) {
		tg?.showPopup({
			title: 'Ошибка',
			message: 'Не удалось получить ID пользователя',
			buttons: [{type: 'ok'}]
		});
		return;
	}

	try {
		await addDoc(collection(db, 'transfer-requests'), {
			...form.value,
			createdAt: new Date(),
			status: 'pending',
		});

		tg?.showPopup({
			title: 'Успех',
			message: 'Заявка успешно создана',
			buttons: [{
				type: 'ok',
				text: 'OK',
				onClick: () => router.push('/requests')
			}]
		});
	} catch (error) {
		console.error('Error creating request:', error);
		tg?.showPopup({
			title: 'Ошибка',
			message: 'Не удалось создать заявку',
			buttons: [{type: 'ok'}]
		});
	}
};
</script>

<style lang="scss" scoped>
	.create-request {
		&__action {
			.el-button {
				width: 100%;
			}
		}

		.el-input-number {
			width: 100%;
		}
	}
</style>

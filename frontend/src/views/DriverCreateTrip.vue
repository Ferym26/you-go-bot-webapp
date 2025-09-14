<template>
	<div class="driver-create-trip container page-indent">
		<h1 class="page-title">Создать поездкy</h1>
		<el-form
			@submit.prevent="handleSubmit"
			class="request-form"
			label-position="top"
		>
			<el-row :gutter="12">
				<el-select
					v-model="form.locationFrom"
					filterable
					required
					:allow-create="true"
					:no-match-text="'Нет совпадений'"
					:no-data-text="'Нет данных'"
					size="large"
					placeholder="Выберите пункт отправления"
					@blur="handleBlur($event, 'from')"
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
					:allow-create="true"
					:no-match-text="'Нет совпадений'"
					:no-data-text="'Нет данных'"
					size="large"
					placeholder="Выберите пункт назначения"
					@blur="handleBlur($event, 'to')"
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
					size="large"
					time-format="HH:mm"
					:format="'DD.MM.YYYY HH:mm'"
					:editable="false"
					:default-time="defaultTime"
					:disabled-date="time => time < new Date().setHours(0, 0, 0, 0)"
				/>
			</el-row>
			<el-row :gutter="12">
				<el-form-item label="Свободные места">
					<el-input-number
						v-model="form.freePlaces"
						:min="1"
						:max="8"
						placeholder="Количество свободных мест"
						size="large"
					/>
				</el-form-item>
			</el-row>
			<el-row :gutter="12">
				<el-input
					v-model="form.price"
					placeholder="Введите стоимость поездки"
					size="large"
					:parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
				>
					<template #prefix>
						<span>₾</span>
					</template>
				</el-input>
			</el-row>
			<el-row :gutter="12" class="driver-create-trip__action">
				<el-button
					type="primary"
					size="large"
					native-type="submit"
					:disabled="!form.locationFrom || !form.locationTo || !form.datetime || !form.price"
				>
					Создать поездку
				</el-button>
			</el-row>
		</el-form>
	</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useRouter } from 'vue-router';
import { useTelegram } from '../composables/useTelegram';
import { handleBlur } from '../composables/handleBlur.js';

import { places } from '../data/places';
import { TransferStatus } from '../types/types';

const router = useRouter();
const { tg, user } = useTelegram();

const defaultTime = new Date(2000, 1, 1, 8, 0, 0) // '12:00:00'

const form = ref({
	locationFrom: '',
	locationTo: '',
	datetime: '',
	freePlaces: 1,
	price: null,
	userId: null,
	userName: null,
});

onMounted(() => {
	if (user) {
		form.value.userId = user.id;
		form.value.userName = `${user.username}`.trim() || `${user.first_name} ${user.last_name || ''}`.trim();
	} else {
		// tg?.showPopup({
		// 	title: 'Ошибка',
		// 	message: 'Не удалось получить данные пользователя',
		// 	buttons: [{type: 'ok'}],
		// });
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
		await addDoc(collection(db, 'transfer-proposals'), {
			...form.value,
			createdAt: new Date(),
			status: TransferStatus.ready,
		});

		tg?.showPopup({
			title: 'Успех',
			message: 'Поездка успешно создана',
			buttons: [{
				type: 'ok',
				text: 'OK',
				// onClick: () => router.push('/requests')
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
	.driver-create-trip {
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

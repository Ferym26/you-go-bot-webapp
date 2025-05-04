<template>
	<div class="home container page-indent">
		<h1>You Go Bot</h1>
		<div class="actions">
			<router-link to="/create-transfer-request" class="action-btn">
				Создать заявку
			</router-link>
			<router-link to="/driver-create-trip" class="action-btn">
				Создать поездку
			</router-link>
			<router-link to="/requests" class="action-btn">
				Список заявок
			</router-link>
			<router-link to="/trips" class="action-btn">
				Список поездок
			</router-link>
			<router-link to="/driver-trip-list" class="action-btn">
				Список маршрутов водителя
			</router-link>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.actions {
	display: grid;
	grid-gap: 20px;
}
</style>

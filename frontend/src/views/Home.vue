<template>
	<div class="home">
		<h1>You Go Bot</h1>
		<div class="actions">
			<router-link to="/create-transfer-request" class="action-btn">
				Создать заявку
			</router-link>
			<router-link to="/requests" class="action-btn">
				Все заявки
			</router-link>
			<router-link to="/trips" class="action-btn">
				Все поездки
			</router-link>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.home {
	padding: var(--spacing-medium);
	text-align: center;

	h1 {
		margin-bottom: var(--spacing-large);
		color: var(--color-text);
	}
}

.actions {
	display: grid;
	gap: var(--spacing-medium);
	max-width: 400px;
	margin: 0 auto;
}

.action-btn {
	display: block;
	padding: var(--spacing-medium);
	background-color: var(--color-primary);
	text-decoration: none;
	border-radius: 8px;
	font-weight: var(--font-weight-medium);
	transition: opacity 0.2s;

	&:hover {
		opacity: 0.9;
	}
}
</style>

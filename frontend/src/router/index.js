import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('../views/Home.vue')
	},
	{
		path: '/requests',
		name: 'Requests',
		component: () => import('../views/Requests.vue')
	},
	{
		path: '/trips',
		name: 'Trips',
		component: () => import('../views/Trips.vue')
	},
	{
		path: '/create-transfer-request',
		name: 'CreateTransferRequest',
		component: () => import('../views/CreateTransferRequest.vue')
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes
});

export default router;

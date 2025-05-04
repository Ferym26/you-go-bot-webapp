const tg = window.Telegram?.WebApp;

export function useTelegram() {
	if (!tg || tg.version === '6.0') {
		console.error('Telegram WebApp is not available, useTelegram');
		return {
			tg: null,
			user: null,
			ready: false
		};
	}

	return {
		tg,
		user: tg.initDataUnsafe?.user,
		ready: true
	};
}

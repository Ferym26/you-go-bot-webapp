const menuList = [
	{
		command: 'start',
		description: 'Запуск бота',
	},
	{
		command: 'create_transfer_request',
		description: 'Создать объявление',
	},
	{
		command: 'show_my_requests',
		description: 'Показать мои объявления',
	},
]

export function menu(bot) {
	bot.api.setMyCommands(menuList);
}

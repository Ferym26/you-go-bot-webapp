const menuList = [
	{
		command: 'start',
		description: 'Запуск бота',
	},
	// {
	// 	command: 'change_role',
	// 	description: 'Сменить роль',
	// },
	{
		command: 'show_all_requests',
		description: 'Посмотреть все заявки',
	},
	{
		command: 'show_all_trips',
		description: 'Посмотреть все поездки',
	},
]

export function menu(bot) {
	bot.api.setMyCommands(menuList);
}

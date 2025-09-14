const menuList = [
	{
		command: 'start',
		description: 'Запуск бота',
	},
	{
		command: 'change_lang',
		description: 'Сменить язык',
	},
]

export function menu(bot) {
	bot.api.setMyCommands(menuList);
}

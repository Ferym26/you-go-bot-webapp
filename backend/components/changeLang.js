export function changeLang(bot) {
    bot.command('change_lang', async (ctx) => {
        await ctx.reply("Выберите язык", {
            parse_mode: 'HTML',
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'English', callback_data: 'set_lang_en' }],
                    [{ text: 'Русский', callback_data: 'set_lang_ru' }],
                    [{ text: 'ქართული', callback_data: 'set_lang_ge' }],
                ]
            }
        });
    });
}

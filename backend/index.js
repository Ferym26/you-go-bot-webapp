import dotenv from 'dotenv';
import { Bot } from 'grammy';

import { start } from './components/start.js';
import { registerPassenger } from './components/passenger.js';
import { registerDriver } from './components/driver.js';
import { menu } from './components/menu.js';
import { changeLang } from './components/changeLang.js';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

// Регистрируем команды бота
start(bot);
registerDriver(bot);
registerPassenger(bot);
changeLang(bot);
menu(bot);

bot.start();

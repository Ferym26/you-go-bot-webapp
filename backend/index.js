import dotenv from 'dotenv';
import { Bot } from 'grammy';

import { start } from './components/start.js';
import { registerPassenger } from './components/passenger.js';
// import { createTransferRequest } from './components/create-transfer-request.js';
import { registerDriver } from './components/driver.js';
import { menu } from './components/menu.js';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

start(bot);
// createTransferRequest(bot);
registerDriver(bot);
registerPassenger(bot);
menu(bot);

bot.start();

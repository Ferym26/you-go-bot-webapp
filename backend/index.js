import dotenv from 'dotenv';
import { Bot } from 'grammy';

import { start } from './components/start.js';
// import { createTransferRequest } from './components/create-transfer-request.js';
// import { showTransferRequests } from './components/show-transfer-requests.js';
// import { registerDriver } from './components/driver.js';
import { menu } from './components/menu.js';

dotenv.config();

const bot = new Bot(process.env.BOT_TOKEN);

start(bot);
// createTransferRequest(bot);
// showTransferRequests(bot);
// registerDriver(bot);
menu(bot);

bot.start();

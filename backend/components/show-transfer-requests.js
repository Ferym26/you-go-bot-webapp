import { db } from '../utils/firebase.js';
import { collection, doc, getDoc, setDoc, getDocs, query, where, updateDoc, addDoc } from 'firebase/firestore';

export const showTransferRequests = (bot) => {
    bot.callbackQuery('show_my_requests', async (ctx) => {
		await ctx.answerCallbackQuery();
		
        const userId = ctx.from.id;
        const querySnapshot = await getDocs(collection(db, 'transfer-requests'));
        const userRequests = [];

        querySnapshot.forEach(doc => {
            const data = doc.data();
            if (data.userId === userId) {
                userRequests.push({ id: doc.id, ...data });
            }
        });

        if (userRequests.length === 0) {
            return ctx.reply("🚫 У вас нет активных заявок.");
        }

        let message = "📋 Ваши заявки:\n";
        userRequests.forEach((req, index) => {
            message += `📌 ${index + 1}. ${req.from} → ${req.to}, ${req.datetime}\n`;
        });

        await ctx.reply(message);
    });
};

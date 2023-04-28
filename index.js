const express = require('express')
const expressApp = express()
const axios = require("axios");
const path = require("path")
const moment = require('moment')
expressApp.use(express.static('static'))
expressApp.use(express.json());
require('dotenv').config();

const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

expressApp.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

const state = {}
function calculateSums(totalDays) {
    const duration = moment.duration(totalDays, 'days');
    const years = duration.years();
    const months = duration.months();
    const days = duration.days();
    
    return {years, months, days}
  }
  bot.command('mezuniyyet', async (ctx) => {
    const chatId = ctx.message.chat.id;
    const message = 'İşə başlama tarixini qeyd edin';
  
    state[chatId] = {};
  
    await ctx.reply(message);
  
    bot.on('text', async (ctx) => {
      if (state[chatId].start === undefined) {
        state[chatId].start = ctx.message.text;
  
        const message = `İşdən çıxma tarixini qeyd edin`;
  
        await ctx.reply(message);
      } else if (state[chatId].end === undefined) {
        state[chatId].end = ctx.message.text;
  
        const message = `İşçiyə düşən aylıq məzuniyyət miqdarı?`;
  
        await ctx.reply(message);
      } else if (state[chatId].days === undefined) {
        state[chatId].days = ctx.message.text;
  
        const message = `İstifadə etdiyi gün`;
  
        await ctx.reply(message);
      } else if (state[chatId].used === undefined) {
        state[chatId].used = ctx.message.text;
        const date1 = new Date(state[chatId].end.split('-').reverse().join('-'));
        const date2 = new Date(state[chatId].start.split('-').reverse().join('-'));
  
        const timeDiff = date1.getTime() - date2.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        const message = `Nəticə:\n\nİşlədiyi gün sayı: <b>${dayDiff}</b> vəya <b>${calculateSums(dayDiff).years} il ${calculateSums(dayDiff).months} ay ${calculateSums(dayDiff).days} gün</b>\n1 günə düşən miqdar: <b>${(dayDiff / 365).toFixed(2)}</b>\nMəzuniyyət günlərinin sayı: <b>${(((dayDiff / 365) * state[chatId].days) - state[chatId].used).toFixed(2)}</b>`;
  
        await ctx.replyWithHTML(message);
  
        // Remove the event listener once all inputs are collected
        bot.off('text');
      }
    });
  });
  

bot.launch()
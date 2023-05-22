import { buildCommand } from '@/index';

module.exports = buildCommand({
  options: {
    cooldown: 5000,
  },
  run: async (ctx) => {
    await ctx.reply('Hello World!');
  },
});

import { Client, SessionManager } from '@/index';
import path from 'node:path';

// the polls feature is disabled due to the following reasons
// https://github.com/adiwajshing/Baileys/pull/2472
// https://github.com/hansputera/gampang/commit/9fc016e51ed2213b74ff2e6b0569dac91f5ffee1#diff-b2b5e6fc7aba6f0ce53ad8fb370e2850cf445c0e9633ea8e2ec071c2db8bc9ed
// const polls = {};

const session = new SessionManager(
  path.resolve(__dirname, 'sessions'),
  'folder',
);

const client = new Client(session, {
  'qr': {
    'store': 'terminal',
  },
  'prefixes': ['.'],
});

client.on('ready', () => {
  console.log(client.raw?.user, 'ready');
});

// client.on('poll', (poll) => (polls[poll.pollId] = poll));
// client.on('vote', async (vote, ctx) => {
//   const poll = polls[vote.pollId];
//
//   if (poll) {
//     console.log('vote', vote);
//     console.log('saved poll', poll);
//     console.log('raw message', ctx.raw);
//     const dec = await ctx.getPollUpdates(
//       ctx.raw,
//       {
//         encKey: poll.encKey,
//         sender: poll.sender,
//         options: poll.options,
//       },
//       true,
//     );
//
//     console.log(dec);
//   }
// });

client.command('is-work', async (ctx) => {
  console.log(await ctx.reply('It works!'));
});

client.command('test-poll', async (ctx) => {
  console.log(
    'Poll Result: ',
    await ctx.createPoll('Poll Test', ['Apple', 'Orange']),
  );
});

client.launch();

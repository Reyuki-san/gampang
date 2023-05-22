import { Client, SessionManager, ButtonBuilder } from '../dist/index';
// import { Client, SessionManager, ButtonBuilder } from '@/index';
import path from 'node:path';

const session = new SessionManager(
  path.resolve(__dirname, 'sessions'),
  'folder',
);

// const sessionFile = new SessionManager(
//   path.resolve(__dirname, 'session.json'),
//   'file',
// );

const client = new Client(session, {
  'qr': {
    // 'store': 'terminal',
    store: 'web',
    // options: {
    //   port: '3000',
    // },
  },
  'prefixes': ['.'],
});

client.on('ready', () => {
  console.log(client.raw?.user, 'ready');
});

client.command(
  'col',
  async (ctx) => {
    const collector = ctx.getCollector({
      'max': 5,
      'validation': async () => true,
    });

    collector.start();
    await collector.wait();

    console.log(collector.contexts[0].text);
  },
  {
    aliases: ['collector'],
  },
);

client.command(
  'test',
  (ctx) => {
    ctx.reply('pong');
  },
  {
    aliases: ['-', 'ping', 'pong'],
    cooldown: 1_000,
  },
);

client.command(
  'debug',
  async (ctx) => {
    // test feature on this scope
    const menu = new ButtonBuilder('list');
    menu
      .set('highlightText', "MENU | Hanif's Bot")
      .set('buttonText', 'menu')
      .set('footer', 'cc @ 2023')
      .set('header', ' lorem  lorem  lorem  lorem  lorem  lorem  lorem  lorem ')
      .set('sections', {
        title: 'debug command',
        buttons: [
          {
            cmdName: 'test',
            description: 'return ping',
            text: 'ping',
          },
        ],
      });
    ctx.replyWithButton(menu);
  },
  {
    'aliases': ['hi', 'hey', '_'],
    'cooldown': 1_000,
  },
);

client.command(
  'poll',
  async (ctx) => {
    await ctx.createPoll('Test', ['Apple', 'Orange']);
  },
  {
    aliases: ['testpoll'],
  },
);

client.on('poll', console.log);
client.on('vote', console.log);

client.addCustomEvent('messages.upsert', (_, { messages }) => {
  return new Promise(() => {
    console.log(JSON.stringify(messages));
  });
});

client.launch();

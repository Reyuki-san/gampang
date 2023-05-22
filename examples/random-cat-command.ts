import { Client, SessionManager } from '@/index';
import path from 'node:path';
import https from 'node:https';

const session = new SessionManager(
  path.resolve(__dirname, 'sessions'),
  'folder',
);
const client = new Client(session, {
  'qr': {
    'store': 'web',
    'options': {
      'port': 3000,
    },
  },
  'prefixes': ['.'],
});

const getMeowUrl = () =>
  new Promise((resolve, reject) => {
    https.get('https://aws.random.cat/meow', (res) => {
      let buffer = Buffer.alloc(0);

      res
        .on(
          'data',
          (chunk) => (buffer = Buffer.concat([buffer, Buffer.from(chunk)])),
        )
        .on('error', reject)
        .on('end', () => {
          const json = JSON.parse(buffer.toString());
          return resolve(json.file);
        });
    });
  });

client.on('ready', () => {
  console.log(client.raw?.user, 'ready');
});

client.command('meow', async (ctx) => {
  client.logger.info('Meow executed');
  const url = await getMeowUrl();
  await ctx.replyWithPhoto(url as string, 'free cat!');
});

client.launch();

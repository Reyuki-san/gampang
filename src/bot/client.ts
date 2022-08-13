import { DisconnectReason, UserFacingSocketConfig } from '@adiwajshing/baileys';
import EventEmitter from 'events';
import { unlink } from 'node:fs/promises';

import type {
  ClientEvents,
  RawClient,
  CommandClientOptions,
  Command,
  CommandOptions,
} from '../@typings';
import { createLogger } from '../logger';
import { createWA } from '../raw/client';
import { MessageCollector } from '../structures';
import { registerEvents } from './events';

export declare interface Client {
  on<U extends keyof ClientEvents>(event: U, listener: ClientEvents[U]): this;

  emit<U extends keyof ClientEvents>(
    event: U,
    ...args: Parameters<ClientEvents[U]>
  ): boolean;
}

/**
 * @class Client
 */
export class Client extends EventEmitter {
  /**
   * @constructor
   * @param {string} session Folder session path.
   * @param {CommandClientOptions} options Command Client options.
   */
  constructor(private session: string, private options?: CommandClientOptions) {
    super();

    if (typeof options !== 'object' || !Array.isArray(options.prefixes))
      options = {
        'prefixes': ['!'],
      };
  }

  public commands: Map<string, Command> = new Map();
  public logger = createLogger('Gampang');
  public raw?: RawClient;
  public collectors: Map<string, MessageCollector> = new Map();

  /**
   * Add a command
   * @param {string} name Command name.
   * @param {CommandOptions} opts Command options.
   * @param {Function} func Command function.
   * @return {CommandClient}
   */
  command(
    name: string,
    opts: CommandOptions = {
      'cooldown': 5000,
    },
    func: Command['run'],
  ): Client {
    if (typeof opts !== 'object')
      opts = {
        'cooldown': 5000,
      };

    if (this.commands.has(name)) {
      this.logger.warn(
        'Command',
        name,
        'registered, please use other command name',
      );
    }

    this.commands.set(name, {
      'run': func,
      'options': opts,
    });

    return this;
  }
  /**
   * Get CommandClient options
   * @return {CommandClientOptions}
   */
  public getOptions(): CommandClientOptions | undefined {
    return this.options;
  }

  /**
   * Launch bot.
   * @param {Omit<UserFacingSocketConfig, 'auth'>} options Launch options.
   * @return {Promise<void>}
   */
  async launch(options?: Omit<UserFacingSocketConfig, 'auth'>): Promise<void> {
    this.logger.info('Launching Gampang Client');
    if (typeof options !== 'object')
      options = {
        'logger': this.logger,
      };
    else if (!options.logger) options.logger = this.logger;

    this.raw = await createWA(this.session, options);

    this.raw.ev.on('connection.update', async (conn) => {
      if (conn.qr) this.emit('qr', conn.qr);
      else if (conn.lastDisconnect && conn.lastDisconnect.error) {
        switch (
          (
            conn.lastDisconnect.error as unknown as {
              output: {
                statusCode: number;
              };
            }
          ).output.statusCode
        ) {
          case DisconnectReason.loggedOut:
            this.logger.info('Logged out');
            this.emit('logout');
            if (this.raw?.ws) this.raw.ws.close();
            this.raw = undefined;
            break;
          case DisconnectReason.restartRequired:
            this.logger.warn('Restart required signal received, reconnecting');
            this.raw = undefined;
            this.launch(options);
            break;
          case DisconnectReason.badSession:
            this.logger.error('Bad Session, removing sessions folder');
            await unlink(this.session).catch((e) => {
              this.logger.error('Fail to remove session folder:', e);
            });
            this.logger.warn('Reconnecting');
            this.raw = undefined;
            this.launch(options);
            break;
        }
      }

      await this.raw?.getAuth().saveCreds();
    });

    registerEvents(this);
  }
}

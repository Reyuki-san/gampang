import makeWASocket, { AuthenticationState } from '@adiwajshing/baileys';
import type { Client } from '../bot';
import type { Context, MessageCollector } from '../structures';
import type { IStore } from './stores';

export type MakeWaSocketType = ReturnType<typeof makeWASocket>;
export type RawClient = MakeWaSocketType;

export type QrStoreType = 'file' | 'terminal' | 'web';

export interface ClientOptions {
  qr?: {
    store: QrStoreType;
    options?: Record<string, string | number>;
  };
  /**
   * Custom data store.
   */
  dataStore?: IStore<string, unknown>;
  prefixes?: string[];
  owners?: string[];
  middlewares?: {
    cooldown?: MiddlewareFunc;
  };
}

export type CollectorEventState = 'create' | 'end';

export interface ClientEvents {
  'qr': (code: string) => Promise<void> | void;
  'ready': () => Promise<void> | void;
  'logout': () => Promise<void> | void;
  'message': (context: Context) => Promise<void | void>;
  'collector': (
    state: CollectorEventState,
    collector: MessageCollector,
  ) => Promise<void> | void;
}

/**
 * Middleware Function
 * @param {Context} ctx Message context.
 * @return {Promise<boolean>} You should return boolean or an Error
 */
export type MiddlewareFunc = (ctx: Context) => Promise<boolean>;

export type AuthState = {
  state: AuthenticationState;
  saveCreds: () => Promise<void>;
};

/**
 * Authentication adapter function
 * @param {Client} client Gampang Client
 * @param {string} path Authentication session path (if required by adapter)
 * @param {state} AuthenticationState WhatsApp Authentication State
 * @return {Promise<void>}
 */
export type AdapterFn = (
  client: Client,
  path: string,
  state: AuthenticationState,
) => Promise<void>;

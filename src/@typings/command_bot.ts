import { Context } from '../structures';

export interface CommandOptions {
  description?: string;
  cooldown?: number;
  groupOnly?: boolean;
  privateOnly?: boolean;
  ownerOnly?: boolean;
}

export interface Command {
  options?: CommandOptions;
  run(ctx: Context): Promise<void> | void;
}

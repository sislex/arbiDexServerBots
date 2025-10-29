import { IActionParams, IBotParams } from '../store/state.types';
import { TestBot } from './test/testBot';

const botRegistry: Record<
  string,
  new (botParams: IBotParams, actionParams: IActionParams) => any
> = {
  TestBot,
};

export function getBot(botParams: IBotParams, actionParams: IActionParams) {
  const BotClass = botRegistry[botParams.botType];
  if (!BotClass) {
    throw new Error(`Unknown bot type: ${botParams.botType}`);
  }
  return new BotClass(botParams, actionParams);
}

import {IActionParams, IBotParams} from '../../store/state.types';
import { setTimeout as delay } from 'timers/promises';
import {runAction} from '../../actions/handlers';

export interface ITestBot<Params, Result> {
  createdAt: Date;
  actionCount: number;
  errorCount: number;
  errorMessages: string[];

  lastActionTimeStart: Date;
  lastActionTimeFinish: Date;
  lastLatency: number;
  lastActionResult: number;

  running: boolean;


  action(): Promise<Result>;
  getSettings(): {botParams: IBotParams, actionParams: IActionParams};
  getBotParams(): IBotParams;
  getActionParams(): IActionParams;
}

export class TestBot implements ITestBot<IActionParams, any> {
  createdAt: Date;
  actionCount: number;
  errorCount: number;
  errorMessages: string[];

  lastActionTimeStart: Date;
  lastActionTimeFinish: Date;
  lastLatency: number;
  lastActionResult: any;

  running: boolean;

  constructor(
    private readonly botParams: IBotParams,
    private readonly actionParams: IActionParams,
  ) {
    this.createdAt = new Date();
    this.actionCount = 0;
    this.errorCount = 0;
    this.errorMessages = [];

    void this.startAction();
  }

  async beforeActionLaunch() {
    this.lastActionTimeStart = new Date();
  }

  async startAction() {
    if (this.running) return;            // защита от повторного старта
    this.running = true;

    try {
      while (!this.botParams.paused) {
        await this.beforeActionLaunch();
        try {
          await this.action(this.actionParams);
        } catch (err: any) {
          this.errorCount += 1;
          this.errorMessages.push(String(err?.message ?? err));
        } finally {
          await this.afterActionLaunch();
        }

        // если не надо повторять — выходим
        if (!this.botParams.isRepeat) break;

        // задержка между повторами (мс)
        const d = this.botParams.delayBetweenRepeat ?? 0;
        if (d > 0) {
          await delay(d);
          // во время задержки можно прервать, если кто-то поставил paused = true
          if (this.botParams.paused) break;
        }

        // необязательно: лимит на количество действий
        if (this.botParams.maxActions && this.actionCount >= this.botParams.maxActions) break;
      }
    } finally {
      this.running = false;
    }
  }

  async afterActionLaunch() {
    this.lastActionTimeFinish= new Date();
    this.lastLatency = this.lastActionTimeFinish.getTime() - this.lastActionTimeStart.getTime();
    console.log('-----------------');
    console.log(this.actionCount, this.lastActionResult)
    this.actionCount = this.actionCount + 1;


    // послать данные this.lastActionResult  на внешний API
  }

  async action(actionParams = this.actionParams): Promise<any>{
    console.log('actionCount', this.actionCount);
    this.lastActionResult = await runAction(actionParams);
  }

  getBotParams(): IBotParams {
    return this.botParams;
  }

  getActionParams(): IActionParams {
    return this.actionParams;
  }

  getSettings(): {botParams: IBotParams, actionParams: IActionParams} {
    return {
      botParams: this.getBotParams(),
      actionParams: this.getActionParams(),
    }
  }
}

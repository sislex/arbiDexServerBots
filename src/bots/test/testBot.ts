import {IJobParams, IBotParams} from '../../store/state.types';
import { setTimeout as delay } from 'timers/promises';
import {runJob} from '../../jobs/handlers';

interface ITestBotState {
  createdAt: Date;
  jobCount: number;
  errorCount: number;
  errorMessages: string[];

  lastJobTimeStart: Date | null;
  lastJobTimeFinish: Date | null;
  lastLatency: number | null;
  lastJobResult: any;

  running: boolean;
  restartRequested: boolean;
}

function createInitialState(): ITestBotState {
  return {
    createdAt: new Date(),
    jobCount: 0,
    errorCount: 0,
    errorMessages: [],
    lastJobTimeStart: null,
    lastJobTimeFinish: null,
    lastLatency: null,
    lastJobResult: null,
    running: false,
    restartRequested: false,
  };
}

export interface ITestBot<Params, Result> {
  botState: ITestBotState;

  job(): Promise<Result>;
  getSettings(): {botParams: IBotParams, jobParams: IJobParams};
  setSettings(botParams: IBotParams, jobParams: IJobParams): {botParams: IBotParams, jobParams: IJobParams};
  getBotParams(): IBotParams;
  getJobParams(): IJobParams;
  setPaused(paused: boolean): boolean;
  restart(): boolean;
}

export class TestBot implements ITestBot<IJobParams, any> {
  botState: ITestBotState;

  constructor(
    private botParams: IBotParams,
    private jobParams: IJobParams,
  ) {
    this.resetState();
    void this.startJob();
  }

  async beforeJobLaunch() {
    this.botState.lastJobTimeStart = new Date();
  }

  async startJob() {
    if (this.botState.running) return;            // защита от повторного старта
    this.botState.running = true;

    try {
      while (!this.botParams.paused && !this.botState.restartRequested) {
        await this.beforeJobLaunch();
        try {
          this.botState.lastJobResult = await this.job(this.jobParams);
        } catch (err: any) {
          this.botState.errorCount += 1;
          this.botState.errorMessages.push(String(err?.message ?? err));
        } finally {
          await this.afterJobLaunch();
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
        if (this.botParams.maxJobs && this.botState.jobCount >= this.botParams.maxJobs) break;
      }
    } finally {
      this.botState.running = false;
      if (this.botState.restartRequested) {
        this.botState.restartRequested = false;
        this.resetState();
        void this.startJob();
      }
    }
  }

  async afterJobLaunch() {
    this.botState.lastJobTimeFinish= new Date();

    if (this.botState.lastJobTimeStart) {
      this.botState.lastLatency =
        this.botState.lastJobTimeFinish.getTime() -
        this.botState.lastJobTimeStart.getTime();
    } else {
      this.botState.lastLatency = null;
    }

    console.log('-----------------');
    console.log(this.botState.jobCount, this.botState.lastJobResult)
    this.botState.jobCount++;
  }

  async job(jobParams = this.jobParams): Promise<any>{
    return await runJob(jobParams);
  }

  getBotParams(): IBotParams {
    return this.botParams;
  }

  getJobParams(): IJobParams {
    return this.jobParams;
  }

  getSettings(): {botParams: IBotParams, jobParams: IJobParams} {
    return {
      botParams: this.getBotParams(),
      jobParams: this.getJobParams(),
    } as any
  }

  setSettings(botParams: IBotParams, jobParams: IJobParams): {botParams: IBotParams, jobParams: IJobParams} {
    this.botParams = botParams;
    this.jobParams = jobParams;
    return this.getSettings();
  }

  setPaused(paused: boolean) {
    this.botParams.paused = paused;
    if (!paused) {
      void this.startJob();
    }
    return  this.botParams.paused;
  }

  resetState(): boolean {
    this.botState = createInitialState();
    return true;
  }

  restart(): boolean {
    if (this.botState.running) {
      this.botState.restartRequested = true;
    } else {
      this.resetState();
      void this.startJob();
    }

    return true;
  }
}

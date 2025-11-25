import {IJobParams, IBotParams} from '../../store/state.types';
import { setTimeout as delay } from 'timers/promises';
import {runJob} from '../../jobs/handlers';

export interface ITestBot<Params, Result> {
  createdAt: Date;
  jobCount: number;
  errorCount: number;
  errorMessages: string[];

  lastJobTimeStart: Date;
  lastJobTimeFinish: Date;
  lastLatency: number;
  lastJobResult: number;

  running: boolean;


  job(): Promise<Result>;
  getSettings(): {botParams: IBotParams, jobParams: IJobParams};
  getBotParams(): IBotParams;
  getJobParams(): IJobParams;
}

export class TestBot implements ITestBot<IJobParams, any> {
  createdAt: Date;
  jobCount: number;
  errorCount: number;
  errorMessages: string[];

  lastJobTimeStart: Date;
  lastJobTimeFinish: Date;
  lastLatency: number;
  lastJobResult: any;

  running: boolean;

  constructor(
    private botParams: IBotParams,
    private jobParams: IJobParams,
  ) {
    this.createdAt = new Date();
    this.jobCount = 0;
    this.errorCount = 0;
    this.errorMessages = [];

    void this.startJob();
  }

  async beforeJobLaunch() {
    this.lastJobTimeStart = new Date();
  }

  async startJob() {
    if (this.running) return;            // защита от повторного старта
    this.running = true;

    try {
      while (!this.botParams.paused) {
        await this.beforeJobLaunch();
        try {
          await this.job(this.jobParams);
        } catch (err: any) {
          this.errorCount += 1;
          this.errorMessages.push(String(err?.message ?? err));
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
        if (this.botParams.maxJobs && this.jobCount >= this.botParams.maxJobs) break;
      }
    } finally {
      this.running = false;
    }
  }

  async afterJobLaunch() {
    this.lastJobTimeFinish= new Date();
    this.lastLatency = this.lastJobTimeFinish.getTime() - this.lastJobTimeStart.getTime();
    console.log('-----------------');
    console.log(this.jobCount, this.lastJobResult)
    this.jobCount = this.jobCount + 1;


    // послать данные this.lastJobResult  на внешний API
  }

  async job(jobParams = this.jobParams): Promise<any>{
    this.lastJobResult = await runJob(jobParams);
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
  }
}

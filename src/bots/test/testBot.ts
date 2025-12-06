import {IJobParams, IBotParams, IJobType} from '../../store/state.types';
import { setTimeout as delay } from 'timers/promises';
import {runJob} from '../../jobs/handlers';
import {createBotError, IBotError} from '../../halpers/createError';

interface ITestBotState {
  createdAt: Date;
  jobCount: number;
  errors: IBotError[];

  lastJobTimeStart: Date | null;
  lastJobTimeFinish: Date | null;
  latency: number;
  lastLatency: number | null;
  lastJobResult: any;

  running: boolean;
  restartRequested: boolean;
}

function createInitialState(): ITestBotState {
  return {
    createdAt: new Date(),
    jobCount: 0,
    errors: [],
    lastJobTimeStart: null,
    lastJobTimeFinish: null,
    latency: 0,
    lastLatency: null,
    lastJobResult: null,
    running: false,
    restartRequested: false,
  };
}

export interface ITestBot {
  botState: ITestBotState;

  job(jobParams?: IJobParams): Promise<any>;
  getSettings(): {botParams: IBotParams, jobParams: IJobParams};
  setSettings(botParams: IBotParams, jobParams: IJobParams): {botParams: IBotParams, jobParams: IJobParams};
  getBotParams(): IBotParams;
  getJobParams(): IJobParams;
  setPaused(paused: boolean): boolean;
  restart(): boolean;
  getErrors(): IBotError[];
}

export class TestBot implements ITestBot {
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
          const jobResult = await this.job(this.jobParams);
          this.setJobLatency();

          if (!jobResult.error) {
            this.botState.lastJobResult = jobResult;
          } else {
            const error = createBotError({
              errorCode: `JOB: ${jobResult.error}`,
              message: String(jobResult?.message),
              source: this.jobParams.jobType,
              details: this.jobParams,
              durationMs: this.botState.lastLatency,
            });
            this.pushError(error);
          }
        } catch (err: any) {
          this.setJobLatency();
          const error = createBotError({
            errorCode: `JOB: ${err?.status ?? 'UNKNOWN'}`,
            message: String(err?.message ?? err),
            source: this.jobParams.jobType,
            details: this.jobParams,
            durationMs: this.botState.lastLatency,
          });
          this.pushError(error);
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

  private pushError(error: IBotError) {
    this.botState.errors.push(error);

    const maxErrors = this.botParams.maxErrors ?? 100; // дефолт 100
    if (this.botState.errors.length > maxErrors) {
      this.botState.errors.shift();
    }
  }

  setJobLatency() {
    this.botState.lastJobTimeFinish = new Date();

    if (this.botState.lastJobTimeStart) {
      this.botState.lastLatency =
        this.botState.lastJobTimeFinish.getTime() -
        this.botState.lastJobTimeStart.getTime();
    } else {
      this.botState.lastLatency = null;
    }
  }

  async afterJobLaunch() {
    console.log('---------------------------------------------------');
    console.log('jobCount', this.botState.jobCount);
    console.log('blockNumber', this.botState.lastJobResult?.blockNumber);
    console.log('latencyMs', this.botState.lastJobResult?.latencyMs);
    if (this.jobParams.jobType === IJobType.GET_ARBITRUM_UNISWAP_V3_QUOTES_MULTI) {
      // console.log('blockNumber', this.botState);
      // console.log('lastJobResult.result', this.botState.lastJobResult.result);
      console.log('lastJobResult.result', this.botState.lastJobResult?.result?.[0]);
    } else {
      console.log('lastJobResult', this.botState.lastJobResult);
    }

    // --- обновление счётчика
    this.botState.jobCount++;

    // --- обновление средней latency
    if (this.botState.lastLatency != null) {
      const n = this.botState.jobCount;
      const avg = this.botState.latency;

      // новая средняя
      this.botState.latency = Math.ceil(avg + (this.botState.lastLatency - avg) / n);
    }
  }

  async job(jobParams: IJobParams = this.jobParams): Promise<any> {
    const timeoutMs = this.botParams.timeoutMs ?? 1000; // дефолт 100

    const jobPromise = runJob(jobParams);

    const timeoutPromise = (async () => {
      await delay(timeoutMs);
      const err: any = new Error(`Job execution exceeded ${timeoutMs} ms`);
      err.status = 'TIMEOUT';
      throw err;
    })();

    return Promise.race([jobPromise, timeoutPromise]);
  }

  getBotParams(): IBotParams {
    return this.botParams;
  }

  getJobParams(): IJobParams {
    return this.jobParams;
  }

  getSettings(): { botParams: IBotParams, jobParams: IJobParams } {
    return {
      botParams: this.getBotParams(),
      jobParams: this.getJobParams(),
    }
  }

  setSettings(botParams: IBotParams, jobParams: IJobParams): {botParams: IBotParams, jobParams: IJobParams} {
    this.botParams = botParams;
    this.jobParams = jobParams;
    return this.getSettings();
  }

  setPaused(paused: boolean): boolean {
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

  getErrors(): IBotError[] {
    return this.botState.errors;
  }
}

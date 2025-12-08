import {IJobParams, IBotParams, IJobType} from '../../store/state.types';
import { setTimeout as delay } from 'timers/promises';
import {runJob} from '../../jobs/handlers';
import {createBotError, IBotError} from '../../halpers/createError';
import {groupPairQuotes} from '../../arbitrage/groupPairQuotes.helper';
import {bestSellBuyArbitrage} from '../../arbitrage/bestSellBuy.arbitrage';
import {createArbitrage, IArbitrage} from '../../halpers/createArbitrage';

interface ITestBotState {
  createdAt: Date;
  jobCount: number;
  errors: IBotError[];

  lastJobTimeStart: Date | null;
  lastJobTimeFinish: Date | null;
  lastLatency: number | null;
  latency: number;
  lastJobResult: any;

  lastAnalyticsTimeStart: Date | null;
  lastAnalyticsTimeFinish: Date | null;
  lastAnalyticsLatency: number | null;
  analyticsLatency: number;
  lastAnalyticsResult: any;

  arbitrageList: any[],

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
    lastLatency: null,
    latency: 0,
    lastJobResult: null,

    lastAnalyticsTimeStart: null,
    lastAnalyticsTimeFinish: null,
    lastAnalyticsLatency: null,
    analyticsLatency: 0,
    lastAnalyticsResult: null,

    arbitrageList: [],

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

  async beforeAnalyticsLaunch() {
    this.botState.lastAnalyticsTimeStart = new Date();
  }

  async startAnalytics() {
    this.beforeAnalyticsLaunch();
    try {
      await this.analytics();
      this.setAnalyticsLatency();
    } catch (err: any) {
      // обработка ошибки аналитики
    } finally {
      this.afterAnalyticsLaunch();
    }
  }

  async analytics() {
    const groupedQuotes = groupPairQuotes(this.botState.lastJobResult.result);

    const results = {
      hasArbitrage: false,
      quotes: null as any,
      groups: {} as Record<string, any>,
    };

    for (const key in groupedQuotes) {
      const items = groupedQuotes[key];

      const best = bestSellBuyArbitrage(items);

      // spread может быть undefined → учитываем
      const hasArb = best.spread_pct !== undefined && best.spread_pct > 0;

      if (hasArb) {
        results.hasArbitrage = true;
        results.groups[key] = {
          key,
          num: items.length,
          hasArbitrage: hasArb,
          result: best,
        };
      }

    }

    if (results.hasArbitrage) {
      results.quotes = this.botState.lastJobResult;
    }

    this.botState.lastAnalyticsResult = results;
  }

  setAnalyticsLatency() {
    this.botState.lastAnalyticsTimeFinish = new Date();

    if (this.botState.lastAnalyticsTimeStart) {
      this.botState.lastAnalyticsLatency =
        this.botState.lastAnalyticsTimeFinish.getTime() -
        this.botState.lastAnalyticsTimeStart.getTime();
    } else {
      this.botState.lastAnalyticsLatency = null;
    }
  }


  async afterAnalyticsLaunch() {
    // --- обновление средней analyticsLatency
    if (this.botState.lastAnalyticsLatency != null) {
      const n = this.botState.jobCount;
      const avg = this.botState.analyticsLatency;

      this.botState.analyticsLatency = Math.ceil(avg + (this.botState.lastAnalyticsLatency - avg) / n);
    }

    if (this.botState.lastAnalyticsResult.hasArbitrage) {
      const arbitrage: IArbitrage = createArbitrage({details: this.botState.lastAnalyticsResult});
      this.pushArbitrage(arbitrage);
    }
  }

  private pushArbitrage(arbitrage: IArbitrage) {
    this.botState.arbitrageList.push(arbitrage);

    const maxArbitrage = this.botParams.maxArbitrage ?? 10000; // дефолт 10000
    if (this.botState.arbitrageList.length > maxArbitrage) {
      this.botState.arbitrageList.shift();
    }
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
            errorCode: `JOB: ${err?.code ?? 'UNKNOWN'}`,
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
    // --- обновление счётчика
    this.botState.jobCount++;

    // --- обновление средней latency
    if (this.botState.lastLatency != null) {
      const n = this.botState.jobCount;
      const avg = this.botState.latency;

      // новая средняя
      this.botState.latency = Math.ceil(avg + (this.botState.lastLatency - avg) / n);
    }

    this.startAnalytics();
  }

  async job(jobParams: IJobParams = this.jobParams): Promise<any> {
    const timeoutMs = this.botParams.timeoutMs ?? 1000; // дефолт 100

    const jobPromise = runJob(jobParams);

    const timeoutPromise = (async () => {
      await delay(timeoutMs);
      const err: any = new Error(`Job execution exceeded ${timeoutMs} ms`);
      err.code = 'TIMEOUT';
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

  getArbitrage(): IBotError[] {
    return this.botState.arbitrageList;
  }
}

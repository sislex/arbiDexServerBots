export class BotDto {
  botId: number;
  botName: string;
  description: string;
  jobId: number;
  serverId: number;
  paused: boolean;
  isRepeat: boolean;
  delayBetweenRepeat: number;
  maxJobs: number;
  maxErrors: number;
  timeoutMs: number;
}

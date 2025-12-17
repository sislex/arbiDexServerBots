export interface IBotError {
  createdAt: string;      // UTC ISO string
  errorCode: string;
  message: string;
  details?: any;
  durationMs?: number | null;
  source?: string;
}

// how to use createBotError
// const error = createBotError({
//   errorCode: "TIMEOUT",
//   message: "Quote request exceeded 3000ms",
//   durationMs: 3012,
//   source: "getUniswapQuote",
//   details: { amountIn: "100000000" }
// });

export function createBotError(params: {
  errorCode: string;
  message: string;
  source?: string;
  details?: any;
  durationMs?: number | null;
}): IBotError {
  return {
    createdAt: new Date().toISOString(),
    errorCode: params.errorCode,
    message: params.message,
    source: params.source,
    details: params.details,
    durationMs: params.durationMs,
  };
}

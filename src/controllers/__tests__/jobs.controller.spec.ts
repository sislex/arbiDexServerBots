/**
 * Unit-тесты для JobsController.
 *
 * Все внешние зависимости (getCexQuotes, getDexQuotesByArbQuoter) замоканы.
 *
 * Author: Aliaksei Razhnou
 */

import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from '../jobs.controller';
import { IJobType } from '../../store/state.types';
import type { CexQuotesResult } from '../../jobs/getCexQuotes/types';
import type { DexQuotesByArbQuoteResult } from '../../jobs/getDexQuotesByArbQuoter/helpers/types';

// ── Mocks ────────────────────────────────────────────────────

const mockGetCexQuotes = jest.fn();
const mockGetDexQuotesByArbQuoter = jest.fn();

jest.mock('../../jobs/getCexQuotes/getCexQuotes', () => ({
  getCexQuotes: (...args: any[]) => mockGetCexQuotes(...args),
}));

jest.mock('../../jobs/getDexQuotesByArbQuoter/getDexQuotesByArbQuoter', () => ({
  getDexQuotesByArbQuoter: (...args: any[]) => mockGetDexQuotesByArbQuoter(...args),
}));

// ── Helpers ──────────────────────────────────────────────────

function makeCexResult(overrides: Partial<CexQuotesResult> = {}): CexQuotesResult {
  return {
    ok: true,
    latencyMs: 42,
    quote: {
      symbol: 'ETHUSDC',
      bidPrice: 3500,
      bidQty: 1,
      askPrice: 3501,
      askQty: 1,
      midPrice: 3500.5,
      spread: 1,
      spreadPct: 0.028,
      latencyMs: 42,
    },
    ...overrides,
  };
}

function makeDexResult(overrides: Partial<DexQuotesByArbQuoteResult> = {}): DexQuotesByArbQuoteResult {
  return {
    ok: true,
    latencyMs: 120,
    blockNumber: 123456,
    filteredPairsCount: 10,
    bestBuyPrice: 3500,
    bestSellPrice: 3501,
    bestBuy: null,
    bestSell: null,
    allQuotes: [],
    ...overrides,
  };
}

// ── Tests ────────────────────────────────────────────────────

describe('JobsController', () => {
  let controller: JobsController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
    }).compile();

    controller = module.get<JobsController>(JobsController);
  });

  // ── runCexQuotes ──────────────────────────────────────────

  describe('POST /jobs/cex-quotes', () => {
    const validBody = {
      source: 'binance' as const,
      token0: 'ETH',
      token1: 'USDC',
    };

    it('should call getCexQuotes with correct params and return result', async () => {
      const expected = makeCexResult();
      mockGetCexQuotes.mockResolvedValue(expected);

      const result = await controller.runCexQuotes(validBody);

      expect(mockGetCexQuotes).toHaveBeenCalledTimes(1);
      expect(mockGetCexQuotes).toHaveBeenCalledWith({
        jobType: IJobType.GET_CEX_QUOTES,
        source: 'binance',
        token0: 'ETH',
        token1: 'USDC',
      });
      expect(result).toEqual(expected);
    });

    it('should pass different CEX sources correctly', async () => {
      mockGetCexQuotes.mockResolvedValue(makeCexResult());

      for (const source of ['mexc', 'bybit', 'okx', 'kucoin', 'gateio'] as const) {
        await controller.runCexQuotes({ source, token0: 'ETH', token1: 'USDT' });
        expect(mockGetCexQuotes).toHaveBeenLastCalledWith(
          expect.objectContaining({ source, token0: 'ETH', token1: 'USDT' }),
        );
      }
    });

    it('should propagate errors from getCexQuotes', async () => {
      mockGetCexQuotes.mockRejectedValue(new Error('CEX API down'));

      await expect(controller.runCexQuotes(validBody)).rejects.toThrow('CEX API down');
    });

    it('should return error result when ok is false', async () => {
      const errorResult = makeCexResult({
        ok: false,
        error: 'timeout',
        quote: null,
      });
      mockGetCexQuotes.mockResolvedValue(errorResult);

      const result = await controller.runCexQuotes(validBody);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('timeout');
    });
  });

  // ── runDexQuotes ──────────────────────────────────────────

  describe('POST /jobs/dex-quotes', () => {
    const validBody = {
      source: 'dex:arbitrum' as const,
      token0: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
      token1: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      rpcUrl: 'https://arb1.arbitrum.io/rpc',
      pairsToQuote: [
        {
          dex: 'uniswap' as const,
          version: 'v3' as const,
          poolAddress: '0xc6962004f452be9203591991d15f6b388e09e8d0',
          token0: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1' as `0x${string}`,
          token1: '0xaf88d065e77c8cc2239327c5edb3a432268e5831' as `0x${string}`,
          feePpm: 500,
        },
      ],
    };

    it('should call getDexQuotesByArbQuoter with correct params and return result', async () => {
      const expected = makeDexResult();
      mockGetDexQuotesByArbQuoter.mockResolvedValue(expected);

      const result = await controller.runDexQuotes(validBody);

      expect(mockGetDexQuotesByArbQuoter).toHaveBeenCalledTimes(1);
      expect(mockGetDexQuotesByArbQuoter).toHaveBeenCalledWith({
        jobType: IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
        source: validBody.source,
        token0: validBody.token0,
        token1: validBody.token1,
        rpcUrl: validBody.rpcUrl,
        pairsToQuote: validBody.pairsToQuote,
      });
      expect(result).toEqual(expected);
    });

    it('should pass optional stepPrefundPct', async () => {
      mockGetDexQuotesByArbQuoter.mockResolvedValue(makeDexResult());

      await controller.runDexQuotes({ ...validBody, stepPrefundPct: 5 });

      expect(mockGetDexQuotesByArbQuoter).toHaveBeenCalledWith(
        expect.objectContaining({ stepPrefundPct: 5 }),
      );
    });

    it('should propagate errors from getDexQuotesByArbQuoter', async () => {
      mockGetDexQuotesByArbQuoter.mockRejectedValue(new Error('RPC timeout'));

      await expect(controller.runDexQuotes(validBody)).rejects.toThrow('RPC timeout');
    });

    it('should return error result when ok is false', async () => {
      const errorResult = makeDexResult({
        ok: false,
        error: 'quoter reverted',
      });
      mockGetDexQuotesByArbQuoter.mockResolvedValue(errorResult);

      const result = await controller.runDexQuotes(validBody);

      expect(result.ok).toBe(false);
      expect(result.error).toBe('quoter reverted');
    });
  });

  // ── runJob (generic) ──────────────────────────────────────

  describe('POST /jobs/run', () => {
    it('should dispatch CEX job via jobType', async () => {
      mockGetCexQuotes.mockResolvedValue(makeCexResult());

      const result = await controller.runJob({
        jobType: IJobType.GET_CEX_QUOTES,
        source: 'binance',
        token0: 'ETH',
        token1: 'USDC',
      });

      expect(mockGetCexQuotes).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(true);
    });

    it('should dispatch DEX job via jobType', async () => {
      mockGetDexQuotesByArbQuoter.mockResolvedValue(makeDexResult());

      const result = await controller.runJob({
        jobType: IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
        source: 'dex:arbitrum',
        token0: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        token1: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        pairsToQuote: [],
      });

      expect(mockGetDexQuotesByArbQuoter).toHaveBeenCalledTimes(1);
      expect(result.ok).toBe(true);
    });

    it('should return error for unsupported jobType', async () => {
      const result = await controller.runJob({
        jobType: 'unknown_job' as any,
      });

      expect(result).toEqual({
        ok: false,
        error: expect.stringContaining('Unsupported jobType'),
      });
    });
  });
});


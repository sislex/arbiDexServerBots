/**
 * JobsController — run quote-collection jobs on demand via REST API.
 *
 * Supported jobs:
 *   - GET_CEX_QUOTES       → getCexQuotes(params)
 *   - GET_DEX_QUOTES_BY_ARB_QUOTER → getDexQuotesByArbQuoter(params)
 *
 * Author: Aliaksei Razhnou
 */

import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

import {
  IJobType,
  IJobParams_get_Cex_Quotes,
  IJobParams_get_Dex_Quotes_By_Arb_Quoter,
  CexSourceName,
  IPool,
} from '../store/state.types';
import { getCexQuotes } from '../jobs/getCexQuotes/getCexQuotes';
import { getDexQuotesByArbQuoter } from '../jobs/getDexQuotesByArbQuoter/getDexQuotesByArbQuoter';

// ── DTO types (for Swagger) ──────────────────────────────────

interface RunCexQuotesDto {
  source: CexSourceName;
  token0: string;
  token1: string;
}

interface RunDexQuotesDto {
  source: string;
  token0: string;
  token1: string;
  rpcUrl: string;
  pairsToQuote: IPool[];
  stepPrefundPct?: number;
}

// ── Controller ───────────────────────────────────────────────

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {

  /**
   * Run a CEX quotes job (binance, mexc, bybit, okx, kucoin, gateio, dzengi).
   */
  @Post('cex-quotes')
  @ApiOperation({
    summary: 'Run CEX quotes job',
    description:
      'Fetches bid/ask from the specified CEX exchange and forwards the result to arbiDexMarketData.\n\n' +
      'Supported sources: binance, mexc, bybit, okx, kucoin, gateio, dzengi.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['source', 'token0', 'token1'],
      properties: {
        source: {
          type: 'string',
          enum: ['binance', 'mexc', 'bybit', 'okx', 'kucoin', 'gateio', 'dzengi'],
          example: 'binance',
          description: 'CEX exchange name',
        },
        token0: { type: 'string', example: 'ETH', description: 'Base token symbol' },
        token1: { type: 'string', example: 'USDC', description: 'Quote token symbol' },
      },
    },
  })
  @ApiOkResponse({ description: 'CexQuotesResult — bid/ask quote from the exchange' })
  async runCexQuotes(@Body() body: RunCexQuotesDto) {
    const params: IJobParams_get_Cex_Quotes = {
      jobType: IJobType.GET_CEX_QUOTES,
      source: body.source,
      token0: body.token0,
      token1: body.token1,
    };
    return getCexQuotes(params);
  }

  /**
   * Run a DEX quotes job (Arbitrum ArbQuoter).
   */
  @Post('dex-quotes')
  @ApiOperation({
    summary: 'Run DEX quotes job (Arbitrum)',
    description:
      'Queries on-chain pools via ArbQuoter contract and returns best buy/sell prices.\n\n' +
      'Results are forwarded to arbiDexMarketData.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['source', 'token0', 'token1', 'rpcUrl', 'pairsToQuote'],
      properties: {
        source: { type: 'string', example: 'dex:arbitrum', description: 'DEX source identifier' },
        token0: { type: 'string', example: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', description: 'Base token address' },
        token1: { type: 'string', example: '0xaf88d065e77c8cc2239327c5edb3a432268e5831', description: 'Quote token address' },
        rpcUrl: { type: 'string', example: 'https://arb1.arbitrum.io/rpc', description: 'Arbitrum RPC URL' },
        stepPrefundPct: { type: 'number', example: 2, description: 'Step prefund percentage (optional)' },
        pairsToQuote: {
          type: 'array',
          description: 'List of pools to quote',
          items: {
            type: 'object',
            properties: {
              dex: { type: 'string', example: 'uniswap' },
              version: { type: 'string', example: 'v3' },
              poolAddress: { type: 'string', example: '0xc6962004f452be9203591991d15f6b388e09e8d0' },
              token0: { type: 'string', example: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1' },
              token1: { type: 'string', example: '0xaf88d065e77c8cc2239327c5edb3a432268e5831' },
              feePpm: { type: 'number', example: 500 },
            },
          },
        },
      },
    },
  })
  @ApiOkResponse({ description: 'DexQuotesByArbQuoteResult — best buy/sell prices from on-chain pools' })
  async runDexQuotes(@Body() body: RunDexQuotesDto) {
    const params: IJobParams_get_Dex_Quotes_By_Arb_Quoter = {
      jobType: IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER,
      source: body.source,
      token0: body.token0,
      token1: body.token1,
      rpcUrl: body.rpcUrl,
      pairsToQuote: body.pairsToQuote,
      ...(body.stepPrefundPct !== undefined && { stepPrefundPct: body.stepPrefundPct }),
    };
    return getDexQuotesByArbQuoter(params);
  }

  /**
   * Generic job runner — dispatches by jobType field.
   */
  @Post('run')
  @ApiOperation({
    summary: 'Run any supported job by jobType',
    description:
      'Generic endpoint: provide full job params including `jobType` field.\n\n' +
      'Supported jobTypes:\n' +
      '- `get_Cex_Quotes` — CEX bid/ask\n' +
      '- `get_Dex_Quotes_By_Arb_Quoter` — DEX on-chain quotes',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['jobType'],
      properties: {
        jobType: {
          type: 'string',
          enum: [IJobType.GET_CEX_QUOTES, IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER],
          example: IJobType.GET_CEX_QUOTES,
        },
        source: { type: 'string', example: 'binance' },
        token0: { type: 'string', example: 'ETH' },
        token1: { type: 'string', example: 'USDC' },
        rpcUrl: { type: 'string', example: 'https://arb1.arbitrum.io/rpc' },
        pairsToQuote: { type: 'array', items: { type: 'object' } },
        stepPrefundPct: { type: 'number' },
      },
    },
  })
  @ApiOkResponse({ description: 'Job result (shape depends on jobType)' })
  @ApiBadRequestResponse({ description: 'Unsupported jobType' })
  async runJob(@Body() body: any): Promise<any> {
    switch (body.jobType) {
      case IJobType.GET_CEX_QUOTES:
        return getCexQuotes(body as IJobParams_get_Cex_Quotes);

      case IJobType.GET_DEX_QUOTES_BY_ARB_QUOTER:
        return getDexQuotesByArbQuoter(body as IJobParams_get_Dex_Quotes_By_Arb_Quoter);

      default:
        return { ok: false, error: `Unsupported jobType: ${body.jobType}` };
    }
  }
}


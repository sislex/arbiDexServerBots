/**
 * Proxy controller — backwards-compatible /prices/* endpoints.
 * Forwards requests to arbiDexMarketData REST API.
 *
 * Author: Aliaksei Razhnou
 */
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiQuery } from '@nestjs/swagger';

const getMarketDataUrl = () => process.env.MARKET_DATA_URL ?? '';

async function fetchJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`MarketData ${res.status}: ${res.statusText}`);
  return res.json();
}

@ApiTags('prices')
@Controller('prices')
export class PricesProxyController {

  @Get('keys')
  @ApiOperation({ summary: 'All price keys', description: 'Proxy → arbiDexMarketData GET /store/keys' })
  async getKeys(): Promise<string[]> {
    return fetchJson(`${getMarketDataUrl()}/store/keys`);
  }

  @Get('all')
  @ApiOperation({ summary: 'All prices (all keys)', description: 'Fetches all keys then batch-loads series via arbiDexMarketData.' })
  async getAll(): Promise<Record<string, any>> {
    const baseUrl = getMarketDataUrl();
    const keys: string[] = await fetchJson(`${baseUrl}/store/keys`);
    if (keys.length === 0) return {};

    const batch = await fetchJson(`${baseUrl}/store/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keys }),
    });

    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = batch[key]?.points ?? [];
    }
    return result;
  }

  @Get('key/:key')
  @ApiOperation({ summary: 'Price series by key', description: 'Proxy → arbiDexMarketData GET /store/key/:key' })
  @ApiParam({ name: 'key', example: 'binance|ETHUSDC|bidPrice' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'from', required: false, type: Number })
  @ApiQuery({ name: 'to', required: false, type: Number })
  async getByKey(
    @Param('key') key: string,
    @Query('limit') limit?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const params = new URLSearchParams();
    if (limit) params.set('limit', limit);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return fetchJson(`${getMarketDataUrl()}/store/key/${encodeURIComponent(key)}${qs}`);
  }

  @Post('keys')
  @ApiOperation({ summary: 'Price series by key list', description: 'Proxy → arbiDexMarketData POST /store/keys' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        keys: { type: 'array', items: { type: 'string' }, example: ['binance|ETHUSDC|bidPrice'] },
      },
      required: ['keys'],
    },
  })
  async getByKeys(@Body() body: { keys: string[] }) {
    return fetchJson(`${getMarketDataUrl()}/store/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
}


import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {

  @Get("info")
  getInfo(): string {
    return "This is the DEX Arbitrage Bot API";
  }
}

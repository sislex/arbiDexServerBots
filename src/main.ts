import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import "dotenv/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // ── Swagger / OpenAPI ───────────────────────────────────
  const config = new DocumentBuilder()
    .setTitle('arbiDexServerBots')
    .setDescription(
      'Autonomous quote-collection server: 6 CEX + 1 DEX (Arbitrum) → arbiDexMarketData.\n\n' +
      'Collects bid/ask quotes, normalises to UnifiedQuoteResult, forwards via WebSocket.\n\n' +
      '**Market data (read/subscribe):** [arbiDexMarketData Swagger](http://45.135.182.251:3002/api)\n\n' +
      '**Author:** Aliaksei Razhnou',
    )
    .setVersion('1.0')
    .setContact('Aliaksei Razhnou', '', '')
    .addTag('info', 'Server information')
    .addTag('bots', 'Bot management — list, pause, resume, restart, configure')
    .addTag('store', 'Application state snapshot')
    .addTag('errors', 'Error management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'arbiDexServerBots — API',
    jsonDocumentUrl: 'api-json',
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Server running on port ${process.env.PORT ?? 3000}`);
  console.log(`📖 Swagger UI: http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(`📄 OpenAPI JSON: http://localhost:${process.env.PORT ?? 3000}/api-json`);
}
bootstrap();

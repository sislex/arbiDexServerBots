import { Controller, Get } from '@nestjs/common';
import { selectAppVersion } from '../store/selectors';
import { firstValueFrom } from 'rxjs';
import { AppStore } from '../store/app.store';

@Controller()
export class AppController {

  constructor(private readonly store: AppStore) {}

  @Get('info')
  async getInfo(): Promise<{ version: string, serverStartedAt: string }> {
    const version: string = await firstValueFrom(this.store.select$(selectAppVersion));
    const serverStartedAt: string = await firstValueFrom(this.store.select$(s => s.serverStartedAt));
    return {
      version,
      serverStartedAt,
    };
  }
}

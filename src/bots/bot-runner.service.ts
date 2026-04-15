import { Injectable } from '@nestjs/common';
import {selectBotsList, selectBotsRulesList} from '../store/selectors';
import {AppStore} from '../store/app.store';
import {withLatestFrom, Observable} from 'rxjs';
import {IJobParams, IBot, IBotParams, IBotsRule} from '../store/state.types';
import {distinctUntilChanged} from 'rxjs/operators';
import {getBot} from './bot-factory';

@Injectable()
export class BotRunnerService {

  private readonly botsRulesList$: Observable<IBotsRule[]>;
  private readonly botsList$: Observable<IBot[]>;

  constructor(private readonly store: AppStore) {
    this.botsRulesList$ = this.store.select$(selectBotsRulesList);
    this.botsList$ = this.store.select$(selectBotsList);

    // console.log('Bot Runner Service');
    this.startBots();
  }

  startBots() {
    this.botsRulesList$.pipe(
      distinctUntilChanged(),
      withLatestFrom(this.botsList$)
    ).subscribe(([botsRulesList, botsList]) => {
      console.log('botsRulesList.length', botsRulesList.length);
      if (botsRulesList?.length) {
        const newBotsList: IBot[] = [];
        const oldBotsList: IBot[] = [];
        botsRulesList.forEach((botRule: IBotsRule) => {
          const bot: IBot | undefined = botsList.find(botItem => botItem.id === botRule.id);
          if (!bot) {
            const newBot: IBot = {
              id: botRule.id,
              botInstance: getBot(botRule.botParams, botRule.jobParams),
            };
            newBotsList.push(newBot);
          } else {
            oldBotsList.push(bot);
          }
        })
        this.store.dispatch({ type: 'BOTS_LIST/SET_ALL', payload: {botsList: [...newBotsList, ...oldBotsList]} });
      } else {
        this.store.dispatch({ type: 'BOTS_LIST/SET_ALL', payload: {botsList: []} });
      }
    });
  }
}

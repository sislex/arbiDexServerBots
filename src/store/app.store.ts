import { Injectable } from '@nestjs/common';
import {BehaviorSubject, Subject} from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';
import { Action } from './actions';
import { AppState } from './state.types';
import { initialState } from './reducer';

function deepEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

@Injectable()
export class AppStore {
  private actions$ = new Subject<Action>();

  private readonly state$ = new BehaviorSubject<AppState>(initialState);

  dispatch(action: Action) {
    this.actions$.next(action);
  }

  select$<T>(project: (s: AppState) => T) {
    return this.state$.pipe(
      map(project),
      distinctUntilChanged(deepEqual)
    );
  }

  snapshot(): AppState {
    let cur!: AppState;
    const sub = this.state$.subscribe(s => (cur = s));
    sub.unsubscribe();
    return cur;
  }
}

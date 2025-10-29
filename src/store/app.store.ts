import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { map, distinctUntilChanged, scan } from 'rxjs/operators';
import { Action } from './actions';
import { AppState } from './state.types';
import { initialState, reducer } from './reducer';

function deepEqual(a: any, b: any) {
  return JSON.stringify(a) === JSON.stringify(b);
}

@Injectable()
export class AppStore implements OnModuleDestroy {
  private actions$ = new Subject<Action>();
  private readonly state$ = new BehaviorSubject<AppState>(initialState);
  private sub: Subscription;

  constructor() {
    this.sub = this.actions$
      .pipe(
        scan((state: AppState, action: Action) => reducer(state, action), initialState)
      )
      .subscribe(nextState => this.state$.next(nextState));
  }

  onModuleDestroy() {
    this.sub?.unsubscribe();
    this.state$.complete();
    this.actions$.complete();
  }

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
    return this.state$.getValue();
  }
}

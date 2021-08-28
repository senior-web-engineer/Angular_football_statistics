import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ScannerStoreService {
  private _strategies$: BehaviorSubject<any> = new BehaviorSubject(null);
  strategies = this._strategies$.asObservable();

  private _strategyMatches$: BehaviorSubject<any> = new BehaviorSubject(null);
  strategyMatches = this._strategyMatches$.asObservable();

  private _matches$: BehaviorSubject<any> = new BehaviorSubject(null);
  matches = this._matches$.asObservable();

  setStrategies(strategies): void {
    this._strategies$.next(strategies);
  }

  setStrategyMatches(strategyMatches): void {
    this._strategyMatches$.next(strategyMatches);
  }

  setMatches(matches): void {
    this._matches$.next(matches);
  }

}

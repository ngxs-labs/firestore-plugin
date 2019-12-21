import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { disconnectAction } from '../util/action-creator-helper';
import { of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Pipe({
  name: 'ngxsFirestoreConnect'
})
export class NgxsFirestorePipe implements PipeTransform, OnDestroy {

  private _connected: string[] = [];

  constructor(
    private store: Store
  ) {

  }

  transform(value, actionName: string) {
    const actionType = { type: actionName };
    if (!this._connected.includes(actionName)) {
      of({}).pipe(delay(0), tap(_ => this.store.dispatch(actionType))).subscribe();
      this._connected.push(actionName);
    }

    return value;
  }

  ngOnDestroy() {
    this._connected.map(actionName => {
      this.store.dispatch(disconnectAction({ type: actionName }));
    });

    this._connected = [];
  }

}

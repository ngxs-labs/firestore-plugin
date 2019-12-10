import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { disconnectAction } from './../helpers/action-creator-helper';

@Pipe({
  name: 'ngxsFirestore'
})
export class NgxsFirestorePipe implements PipeTransform, OnDestroy {

  private _connected: string[] = [];

  constructor(
    private store: Store
  ) {

  }

  transform(value: string, actionName: string) {
    const actionType = { type: actionName };
    if (!this._connected.includes(actionName)) {
      this.store.dispatch(actionType);
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

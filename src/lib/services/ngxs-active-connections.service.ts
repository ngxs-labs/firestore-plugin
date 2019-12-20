import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { NgxsFirestoreDebugActions } from '../states/ngxs-firestore-debug.actions';

@Injectable()
export class NgxsActiveConnectionsService implements OnDestroy {
  private subs: { [actionName: string]: Subscription } = {};

  constructor(
    private store: Store
  ) {
  }

  add(actionName: string, sub: Subscription) {
    this.subs[actionName] = sub;
    this.store.dispatch(new NgxsFirestoreDebugActions.AddConnection(actionName));
  }

  contains(actionName: string) {
    return Object.keys(this.subs).includes(actionName);
  }

  remove(actionName: string) {
    this.subs[actionName].unsubscribe();
    delete this.subs[actionName];
    this.store.dispatch(new NgxsFirestoreDebugActions.RemoveConnection(actionName));
  }

  ngOnDestroy() {
    Object.values(this.subs).forEach(sub => sub.unsubscribe());
  }

}

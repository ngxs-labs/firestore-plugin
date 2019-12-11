import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Store } from '@ngxs/store';
import { NgxsFirestoreActions } from '../states/ngxs-firestore.actions';

@Injectable()
export class NgxsActiveConnectionsService implements OnDestroy {
  private subs: { [id: string]: Subscription } = {};

  constructor(
    private store: Store
  ) {
  }

  add(token: string, sub: Subscription) {
    this.subs.token = sub;
    this.store.dispatch(new NgxsFirestoreActions.AddConnection(token));
  }

  contains(token: string) {
    return Object.keys(this.subs).includes(token);
  }

  remove(token: string) {
    this.subs.token.unsubscribe();
    delete this.subs.token;
    this.store.dispatch(new NgxsFirestoreActions.RemoveConnection(token));
  }

  ngOnDestroy() {
    Object.values(this.subs).forEach(sub => sub.unsubscribe());
  }

}

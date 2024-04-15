import { Injectable } from '@angular/core';
import { Action, NgxsOnInit, State, StateContext } from '@ngxs/store';
import { TestFirestore } from './../services/test.firestore';
import { Create, GetAll } from './test.actions';
import { Emitted, NgxsFirestoreConnect, StreamEmitted } from '@ngxs-labs/firestore-plugin';

export interface TestStateModel {
  items: any[];
}

@State<TestStateModel>({
  name: 'test',
  defaults: {
    items: []
  }
})
@Injectable()
export class TestState implements NgxsOnInit {
  constructor(private testFS: TestFirestore, private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

  ngxsOnInit(ctx: StateContext<TestStateModel>) {
    this.ngxsFirestoreConnect.connect(GetAll, {
      to: () => this.testFS.collection$()
    });
  }

  @Action(StreamEmitted(GetAll))
  getAll(ctx: StateContext<TestStateModel>, { payload }: Emitted<GetAll, any[]>) {
    ctx.patchState({
      items: payload || []
    });
  }

  @Action(Create)
  async sendMessage(ctx: StateContext<TestStateModel>, { payload }: any) {
    return this.testFS.create$(payload);
  }
}

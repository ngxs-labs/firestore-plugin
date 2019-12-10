import { State, Action, StateContext, NgxsOnInit, Selector, Store, Actions } from '@ngxs/store';
import { RacesActions } from './races.actions';
import { take, tap } from 'rxjs/operators';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';
import { Race } from './../../models/race';
import { RacesFirestore } from './../../services/races.firestore';

export interface RacesStateModel {
  races: Race[];
  bikes: Race[];
}

@State<RacesStateModel>({
  name: 'races',
  defaults: {
    races: [],
    bikes: []
  }
})
export class RacesState implements NgxsOnInit {

  @Selector() public static races(state: RacesStateModel) { return state.races; }
  @Selector() public static bikes(state: RacesStateModel) { return state.bikes; }

  constructor(
    private racesFS: RacesFirestore,
    private store: Store,
    private actions: Actions,
  ) {
    this.actions.pipe();
  }

  ngxsOnInit({ dispatch }: StateContext<RacesStateModel>) {

  }

  @Action([RacesActions.GetAll])
  getAll({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collection$().pipe(
      take(1),
      tap(races => {
        patchState({ races });
      })
    )
  }

  @NgxsFirestore(
    RacesActions.GetAll$,
    (payload): Partial<RacesStateModel> => ({ races: payload })
  )
  @Action(RacesActions.GetAll$)
  getAll$({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collection$().pipe();
  }


  @NgxsFirestore(
    RacesActions.GetBikes$,
    (payload): Partial<RacesStateModel> => ({ bikes: payload })
  )
  @Action(RacesActions.GetBikes$)
  getBikes$({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collection$(ref => ref.limit(2)).pipe();
  }

  @Action(RacesActions.Create)
  create({ patchState }: StateContext<RacesStateModel>, { payload }: RacesActions.Create) {
    const id = this.racesFS.createId();
    return this.racesFS.create$(id, {
      id,
      title: 'test 1',
      description: 'description 1'
    });
  }

  @Action(RacesActions.Update)
  update({ patchState }: StateContext<RacesStateModel>, { payload }: RacesActions.Update) {
    const races = this.store.selectSnapshot(RacesState.races);
    const id = races[Math.floor(Math.random() * races.length)].id;
    return this.racesFS.create$(id, {
      id,
      title: 'test updated',
      description: 'description updated'
    });
  }

  @Action(RacesActions.Delete)
  delete({ patchState }: StateContext<RacesStateModel>, { payload }: RacesActions.Delete) {
    return this.racesFS.delete$(payload);
  }
}

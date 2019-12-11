import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { patch, updateItem } from '@ngxs/store/operators';
import { RacesActions } from './races.actions';
import { tap, finalize } from 'rxjs/operators';
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
    private racesFS: RacesFirestore
  ) { }

  ngxsOnInit({ dispatch }: StateContext<RacesStateModel>) {

  }

  @Action([RacesActions.GetAllOnce])
  getAllOnce({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collection$().pipe(
      tap(races => {
        patchState({ races });
      })
    );
  }

  @Action([RacesActions.GetOnce])
  getOnce({ setState }: StateContext<RacesStateModel>, { payload }: RacesActions.GetOnce) {
    return this.racesFS.docOnce(payload).pipe(
      tap(race => {
        setState(patch({ races: updateItem(x => x.id === payload, race) }));
      })
    );
  }

  @NgxsFirestore(
    RacesActions.GetAll,
    (payload): Partial<RacesStateModel> => ({ races: payload })
  )
  @Action(RacesActions.GetAll)
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
  update({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Update) {
    return this.racesFS.update$(payload.id, {
      ...payload
    }).pipe(
      finalize(() => {
        dispatch(new RacesActions.GetOnce(payload.id));
      })
    );
  }

  @Action(RacesActions.Delete)
  delete({ patchState }: StateContext<RacesStateModel>, { payload }: RacesActions.Delete) {
    return this.racesFS.delete$(payload);
  }
}

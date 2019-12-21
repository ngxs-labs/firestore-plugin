import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { RacesActions } from './races.actions';
import { tap, finalize } from 'rxjs/operators';
import { NgxsFirestoreConnect } from '@ngxs-labs/firestore-plugin';
import { Race } from './../../models/race';
import { RacesFirestore } from './../../services/races.firestore';

export interface RacesStateModel {
  races: Race[];
  activeRaces: Race[];
}

@State<RacesStateModel>({
  name: 'races',
  defaults: {
    races: [],
    activeRaces: []
  }
})
export class RacesState implements NgxsOnInit {

  @Selector() static races(state: RacesStateModel) { return state.races; }
  @Selector() static activeRaces(state: RacesStateModel) { return state.activeRaces; }

  constructor(
    private racesFS: RacesFirestore
  ) { }

  ngxsOnInit({ dispatch }: StateContext<RacesStateModel>) {

  }

  @Action([RacesActions.GetAllOnce])
  getAllOnce({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collectionOnce$().pipe(
      tap(races => {
        patchState({ races });
      })
    );
  }

  @Action([RacesActions.GetOnce])
  getOnce({ setState, getState, patchState }: StateContext<RacesStateModel>, { payload }: RacesActions.GetOnce) {
    return this.racesFS.docOnce$(payload).pipe(
      tap(race => {
        const races = [...getState().races];
        const exists = races.findIndex(r => r.id === payload);
        if (exists > -1) {
          races.splice(exists, 1, race);
          patchState({ races });
        } else {
          patchState({ races: races.concat(race) });
        }
      })
    );
  }

  @NgxsFirestoreConnect(RacesActions.GetAll, (payload): Partial<RacesStateModel> => ({ races: payload }))
  @Action(RacesActions.GetAll)
  getAll({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collection$().pipe();
  }


  @NgxsFirestoreConnect(RacesActions.GetActive, (payload): Partial<RacesStateModel> => ({ activeRaces: payload }))
  @Action(RacesActions.GetActive)
  getBikes({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collection$(ref => ref.where('id', '>=', 'm')).pipe();
  }

  @Action(RacesActions.Create)
  create({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Create) {
    return this.racesFS.create$(payload.id, payload).pipe(
      finalize(() => {
        dispatch(new RacesActions.GetAllOnce());
      })
    );
  }

  @Action(RacesActions.Upsert)
  upsert({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Upsert) {
    return this.racesFS.upsert$(payload).pipe(
      finalize(() => {
        dispatch(new RacesActions.GetOnce(payload.id));
      })
    );
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
  delete({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Delete) {
    return this.racesFS.delete$(payload).pipe(
      finalize(() => {
        dispatch(new RacesActions.GetAllOnce());
      })
    );
  }
}

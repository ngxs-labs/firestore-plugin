import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { RacesActions } from './races.actions';
import { tap } from 'rxjs/operators';
import {
  NgxsFirestoreConnect,
  Connected,
  Emitted,
  Disconnected,
  StreamConnected,
  StreamEmitted,
  StreamDisconnected
} from '@ngxs-labs/firestore-plugin';
import { Race } from './../../models/race';
import { RacesFirestore } from './../../services/races.firestore';
import { patch, insertItem, updateItem, iif } from '@ngxs/store/operators';

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
  @Selector() static races(state: RacesStateModel) {
    return state.races;
  }
  @Selector() static activeRaces(state: RacesStateModel) {
    return state.activeRaces;
  }

  constructor(private racesFS: RacesFirestore, private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

  ngxsOnInit(ctx: StateContext<RacesStateModel>) {
    this.ngxsFirestoreConnect.connect(RacesActions.GetAll, {
      to: () => this.racesFS.collection$(),
      connectedActionFinishesOn: 'FirstEmit'
    });

    this.ngxsFirestoreConnect.connect(RacesActions.Get, {
      to: (action) => this.racesFS.doc$(action.payload),
      trackBy: (action) => action.payload
    });
  }

  @Action(StreamConnected(RacesActions.Get))
  getConnected(ctx: StateContext<RacesStateModel>, { action }: Connected<RacesActions.Get>) {
    console.log('[RacesActions.Get]  Connected');
  }

  @Action(StreamEmitted(RacesActions.Get))
  getEmitted(ctx: StateContext<RacesStateModel>, { action, payload }: Emitted<RacesActions.Get, Race>) {
    if (payload) {
      ctx.setState(
        patch<RacesStateModel>({
          races: iif(
            (races) => !!races.find((race) => race.id === payload.id),
            updateItem((race) => race.id === payload.id, patch(payload)),
            insertItem(payload)
          )
        })
      );
    }
  }

  @Action(StreamDisconnected(RacesActions.Get))
  getDisconnected(ctx: StateContext<RacesStateModel>, { action }: Disconnected<RacesActions.Get>) {
    console.log('[RacesActions.Get] Disconnected');
  }

  @Action(StreamEmitted(RacesActions.GetAll))
  getAllEmitted(ctx: StateContext<RacesStateModel>, { action, payload }: Emitted<RacesActions.Get, Race[]>) {
    ctx.setState(patch({ races: payload }));
  }

  @Action([RacesActions.GetAllOnce])
  getAllOnce({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collectionOnce$().pipe(
      tap((races) => {
        patchState({ races });
      })
    );
  }

  @Action([RacesActions.GetOnce])
  getOnce({ setState, getState, patchState }: StateContext<RacesStateModel>, { payload }: RacesActions.GetOnce) {
    return this.racesFS.docOnce$(payload).pipe(
      tap((race) => {
        const races = [...getState().races];
        const exists = races.findIndex((r) => r.id === payload);
        if (exists > -1) {
          races.splice(exists, 1, race);
          patchState({ races });
        } else {
          patchState({ races: races.concat(race) });
        }
      })
    );
  }

  @Action(RacesActions.Create)
  create({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Create) {
    return this.racesFS.create$(payload.id, payload);
  }

  @Action(RacesActions.Upsert)
  upsert({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Upsert) {
    return this.racesFS.upsert$(payload);
  }

  @Action(RacesActions.Update)
  update({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Update) {
    return this.racesFS.update$(payload.id, payload);
  }

  @Action(RacesActions.Delete)
  delete({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Delete) {
    return this.racesFS.delete$(payload);
  }
}

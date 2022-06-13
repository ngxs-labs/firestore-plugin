import { Injectable } from '@angular/core';
import { CollectionReference, orderBy, query, where } from '@angular/fire/firestore';
import {
  Connected,
  Disconnected,
  Emitted,
  Errored,
  NgxsFirestoreConnect,
  NgxsFirestorePageService,
  StreamConnected,
  StreamDisconnected,
  StreamEmitted,
  StreamErrored
} from '@ngxs-labs/firestore-plugin';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { iif, insertItem, patch, updateItem } from '@ngxs/store/operators';
import { tap } from 'rxjs/operators';
import { Race } from './../../models/race';
import { RacesFirestore } from './../../services/races.firestore';
import { RacesActions } from './races.actions';

export interface RacesStateModel {
  races: Race[];
  pageId: string;
  activeRaces: Race[];
}

@State<RacesStateModel>({
  name: 'races',
  defaults: {
    races: [],
    pageId: '',
    activeRaces: []
  }
})
@Injectable()
export class RacesState implements NgxsOnInit {
  @Selector() static races(state: RacesStateModel) {
    return state.races;
  }
  @Selector() static activeRaces(state: RacesStateModel) {
    return state.activeRaces;
  }
  @Selector() static pageId(state: RacesStateModel) {
    return state.pageId;
  }

  constructor(
    private racesFS: RacesFirestore,
    private ngxsFirestoreConnect: NgxsFirestoreConnect,
    private ngxsFirestorePage: NgxsFirestorePageService
  ) {}

  ngxsOnInit(ctx: StateContext<RacesStateModel>) {
    this.ngxsFirestoreConnect.connect(RacesActions.GetAll, {
      to: () => this.racesFS.collection$(),
      connectedActionFinishesOn: 'FirstEmit'
    });

    this.ngxsFirestoreConnect.connect(RacesActions.Get, {
      to: ({ payload }) => this.racesFS.doc$(payload)
    });

    this.ngxsFirestoreConnect.connect(RacesActions.GetPages, {
      to: () => {
        const obs$ = this.ngxsFirestorePage.create<Race>(
          (pageFn) => this.racesFS.collection$((ref) => query<Race>(pageFn(ref), where('s', '>=', 's'))),
          5,
          [{ fieldPath: 's' }, { fieldPath: 'title' }]
        );

        return obs$;
      }
    });

    this.ngxsFirestoreConnect.connect(RacesActions.Error, {
      to: () =>
        this.racesFS.collection$((ref: CollectionReference<Race>) =>
          query(ref, where('aaa', '==', 0), where('bbb', '==', 0), orderBy('aaa'))
        )
    });
  }

  @Action(StreamErrored(RacesActions.Error))
  error(ctx: StateContext<RacesStateModel>, { error }: Errored<RacesActions.Error>) {}

  @Action(StreamEmitted(RacesActions.GetPages))
  getPageEmitted(
    ctx: StateContext<RacesStateModel>,
    { action, payload }: Emitted<RacesActions.GetPages, { results: Race[]; pageId: string }>
  ) {
    ctx.setState(patch({ races: payload.results || [], pageId: payload.pageId }));
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
            (races) => !!races.find((race) => race.raceId === payload.raceId),
            updateItem((race) => race.raceId === payload.raceId, patch(payload)),
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
  getOnce({ getState, patchState }: StateContext<RacesStateModel>, { payload }: RacesActions.GetOnce) {
    return this.racesFS.docOnce$(payload, { source: 'default' }).pipe(
      tap((race) => {
        if (!race) {
          return;
        }

        const races = [...getState().races];
        const exists = races.findIndex((r) => r.raceId === payload);
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
    return this.racesFS.create$(payload);
  }

  @Action(RacesActions.Upsert)
  upsert({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Upsert) {
    return this.racesFS.upsert$(payload);
  }

  @Action(RacesActions.Update)
  update({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Update) {
    return this.racesFS.update$(payload.raceId, payload);
  }

  @Action(RacesActions.UpdateIfExists)
  updateIfExists({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Update) {
    return this.racesFS.updateIfExists(payload.raceId, payload);
  }

  @Action(RacesActions.Delete)
  delete({ patchState, dispatch }: StateContext<RacesStateModel>, { payload }: RacesActions.Delete) {
    return this.racesFS.delete$(payload);
  }
}

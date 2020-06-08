import {
    Connected,
    Disconnected,
    Emitted,
    NgxsFirestoreConnect,
    StreamConnected,
    StreamDisconnected,
    StreamEmitted
} from '@ngxs-labs/firestore-plugin';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { append, patch } from '@ngxs/store/operators';
import { Race } from '../../models/race';
import { RacesActions } from '../../states/races/races.actions';
import { RacesByPageActions } from './races.actions';
import { RacesFirestorePagination } from './races.firestore';

export interface RacesStateModel {
    races: Race[];
    activeRaces: Race[];
}

@State<RacesStateModel>({
    name: 'racesbypage',
    defaults: {
        races: [],
        activeRaces: []
    }
})
export class PaginationRacesState implements NgxsOnInit {
    @Selector() static races(state: RacesStateModel) {
        return state.races;
    }
    constructor(private racesFS: RacesFirestorePagination, private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

    ngxsOnInit() {
        this.ngxsFirestoreConnect.connect(RacesByPageActions.Get, {
            to: () => this.racesFS.collection$()
        });
    }

    @Action(StreamConnected(RacesByPageActions.Get))
    getConnected(ctx: StateContext<RacesStateModel>, { action }: Connected<RacesByPageActions.Get>) {
        // do something when connected
    }

    @Action(StreamEmitted(RacesByPageActions.Get))
    getEmitted(ctx: StateContext<RacesStateModel>, { action, payload }: Emitted<RacesByPageActions.Get, Race[]>) {
        ctx.setState(
            patch({
                races: append([...payload])
            })
        );
    }

    @Action(StreamDisconnected(RacesByPageActions.Get))
    getDisconnected(ctx: StateContext<RacesStateModel>, { action }: Disconnected<RacesActions.Get>) {
        // do something when disconnected
    }

    @Action(RacesByPageActions.Fetch)
    fetch(ctx: StateContext<RacesStateModel>, { payload }: RacesByPageActions.Fetch) {
        this.racesFS.fetch(payload);
    }
}

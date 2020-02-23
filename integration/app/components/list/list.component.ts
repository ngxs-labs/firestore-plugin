import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { RacesActions } from './../../states/races/races.actions';
import { RacesState } from './../../states/races/races.state';
import { Race } from './../../models/race';
import { Chance } from 'chance';
import { map } from 'rxjs/operators';
import { NgxsFirestoreActions } from '@ngxs-labs/firestore-plugin';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
    races$ = this.store.select(RacesState.races);
    total$ = this.races$.pipe(map((races) => races.length));

    constructor(private store: Store) {}

    ngOnInit() {
        // this.store.dispatch(new RacesActions.GetAll());
        this.store.dispatch(new RacesActions.Get('^yGso$7at*#lA5xpFmz0'));
    }

    disconnect() {
        this.store.dispatch(new NgxsFirestoreActions.Disconnect(new RacesActions.Get('^yGso$7at*#lA5xpFmz0')));
    }

    reconnect() {
        this.store.dispatch(new RacesActions.GetAll());
    }

    create() {
        const chance = new Chance();
        const race: Partial<Race> = {};
        race.id = chance.string({ length: 20 });
        race.name = chance.string();
        race.title = chance.string();
        race.description = chance.word();
        this.store.dispatch(new RacesActions.Create(race));
    }

    update(race: Race) {
        const chance = new Chance();

        this.store.dispatch(
            new RacesActions.Update({
                ...race,
                name: chance.string(),
                description: chance.word()
            })
        );
    }

    delete(id: string) {
        this.store.dispatch(new RacesActions.Delete(id));
    }

    ngOnDestroy() {
        // this.store.dispatch(new Disconnect(RacesActions.GetAll));
    }
}

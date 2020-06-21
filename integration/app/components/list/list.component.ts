import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { RacesActions } from './../../states/races/races.actions';
import { RacesState } from './../../states/races/races.state';
import { Race } from './../../models/race';
import { Chance } from 'chance';
import { map } from 'rxjs/operators';
import { Disconnect } from '@ngxs-labs/firestore-plugin';
import { actionsExecuting } from '@ngxs-labs/actions-executing';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
    races$ = this.store.select(RacesState.races);
    total$ = this.races$.pipe(map((races) => races.length));

    getAllExecuting$ = this.store.select(actionsExecuting([RacesActions.GetAll]));
    getPageExecuting$ = this.store.select(actionsExecuting([RacesActions.NextPage]));

    constructor(private store: Store) {}

    ngOnInit() {
        // this.store.dispatch(new RacesActions.GetAll());
    }

    disconnect() {
        this.store.dispatch(new Disconnect(RacesActions.GetAll));
    }

    reconnect() {
        this.store.dispatch(new RacesActions.GetAll());
    }

    getAll() {
        this.store.dispatch(new RacesActions.GetAll());
    }

    getPage() {
        this.store.dispatch(new RacesActions.NextPage());
    }

    create() {
        const chance = new Chance();
        const race: Partial<Race> = {};
        race.id = chance.string({ length: 20 });
        race.name = chance.city();
        race.order = chance.year();
        race.title = chance.name();
        race.description = chance.sentence();
        this.store.dispatch(new RacesActions.Create(race));
    }

    update(race: Race) {
        const chance = new Chance();

        this.store.dispatch(
            new RacesActions.Update({
                ...race,
                name: chance.city(),
                description: chance.sentence()
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

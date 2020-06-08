import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { RacesByPageActions } from './races.pagination/races.actions';
import { PaginationRacesState } from './races.pagination/races.state';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnInit {
    races$ = this.store.select(PaginationRacesState.races);
    constructor(private store: Store) {}
    ngOnInit() {
        this.store.dispatch(new RacesByPageActions.Get());
    }
    fetch() {
        this.store.dispatch(new RacesByPageActions.Fetch());
    }
}

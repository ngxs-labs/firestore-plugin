import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { RacesActions } from '../../states/races/races.actions';
import { RacesState } from '../../states/races/races.state';
import { map } from 'rxjs/operators';
import { actionsExecuting } from '@ngxs-labs/actions-executing';

@Component({
  selector: 'app-list-once',
  templateUrl: './list-once.component.html',
  styleUrls: ['./list-once.component.scss'],
  standalone: false
})
export class ListOnceComponent implements OnInit, OnDestroy {
  races$ = this.store.select(RacesState.races);
  loading$ = this.store.select(actionsExecuting([RacesActions.GetAll, RacesActions.Get]));
  loaded$ = this.loading$.pipe(map((loading) => !loading));

  constructor(private store: Store) {}

  ngOnInit() {}

  getAll() {
    this.store.dispatch(new RacesActions.GetAllOnce());
  }

  get() {
    this.store.dispatch(new RacesActions.GetOnce('Pn7RYUL0]1!*JDqWw)S5'));
  }

  ngOnDestroy() {}
}

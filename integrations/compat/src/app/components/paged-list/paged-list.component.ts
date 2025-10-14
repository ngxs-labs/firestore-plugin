import { Component, OnInit } from '@angular/core';
import { actionsExecuting } from '@ngxs-labs/actions-executing';
import { GetLastPage, GetNextPage } from '@ngxs-labs/firestore-plugin';
import { Store } from '@ngxs/store';
import { AttendeesActions } from '../../states/attendees/attendees.actions';
import { AttendeesState } from '../../states/attendees/attendees.state';
import { RacesActions } from '../../states/races/races.actions';
import { RacesState } from '../../states/races/races.state';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-paged-list',
  templateUrl: './paged-list.component.html',
  styleUrls: ['./paged-list.component.scss']
})
export class PagedListComponent implements OnInit {
  races$ = this.store.select(RacesState.races);
  attendees$ = this.store.select(AttendeesState.attendees);
  nextPageExecuting$ = this.store.select(actionsExecuting([GetNextPage]));
  lastPageExecuting$ = this.store.select(actionsExecuting([GetLastPage]));
  loaded$ = this.store
    .select(actionsExecuting([RacesActions.GetPages, AttendeesActions.GetPages]))
    .pipe(map((loading) => !loading));

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(new RacesActions.GetPages());
    this.store.dispatch(new AttendeesActions.GetPages());
  }

  nextPage() {
    const pageId = this.store.selectSnapshot(RacesState.pageId);
    this.store.dispatch(new GetNextPage(pageId));
  }

  lastPage() {
    const pageId = this.store.selectSnapshot(RacesState.pageId);
    this.store.dispatch(new GetLastPage(pageId));
  }

  nextPageAttendees() {
    const pageId = this.store.selectSnapshot(AttendeesState.pageId);
    this.store.dispatch(new GetNextPage(pageId));
  }

  lastPageAttendees() {
    const pageId = this.store.selectSnapshot(AttendeesState.pageId);
    this.store.dispatch(new GetLastPage(pageId));
  }
}

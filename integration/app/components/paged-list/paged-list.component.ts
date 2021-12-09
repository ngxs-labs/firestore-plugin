import { Component, OnInit } from '@angular/core';
import { actionsExecuting } from '@ngxs-labs/actions-executing';
import { GetNextPage } from '@ngxs-labs/firestore-plugin';
import { Store } from '@ngxs/store';
import { AttendeesActions } from 'integration/app/states/attendees/attendees.actions';
import { AttendeesState } from 'integration/app/states/attendees/attendees.state';
import { RacesActions } from 'integration/app/states/races/races.actions';
import { RacesState } from 'integration/app/states/races/races.state';

@Component({
  selector: 'app-paged-list',
  templateUrl: './paged-list.component.html',
  styleUrls: ['./paged-list.component.scss']
})
export class PagedListComponent implements OnInit {
  races$ = this.store.select(RacesState.races);
  attendees$ = this.store.select(AttendeesState.attendees);
  nextPageExecuting$ = this.store.select(actionsExecuting([GetNextPage]));

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(new RacesActions.GetPages());
    this.store.dispatch(new AttendeesActions.GetPages());
  }

  nextPage() {
    const pageId = this.store.selectSnapshot(RacesState.pageId);
    this.store.dispatch(new GetNextPage(pageId));
  }

  nextPageAttendees() {
    const pageId = this.store.selectSnapshot(AttendeesState.pageId);
    this.store.dispatch(new GetNextPage(pageId));
  }
}

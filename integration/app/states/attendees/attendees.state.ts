import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { AttendeesActions } from './attendees.actions';
import { NgxsFirestoreConnect, Emitted, StreamEmitted, NgxsFirestorePageService } from '@ngxs-labs/firestore-plugin';
import { patch } from '@ngxs/store/operators';
import { Injectable } from '@angular/core';
import { Attendee } from 'integration/app/models/attendee';
import { AttendeesFirestore } from 'integration/app/services/attendees.firestore';

export interface AttendeesStateModel {
  attendees: Attendee[];
  pageId: string;
}

@State<AttendeesStateModel>({
  name: 'attendees',
  defaults: {
    attendees: [],
    pageId: ''
  }
})
@Injectable()
export class AttendeesState implements NgxsOnInit {
  @Selector() static attendees(state: AttendeesStateModel) {
    return state.attendees;
  }

  @Selector() static pageId(state: AttendeesStateModel) {
    return state.pageId;
  }

  constructor(
    private attendeesFS: AttendeesFirestore,
    private ngxsFirestoreConnect: NgxsFirestoreConnect,
    private nxgsFirestorePage: NgxsFirestorePageService
  ) {}

  ngxsOnInit(ctx: StateContext<AttendeesStateModel>) {
    this.ngxsFirestoreConnect.connect(AttendeesActions.GetPages, {
      to: () => {
        const obs$ = this.nxgsFirestorePage.create(
          (pageFn) =>
            this.attendeesFS.collection$((ref) => {
              return pageFn(ref);
            }),
          5,
          [{ fieldPath: 'id' }]
        );

        return obs$;
      }
    });
  }

  @Action(StreamEmitted(AttendeesActions.GetPages))
  getPageEmitted(
    ctx: StateContext<AttendeesStateModel>,
    { action, payload }: Emitted<AttendeesActions.GetPages, { results: Attendee[]; pageId: string }>
  ) {
    ctx.setState(patch({ attendees: payload.results || [], pageId: payload.pageId }));
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { RacesActions } from './../../states/races/races.actions';
import { RacesState } from './../../states/races/races.state';
import { Disconnect } from '@ngxs-labs/firestore-plugin';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {

  public races$ = this.store.select(RacesState.races);
  public bikes$ = this.store.select(RacesState.bikes);

  constructor(
    private store: Store
  ) { }


  ngOnInit() {
    this.store.dispatch(new RacesActions.GetAll$());
  }

  ngOnDestroy() {
    this.store.dispatch(new Disconnect(RacesActions.GetAll$));
  }

}

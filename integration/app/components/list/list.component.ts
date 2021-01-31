import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { RacesActions } from './../../states/races/races.actions';
import { RacesState } from './../../states/races/races.state';
import { Race } from './../../models/race';
import { Chance } from 'chance';
import { map } from 'rxjs/operators';
import { actionsExecuting } from '@ngxs-labs/actions-executing';
import { Disconnect } from '@ngxs-labs/firestore-plugin';
import { ClassificationsActions } from 'integration/app/states/classifications/classifications.actions';
import { ClassificationsState } from 'integration/app/states/classifications/classifications.state';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit, OnDestroy {
  races$ = this.store.select(RacesState.races);
  classifications$ = this.store.select(ClassificationsState.classifications);
  total$ = this.races$.pipe(map((races) => races.length));

  gettingAll$ = this.store.select(actionsExecuting([RacesActions.GetAll]));
  gettingSingle$ = this.store.select(actionsExecuting([RacesActions.Get]));
  creating$ = this.store.select(actionsExecuting([RacesActions.Create]));
  loading$ = this.store.select(actionsExecuting([RacesActions.GetAll, RacesActions.Get]));
  loaded$ = this.loading$.pipe(map((loading) => !loading));
  disconnecting$ = this.store.select(actionsExecuting([Disconnect]));
  getPageExecuting$ = this.store.select(actionsExecuting([RacesActions.NextPage]));
  throwingError$ = this.store.select(actionsExecuting([RacesActions.Error]));
  gettingSubCollection$ = this.store.select(actionsExecuting([ClassificationsActions.GetAll]));

  constructor(private store: Store) {}

  ngOnInit() {
    // this.store.dispatch(new RacesActions.GetAll());
    // this.store.dispatch(new RacesActions.Get('8iI)0md[dTAFC[wo!&[N'));
    // this.store.dispatch(new RacesActions.Get('AAAAAA'));
  }

  disconnect() {
    // this.store.dispatch(new DisconnectStream(RacesActions.GetAll));
    this.store.dispatch(new Disconnect(new RacesActions.Get(']cfct5iL8(H)@Sl#xTcS')));
  }

  reconnect() {
    // this.store.dispatch(new RacesActions.GetAll());
    // this.store.dispatch(new RacesActions.Get('8iI)0md[dTAFC[wo!&[N'));

    this.store.dispatch(new RacesActions.Get(']cfct5iL8(H)@Sl#xTcS'));
  }

  getAll() {
    this.store.dispatch(new RacesActions.GetAll());
  }

  getSubCollection() {
    this.store.dispatch(new ClassificationsActions.GetAll('0NN6x6GKDGumGU5dtnk4'));
  }

  getPage() {
    this.store.dispatch(new RacesActions.NextPage());
  }

  get() {
    // const ids = ['4(CPo6Fy(7Mo^YklK[Q8', 'FouQf@q4FHJcc&%cnmkT', 'LBWH5KvYp43ia)!IYpwv', ']cfct5iL8(H)@Sl#xTcS'];
    // for (let index = 0; index < ids.length; index++) {
    //   setTimeout(() => this.store.dispatch(new RacesActions.Get(ids[index])), 1000 * index);
    // }

    this.store.dispatch(new RacesActions.Get('0V!^fMrWetbs68]ob6%M'));
  }

  create() {
    const chance = new Chance();
    const race: Partial<Race> = {};
    race.id = chance.string({ length: 20 });
    race.name = chance.word();
    race.title = chance.word();
    race.description = chance.sentence();
    this.store.dispatch(new RacesActions.Create(race));

    // this.store.dispatch(new RacesActions.Create({
    //   id: 'test-id',
    //   name: 'Test',
    //   title: 'Test Title',
    //   description: 'Test description',
    // }));
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
    this.store.dispatch(new Disconnect(RacesActions.GetAll));
  }

  throwError() {
    this.store.dispatch(new RacesActions.Error());
  }
}

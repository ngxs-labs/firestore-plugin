import { Selector, State } from '@ngxs/store';
import { Race } from '../../models/race';
import { NgxsFirestoreStateModel, NgxsFirestoreState } from 'src/lib/states/ngxs-firestore.state';
import { RacesFirestore } from 'integration/app/services/races.firestore';
import { attachAction } from '@ngxs-labs/attach-action';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';

@State<NgxsFirestoreStateModel<Race>>({
  name: 'races_child',
  defaults: {
    items: []
  }
})
export class RacesChildState extends NgxsFirestoreState<Race> {

  @Selector() static races(state: NgxsFirestoreStateModel<Race>) { return state.items; }

  constructor(
    racesFS: RacesFirestore
  ) {
    super(racesFS);
    attachAction(RacesChildState, { type: '[RacesChild] GetAll' }, this.getAll.bind(this));
    attachAction(RacesChildState, { type: '[RacesChild] GetAllOnce' }, this.getAllOnce.bind(this));
  }

}

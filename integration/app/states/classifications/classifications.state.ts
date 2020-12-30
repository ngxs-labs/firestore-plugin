import { State, Action, StateContext, NgxsOnInit, Selector } from '@ngxs/store';
import { ClassificationsActions } from './classifications.actions';
import { NgxsFirestoreConnect, Emitted, StreamEmitted } from '@ngxs-labs/firestore-plugin';
import { Classification } from 'integration/app/models/classification';
import { ClassificationsFirestore } from 'integration/app/services/classifications.firestore';
import { iif, insertItem, patch, updateItem } from '@ngxs/store/operators';

export interface ClassificationsStateModel {
  classifications: Classification[];
}

@State<ClassificationsStateModel>({
  name: 'classifications',
  defaults: {
    classifications: []
  }
})
export class ClassificationsState implements NgxsOnInit {
  @Selector() static classifications(state: ClassificationsStateModel) {
    return state.classifications;
  }

  constructor(
    private classificationsFS: ClassificationsFirestore,
    private ngxsFirestoreConnect: NgxsFirestoreConnect
  ) {}

  ngxsOnInit(ctx: StateContext<ClassificationsStateModel>) {
    this.ngxsFirestoreConnect.connect(ClassificationsActions.GetAll, {
      to: ({ raceId }) => {
        this.classificationsFS.setRaceId(raceId);
        return this.classificationsFS.collection$();
      }
    });

    this.ngxsFirestoreConnect.connect(ClassificationsActions.Get, {
      to: ({ payload }) => this.classificationsFS.doc$(payload)
    });
  }

  @Action(StreamEmitted(ClassificationsActions.Get))
  getEmitted(
    ctx: StateContext<ClassificationsStateModel>,
    { payload }: Emitted<ClassificationsActions.Get, Classification>
  ) {
    if (payload) {
      ctx.setState(
        patch<ClassificationsStateModel>({
          classifications: iif(
            (classifications) => !!classifications.find((classification) => classification.id === payload.id),
            updateItem((classification) => classification.id === payload.id, patch(payload)),
            insertItem(payload)
          )
        })
      );
    }
  }

  @Action(StreamEmitted(ClassificationsActions.GetAll))
  getAllEmitted(
    ctx: StateContext<ClassificationsStateModel>,
    { payload }: Emitted<ClassificationsActions.GetAll, Classification[]>
  ) {
    ctx.setState(patch({ classifications: payload }));
  }
}

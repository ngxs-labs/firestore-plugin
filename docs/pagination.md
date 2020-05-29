# Pagination in NGXS Firestore

> With query cursors in Cloud Firestore, you can split data returned by a query into batches according to the parameters you define in your query.

## Using `NgxsFirestorePagination`
The service connect method takes as arguments the Action that will trigger subscribing to the Firestore query, it added new items to state array. 
In addition an opts object with to field, to pass the function that returns the Firestore query.

```ts
import { NgxsFirestorePagination} from '@ngxs-labs/firestore-plugin';

@Injectable({
  providedIn: 'root'
})
export class RacesFirestore extends NgxsFirestorePagination<Race> {
  path = 'races';
  orderBy = 'created_at';
  orderByDirection = 'desc';
  format: (data) => data; //Each document format
}
```

```ts
//...
import { NgxsFirestoreConnect } from '@ngxs-labs/firestore-plugin';
import { NgxsFirestorePagination} from '@ngxs-labs/firestore-plugin';
import { append, patch } from '@ngxs/store/operators';

export class GetPage {
    public static readonly type = '[Races] Get Page';
}

export class ShowNewPage {
   public static readonlty type = '[Races] Show New Page'
}

export class RacesState implements NgxsOnInit {
  //...
  constructor(
    private racesFS: RacesFirestore,
    private ngxsFirestoreConnect: NgxsFirestoreConnect    
  ){
  }

  ngxsOnInit(){
    this.ngxsFirestoreConnect.connect(RacesActions.GetAll, {
      to: () => this.racesFS.collection$()
    });
  }

  @Action(StreamConnected(RacesActions.GetPage))
  getConnected(ctx: StateContext<RacesStateModel>, { action }: Connected<RacesActions.Get>) {
      // do something when connected
  }

  @Action(StreamEmitted(RacesActions.GetPage))
  getEmitted(ctx: StateContext<RacesStateModel>, { action, payload }: Emitted<RacesActions.Get, Race>) {      
      ctx.setState(
            patch({
              races: append([...payload]),
            })
          );
  }

  @Action(StreamDisconnected(RacesActions.GetPage))
  getDisconnected(ctx: StateContext<RacesStateModel>, { action }: Disconnected<RacesActions.Get>) {
      // do something when disconnected
  }
  
  @Action(Fetch(RacesActions.ShowNewPage))
  showNewPage((ctx: StateContext<RacesStateModel>, { action, payload }: Fetch<any>)) {
      complete = () => console.log('Complete'); //payload.complete
      error = (err) => console.log(error);  //payload.error
      this.raceFs.fetch(complete, error);
  }
  
}
```

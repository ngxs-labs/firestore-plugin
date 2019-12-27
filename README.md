<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

# NGXS Firestore

## Demo

## Description

NGXS Firestore plugin helps you integrate Firestore and NGXS. It uses `@angular/fire` under the hood and provides a wrapper service with some handful methods for the basic CRUD operations and easy integration with NGXS actions. In addition it provides useful data for debugging purposes, such as Active Connections, Reads, Updates, Creates and Deletes.

![debug](https://raw.githubusercontent.com/ngxs-labs/firebase-plugin/master/docs/assets/readme_debug_data.png)

## Quick start

Install the plugin:

* npm

```console
npm install --save @ngxs-labs/firestore-plugin
```

* yarn

```console
yarn add @ngxs-labs/firestore-plugin
```

In your `app.module.ts` include the plugin, note that we also include `AngularFireModule` and `NgxsModule`, as they are peer dependencies for the plugin.
```
//...
import { AngularFireModule } from '@angular/fire';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

@NgModule({
    declarations: [AppComponent, ListComponent],
    imports: [
        //...
        AngularFireModule.initializeApp(environment.firebase),
        NgxsModule.forRoot(//...),      
        NgxsReduxDevtoolsPluginModule.forRoot()
        NgxsFirestoreModule.forRoot()
    ],
    //...
})
export class AppModule { }
```

Next create a service (i.e `races.firestore.ts`) to execute Firestore operations. This service extends the plugin `FirestoreService`, which is generic service, and takes the type `<T>` of the Firestore document. We also need to provide the `path` of the collection.

```
//...
import { FirestoreService } from '@ngxs-labs/firestore-plugin';

@Injectable({
  providedIn: 'root'
})
export class RacesFirestore extends FirestoreService<Race> {
  protected path = 'races';
}

```

Finally we create the `@State`. The state will contain actions to execute the Firestore CRUD operations via the service created previously. When getting data from Firestore, we have two options:

* Get data once
* Connect to a document or collection and receive changes as they occur on the Firestore server.

For the first scenario the plugin `FirestoreService` provides the methods `docOnce$()` and `collectionOnce$()`, which will get the first emission and unsubscribe immediately after. NGXS handles subscribing to the `Observable` and the action is done once the first data is emmited.

```
//...
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';

@State<RacesStateModel>({
  name: 'races',
  defaults: {
    races: []
  }
})
export class RacesState {

  @Action(RacesActions.GetOnce)
  getOnce({ getState, patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.docOnce$(payload).pipe(
      tap(race => {        
        patchState({ race: race });      
      })
    );
  }

}
```

![debug](https://raw.githubusercontent.com/ngxs-labs/firebase-plugin/master/docs/assets/readme_get_all_once.png)

In the second scenario, the plugin provides the `@NgxsFirestoreConnect` decorator, which will connect to Firestore and emit every new change as a separate `Emit` action.

```
//...
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';

export class RacesState {

  //...

  @NgxsFirestore(
    RacesActions.Get,
    (payload): Partial<RacesStateModel> => ({ race: payload })
  )
  @Action(RacesActions.Get)
  getRaces({ patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.docOnce$(payload);
  }

}
```

Once you connect to the Firestore stream you'll keep receiving every server update on a new `Emit` action, making it easier to debug.
The decorator takes the Action that will trigger the connection and a function that receives the Action result and return the patched state value.

![debug](https://raw.githubusercontent.com/ngxs-labs/firebase-plugin/master/docs/assets/readme_actions_emit.gif)
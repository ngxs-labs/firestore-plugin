<p align="center">
  <img src="https://raw.githubusercontent.com/ngxs-labs/emitter/master/docs/assets/logo.png">
</p>

---

# NGXS Firestore

## Demo

[Demo](https://ngxs-firebase-plugin.netlify.com/)

## Description

NGXS Firestore plugin helps you integrate Firestore and NGXS. It uses `@angular/fire` under the hood and provides a wrapper service with handful CRUD operations methods and easy integration with NGXS actions. In addition provides tracking of active connections.

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

```ts
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

Next create a service (i.e `races.firestore.ts`) to execute Firestore operations. This service extends `NgxsFirestore`, a generic service that takes type `<T>` of the Firestore document. We also need to provide the `path` of the collection.

```ts
//...
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';

@Injectable({
  providedIn: 'root'
})
export class RacesFirestore extends NgxsFirestore<Race> {
  protected path = 'races';
}

```

Finally we create the `@State`. The state will contain actions to execute the Firestore CRUD operations via the service created previously. When getting data from Firestore, we have two options:

* Get data once
* Connect to a document or collection stream and receive changes as they occur on the Firestore server.

### Connect and get data once

For the first scenario, `NgxsFirestore` provides the methods `docOnce$()` and `collectionOnce$()`, which will get the first emission and unsubscribe immediately after. NGXS handles subscribing to the `Observable` and the action is done once the first data is emmited.

```ts
export class GetAllOnce {
    public static readonly type = '[Races] GetAllOnce';
}

@State<RacesStateModel>({
  name: 'races',
  defaults: {
    races: []
  }
})
export class RacesState {

  @Action(GetAllOnce)
  getAllOnce({ getState, patchState }: StateContext<RacesStateModel>) {
    return this.racesFS.collectionOnce$().pipe(
      tap(races => {        
        patchState({ races: races });      
      })
    );
  }

}
```

![debug](https://raw.githubusercontent.com/ngxs-labs/firebase-plugin/master/docs/assets/readme_get_all_once.png)

### Connect to stream and receive data changes until disconnected

For the second scenario, the plugin provides the `NgxsFirestoreConnect` service, which let's you connect an `@Action` with a Firestore query and emit every new change as a separate `Emitted` action.

The service `connect` method takes as arguments the `Action` that will trigger subscribing to the Firestore query. In addition an `opts` object with `to` field, to pass the function that returns the Firestore query.

Once connection is setup, you can then create handlers for the specific events of the stream.

You can add handlers for:
* Connected event with `@Action(StreamConnectedOf(RacesActions.GetAll))`. 
  
  This event will be fired once on first emission.

* Emmited event with `@Action(StreamEmittedOf(RacesActions.GetAll))`

  This event will be fired each observable emission. This action will return `Emitted<Action, T>` where `Action` is the action bound, and `T` is the type of the returned results from the Firestore query. 

* Disconnected event with `@Action(StreamDisconnectedOf(RacesActions.GetAll))`

  This event will be fired on observable disconnect.

```ts
//...
import { NgxsFirestoreConnect } from '@ngxs-labs/firestore-plugin';

export class GetAll {
    public static readonly type = '[Races] GetAll';
}

export class RacesState implements NgxsOnInit {
  //...
  constructor(
    private ngxsFirestoreConnect: NgxsFirestoreConnect
  ){

  }

  ngxsOnInit(){
    this.ngxsFirestoreConnect.connect(RacesActions.GetAll, {
      to: () => this.racesFS.collection$()
    });
  }

  @Action(StreamConnectedOf(RacesActions.GetAll))
  getConnected(ctx: StateContext<RacesStateModel>, { action }: Connected<RacesActions.Get>) {
      // do something when connected
  }

  @Action(StreamEmittedOf(RacesActions.GetAll))
  getEmitted(ctx: StateContext<RacesStateModel>, { action, payload }: Emitted<RacesActions.Get, Race>) {      
      ctx.setState(patch({ races: payload }));
  }

  @Action(StreamDisconnectedOf(RacesActions.GetAll))
  getDisconnected(ctx: StateContext<RacesStateModel>, { action }: Disconnected<RacesActions.Get>) {
      // do something when disconnected
  }

}
```

Once you connect to the Firestore stream you'll keep receiving every server update on a new `Emitted` action, making it easier to debug.

![debug](https://raw.githubusercontent.com/ngxs-labs/firebase-plugin/master/docs/assets/readme_actions_emit.gif)

#### Getting data from Firestore and Disconnecting

After all your Firestore queries are bind to its respective Actions, you can start getting data by dispatching the `Action` like this:

```ts
//...
this.store.dispatch(new RacesActions.GetAll())
```

If you need to disconnect you can dispatch

```ts

//...
this.store.dispatch(StreamDisconnectOf(RacesActions.GetAll));
```

<!-- * Using `ngxsFirestoreConnect` pipe

```html
<h5>Total: {{ total$ | async | ngxsFirestoreConnect: '[Races] GetAll' }}</h5>
```

We need to pass the action `type` you want to connect to, and the pipe will connect when the component initiates and will automatically disconnect when the component is destroyed.


* Manually dispatching actions

Alternatively, you can manually decide when to connect / disconnect to a stream, this becomes specially helpful if you need to listen for changes other than a component lifecylce.

```ts
//...
this.store.dispatch(new GetAll());
//...
```

```ts
//...
this.store.dispatch(new Disconnect(GetAll));
//...
``` -->
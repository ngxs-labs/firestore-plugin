## Firebase Modular

With Firebase modular version, there are some changes you'll need to make in your `AppModule` import as well as you
`@State`

### Provide Firestore and importing Module

```ts
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';

@NgModule({
  //...
  imports: [
    //...
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    NgxsModule.forRoot(...),
    NgxsFirestoreModule.forRoot(),
  ],
  //...
})
export class AppModule {}
```

### State

```ts
import { query, where } from '@angular/fire/firestore';
//...

export class RacesState implements NgxsOnInit {
  //...
  constructor(private racesFS: RacesFirestore, private ngxsFirestoreConnect: NgxsFirestoreConnect) {}

  ngxsOnInit() {
    // when querying syntax is different
    this.ngxsFirestoreConnect.connect(RacesActions.GetAll, {
      to: () => this.racesFS.collection$((ref) => query(ref, where('name', '==', 'tour de france')))
    });
  }
}
```

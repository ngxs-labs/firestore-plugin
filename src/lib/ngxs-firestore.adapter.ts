import { AngularFirestore } from '@angular/fire/firestore';
import { Inject, Injectable, Optional } from '@angular/core';
import { NgxsFirestoreModuleOptions, NGXS_FIRESTORE_MODULE_OPTIONS } from './utils';
import { Store } from '@ngxs/store';
import 'firebase/firestore';

@Injectable()
export class NgxsFirestoreAdapter {
  constructor(
    @Inject(AngularFirestore) public firestore: AngularFirestore,
    @Inject(Store) public store: Store,
    @Optional() @Inject(NGXS_FIRESTORE_MODULE_OPTIONS) public options: NgxsFirestoreModuleOptions
  ) {}
}

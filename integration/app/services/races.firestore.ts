import { Injectable } from '@angular/core';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class RacesFirestore extends NgxsFirestore<Race> {
  protected path = 'races';
  idField = 'raceId';

  converter: firebase.firestore.FirestoreDataConverter<Race> = {
    toFirestore: (value) => {
      debugger;
      const db = { ...value };
      delete db.testProp;
      return db;
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);

      return <Race>{ ...data, testProp: data.id + data.title };
    }
  };

  updateIfExists(id, data) {
    debugger;
    return this.adapter.firestore
      .doc(this.adapter.firestore.doc(`${this.path}/${id}`).ref.withConverter(this.converter))
      .update(data);
  }
}

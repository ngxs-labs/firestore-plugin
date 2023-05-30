import { Injectable } from '@angular/core';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin/compat';
import { Race } from '../models/race';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class RacesFirestore extends NgxsFirestore<Race> {
  protected path = 'races';
  idField = 'raceId';
  metadataField = '_metadata';

  converter: firebase.firestore.FirestoreDataConverter<Race> = {
    toFirestore: (value) => {
      const db = { ...value };
      delete db.testProp;
      return db;
    },
    fromFirestore: (snapshot, options) => {
      const data = snapshot.data(options);

      return <Race>{ ...data, testProp: data['id'] + data['title'] };
    }
  };

  updateIfExists(id: string, data: Race) {
    return this.adapter.firestore
      .doc(this.adapter.firestore.doc(`${this.path}/${id}`).ref.withConverter(this.converter))
      .update(data);
  }
}

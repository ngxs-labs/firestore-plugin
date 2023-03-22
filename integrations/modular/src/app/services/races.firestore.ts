import { Injectable } from '@angular/core';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';
import { doc, FirestoreDataConverter, updateDoc } from '@angular/fire/firestore';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class RacesFirestore extends NgxsFirestore<Race> {
  protected path = 'races';
  idField = 'raceId';
  metadataField = '_metadata';

  converter: FirestoreDataConverter<Race> = {
    toFirestore: (value) => {
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
    const docRef = doc(this.adapter.firestore, `${this.path}/${id}`).withConverter(this.converter);
    return updateDoc(docRef, data);
  }
}

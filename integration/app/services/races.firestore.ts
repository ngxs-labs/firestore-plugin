import { Injectable } from '@angular/core';
import { doc, FirestoreDataConverter, updateDoc } from '@angular/fire/firestore';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';
import { from } from 'rxjs';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class RacesFirestore extends NgxsFirestore<Race> {
  protected path = 'races';
  idField = 'raceId';

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
    return from(updateDoc(docRef, data));
  }
}

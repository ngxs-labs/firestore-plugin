import { Injectable } from '@angular/core';
import { NgxsFirestoreCompat } from '@ngxs-labs/firestore-plugin/compat';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class ClassificationsFirestore extends NgxsFirestoreCompat<Race> {
  idField = 'classificationId';
  private _raceId = '';
  protected get path() {
    return `races/${this.raceId}/classifications`;
  }

  public setRaceId(raceId) {
    this._raceId = raceId;
  }

  protected get raceId() {
    return this._raceId;
  }
}

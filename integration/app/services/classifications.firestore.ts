import { Injectable } from '@angular/core';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';
import 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Race } from '../models/race';

@Injectable({
  providedIn: 'root'
})
export class ClassificationsFirestore extends NgxsFirestore<Race> {
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

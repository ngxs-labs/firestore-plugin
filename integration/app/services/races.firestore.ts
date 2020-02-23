import { Injectable } from '@angular/core';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';
import { Race } from '../models/race';

@Injectable({
    providedIn: 'root'
})
export class RacesFirestore extends NgxsFirestore<Race> {
    protected path = 'races';
}

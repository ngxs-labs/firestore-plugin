import { Injectable } from '@angular/core';
import { FirestoreService } from '@ngxs-labs/firestore-plugin';
import { Race } from '../models/race';

@Injectable({
    providedIn: 'root'
})
export class RacesFirestore extends FirestoreService<Race> {
    protected path = 'races';
}

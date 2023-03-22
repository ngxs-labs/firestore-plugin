import { Injectable } from '@angular/core';
import { NgxsFirestoreCompat } from '@ngxs-labs/firestore-plugin/compat';
import { Attendee } from '../models/attendee';

@Injectable({
  providedIn: 'root'
})
export class AttendeesFirestore extends NgxsFirestoreCompat<Attendee> {
  protected path = 'attendees';
}

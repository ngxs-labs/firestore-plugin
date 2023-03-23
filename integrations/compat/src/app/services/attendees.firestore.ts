import { Injectable } from '@angular/core';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin/compat';
import { Attendee } from '../models/attendee';

@Injectable({
  providedIn: 'root'
})
export class AttendeesFirestore extends NgxsFirestore<Attendee> {
  protected path = 'attendees';
}

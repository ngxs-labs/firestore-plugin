import { Injectable } from '@angular/core';
import { NgxsFirestore } from '@ngxs-labs/firestore-plugin';

@Injectable({ providedIn: 'root' })
export class TestFirestore extends NgxsFirestore<any> {
  path = 'test';
}

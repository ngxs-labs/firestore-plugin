import { Injectable } from '@angular/core';
import { NgxsFirestorePagination } from '@ngxs-labs/firestore-plugin';
import { Race } from 'integration/app/models/race';

@Injectable({
    providedIn: 'root'
})
export class RacesFirestorePagination extends NgxsFirestorePagination<Race> {
    orderBy: 'id' | 'title' | 'description' | 'name' = 'title';
    limit = 5;
    path = 'races';
    orderByDirection = 'desc';
    format = (data) => data;
}

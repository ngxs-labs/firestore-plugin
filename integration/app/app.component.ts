import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public ngxsFirestoreState$: Observable<unknown> = this.store.select((state) => state.ngxs_firestore);

    constructor(private store: Store) {}
}

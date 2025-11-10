import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { ngxsFirestoreConnections } from '@ngxs-labs/firestore-plugin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: false
})
export class AppComponent {
  public ngxsFirestoreState$ = this.store.select(ngxsFirestoreConnections);

  constructor(private store: Store) {}
}

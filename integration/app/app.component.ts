import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { ngxsFirectoreConnections } from '@ngxs-labs/firestore-plugin';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public ngxsFirestoreState$ = this.store.select(ngxsFirectoreConnections);

  constructor(private store: Store) {}
}

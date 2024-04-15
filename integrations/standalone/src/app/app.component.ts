import { Component } from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { all } from './states/test.selectors';
import { Store } from '@ngxs/store';
import { GetAll } from './states/test.actions';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AsyncPipe, JsonPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  name = 'Angular';
  all$ = this.store.select(all);

  constructor(private store: Store) {}

  ngOnInit() {
    this.store.dispatch(new GetAll());
  }
}

import { FirestorePage } from './ngxs-firestore-page.state';

export class SavePage {
  static readonly type = 'SavePage';
  constructor(public payload: FirestorePage) {}
}

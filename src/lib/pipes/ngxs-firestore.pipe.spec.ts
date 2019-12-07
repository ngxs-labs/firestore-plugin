import { NgxsFirestorePipe } from './ngxs-firestore.pipe';

describe('NgxsFirestorePipe', () => {
  it('create an instance', () => {
    const pipe = new NgxsFirestorePipe();
    expect(pipe).toBeTruthy();
  });
});

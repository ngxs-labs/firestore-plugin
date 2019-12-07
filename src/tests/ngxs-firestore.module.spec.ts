import { NgxsFirestoreModule } from '..';

describe('NGXS Firestore', () => {
  it('should successfully create module', () => {
    const ofExecModule = new NgxsFirestoreModule();

    expect(ofExecModule).toBeTruthy();
  });
});

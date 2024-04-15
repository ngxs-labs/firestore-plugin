import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { NGXS_FIRESTORE_MODULE_OPTIONS, NgxsFirestoreModuleOptions } from './tokens';

export function provideNgxsFirestore(options?: Partial<NgxsFirestoreModuleOptions>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: NGXS_FIRESTORE_MODULE_OPTIONS,
      useValue: { timeoutWriteOperations: false, developmentMode: false, ...options }
    }
  ]);
}

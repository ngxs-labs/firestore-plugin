import { InjectionToken } from '@angular/core';

export interface NgxsFirestoreModuleOptions {
  timeoutWriteOperations: number | false;
  developmentMode: boolean;
}

export const NGXS_FIRESTORE_MODULE_OPTIONS = new InjectionToken<NgxsFirestoreModuleOptions>(
  'NGXS_FIRESTORE_MODULE_OPTIONS'
);

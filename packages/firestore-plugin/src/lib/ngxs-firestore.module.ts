import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { NgxsFirestoreModuleOptions, NGXS_FIRESTORE_MODULE_OPTIONS } from './tokens';

@NgModule({
  imports: [CommonModule, NgxsModule.forFeature([NgxsFirestoreState])]
})
export class NgxsFirestoreModule {
  public static forRoot(options?: Partial<NgxsFirestoreModuleOptions>): ModuleWithProviders<NgxsFirestoreModule> {
    return {
      ngModule: NgxsFirestoreModule,
      providers: [
        {
          provide: NGXS_FIRESTORE_MODULE_OPTIONS,
          useValue: { timeoutWriteOperations: false, developmentMode: false, ...options }
        }
      ]
    };
  }
}

import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreState } from '../src/lib/ngxs-firestore.state';
import { NgxsFirestoreModuleOptions, NGXS_FIRESTORE_MODULE_OPTIONS } from '../src/lib/tokens';
import { NgxsFirestorePageIdCompatService } from './ngxs-firestore-page-compat.service';

@NgModule({
  imports: [CommonModule, NgxsModule.forFeature([NgxsFirestoreState])]
})
export class NgxsFirestoreCompatModule {
  public static forRoot(options?: NgxsFirestoreModuleOptions): ModuleWithProviders<NgxsFirestoreCompatModule> {
    return {
      ngModule: NgxsFirestoreCompatModule,
      providers: [
        {
          provide: NGXS_FIRESTORE_MODULE_OPTIONS,
          useValue: { timeoutWriteOperations: false, developmentMode: false, ...options }
        },
        {
          provide: NgxsFirestorePageIdCompatService,
          useClass: NgxsFirestorePageIdCompatService
        }
      ]
    };
  }
}

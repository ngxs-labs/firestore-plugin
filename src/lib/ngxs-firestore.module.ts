import { NgModule, ModuleWithProviders } from '@angular/core';
import { NgxsModule } from '@ngxs/store';

@NgModule({
  imports: [
    NgxsModule.forFeature([
      
    ])
  ]
})
export class NgxsFirestoreModule {

  public static forRoot(): ModuleWithProviders<NgxsFirestoreModule> {
    return {
      ngModule: NgxsFirestoreModule
    };
  }
}

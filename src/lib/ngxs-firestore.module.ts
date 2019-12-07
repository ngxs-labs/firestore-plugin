import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsFirestorePipe } from './pipes/ngxs-firestore.pipe';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreState } from './states/ngxs-firestore.state';

const PIPES = [
  NgxsFirestorePipe
];

@NgModule({
  imports: [
    CommonModule,
    NgxsModule.forFeature([
      NgxsFirestoreState
    ])
  ],
  declarations: [
    ...PIPES
  ],
  exports: [
    ...PIPES
  ]
})
export class NgxsFirestoreModule {
  public static forRoot(): ModuleWithProviders {
    return {
      ngModule: NgxsFirestoreModule,
      providers: []
    };
  }
}
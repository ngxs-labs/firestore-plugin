import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { AngularFirestoreModule } from '@angular/fire/firestore';

const PIPES = [];

@NgModule({
  imports: [CommonModule, NgxsModule.forFeature([NgxsFirestoreState]), AngularFirestoreModule],
  declarations: [...PIPES],
  exports: [...PIPES]
})
export class NgxsFirestoreModule {
  public static forRoot(): ModuleWithProviders<NgxsFirestoreModule> {
    return {
      ngModule: NgxsFirestoreModule
    };
  }
}

import { NgModule, ModuleWithProviders, Self } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsFirestorePipe } from './ngxs-firestore.pipe';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreState } from './ngxs-firestore.state';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { NgxsInjector } from './ngxs-injector.service';

const PIPES = [NgxsFirestorePipe];

@NgModule({
    imports: [CommonModule, NgxsModule.forFeature([NgxsFirestoreState]), AngularFirestoreModule],
    declarations: [...PIPES],
    exports: [...PIPES]
})
export class NgxsFirestoreModule {
    constructor(@Self() public injector: NgxsInjector) {}

    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxsFirestoreModule,
            providers: [NgxsInjector]
        };
    }
}

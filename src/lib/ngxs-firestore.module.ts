import { NgModule, ModuleWithProviders, Self } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxsFirestorePipe } from './pipes/ngxs-firestore.pipe';
import { NgxsModule } from '@ngxs/store';
import { NgxsFirestoreState } from './states/ngxs-firestore.state';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { NgxsInjector } from './services/ngxs-injector.service';
import { NgxsActiveConnectionsService } from './services/ngxs-active-connections.service';

const PIPES = [NgxsFirestorePipe];

@NgModule({
    imports: [CommonModule, NgxsModule.forFeature([NgxsFirestoreState]), AngularFirestoreModule],
    declarations: [...PIPES],
    exports: [...PIPES]
})
export class NgxsFirestoreModule {
    constructor(@Self() public injector: NgxsInjector, @Self() public ac: NgxsActiveConnectionsService) {}

    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxsFirestoreModule,
            providers: [NgxsInjector, NgxsActiveConnectionsService]
        };
    }
}

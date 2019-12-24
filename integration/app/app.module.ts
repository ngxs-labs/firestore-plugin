import { environment } from '../environments/environment';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ListComponent } from './components/list/list.component';

import { AngularFireModule } from '@angular/fire';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { RacesState } from './states/races/races.state';
import { OtherComponent } from './components/other/other.component';

@NgModule({
    declarations: [AppComponent, ListComponent, OtherComponent],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot([
            { path: 'list', component: ListComponent },
            { path: 'other', component: OtherComponent },
            { path: '', redirectTo: '/list', pathMatch: 'full' }
        ]),
        AngularFireModule.initializeApp(environment.firebase),
        NgxsModule.forRoot([RacesState], {
            developmentMode: !environment.production
        }),
        NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
        NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
        NgxsFirestoreModule.forRoot()
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {}

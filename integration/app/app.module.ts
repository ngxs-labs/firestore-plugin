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
import { RacesChildState } from './states/races-child/races-child.state';

@NgModule({
    declarations: [AppComponent, ListComponent],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase),
        NgxsModule.forRoot([
            RacesState,
            RacesChildState
        ], {
            developmentMode: !environment.production
        }),
        NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
        NgxsReduxDevtoolsPluginModule.forRoot({ disabled: environment.production }),
        NgxsFirestoreModule.forRoot(),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

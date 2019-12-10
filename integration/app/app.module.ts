import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './components/list/list.component';
import { RacesState } from './states/races/races.state';
import { AngularFireModule } from '@angular/fire';

@NgModule({
    declarations: [AppComponent, ListComponent],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot([]),
        AngularFireModule.initializeApp(environment.firebase),
        NgxsModule.forRoot([
            RacesState
        ], {
            developmentMode: !environment.production
        }),
        NgxsLoggerPluginModule.forRoot(),
        NgxsFirestoreModule.forRoot(),
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

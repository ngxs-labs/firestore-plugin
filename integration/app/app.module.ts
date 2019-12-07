import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        FormsModule,
        RouterModule.forRoot([]),
        NgxsModule.forRoot([], {
            developmentMode: !environment.production
        }),
        NgxsLoggerPluginModule.forRoot(),
        NgxsFirestoreModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }

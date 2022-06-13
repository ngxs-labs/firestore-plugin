import { environment } from '../environments/environment';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ListComponent } from './components/list/list.component';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { NgxsModule } from '@ngxs/store';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsFirestoreModule } from '@ngxs-labs/firestore-plugin';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { RacesState } from './states/races/races.state';
import { OtherComponent } from './components/other/other.component';
import { NgxsActionsExecutingModule } from '@ngxs-labs/actions-executing';
import { ClassificationsState } from './states/classifications/classifications.state';
import { PagedListComponent } from './components/paged-list/paged-list.component';
import { AttendeesState } from './states/attendees/attendees.state';
import { ListOnceComponent } from './components/list-once/list-once.component';

@NgModule({
  declarations: [AppComponent, ListComponent, OtherComponent, PagedListComponent, ListOnceComponent],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(
      [
        { path: 'list', component: ListComponent },
        { path: 'list-once', component: ListOnceComponent },
        { path: 'paged-list', component: PagedListComponent },
        { path: 'other', component: OtherComponent },
        { path: '', redirectTo: '/list', pathMatch: 'full' }
      ],
      { relativeLinkResolution: 'legacy' }
    ),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideFirestore(() => getFirestore()),
    NgxsModule.forRoot([RacesState, ClassificationsState, AttendeesState], {
      developmentMode: !environment.production
    }),
    NgxsLoggerPluginModule.forRoot({
      disabled: environment.production
    }),
    NgxsFirestoreModule.forRoot({
      timeoutWriteOperations: 1000
    }),
    NgxsActionsExecutingModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot({
      name: 'Ngxs Firestore',
      disabled: environment.production,
      actionSanitizer: (action) => ({ ...action, action: null })
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

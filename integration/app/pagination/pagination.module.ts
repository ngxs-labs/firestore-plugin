import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PaginationComponent } from './pagination.component';
import { NgxsModule } from '@ngxs/store';
import { PaginationRacesState } from './races.pagination/races.state';

const routes: Routes = [{ path: '', component: PaginationComponent }];

@NgModule({
    declarations: [PaginationComponent],
    imports: [CommonModule, NgxsModule.forFeature([PaginationRacesState]), RouterModule.forChild(routes)]
})
export class PaginationModule {}

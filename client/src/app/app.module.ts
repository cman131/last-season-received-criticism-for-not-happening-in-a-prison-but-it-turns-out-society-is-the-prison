import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { AppCreateComponent } from 'src/app/create/app-create.component';
import { AppJoinComponent } from './join/app-join.component';
import { AppHomeComponent } from './home/app-home.component';
import { AppExportComponent } from './export/app-export.component';
import { AppDraftComponent } from './draft/app-draft.component';
import { ManagementService } from './shared/management.service';
import { GameService } from './shared/game.service';
import { ScryfallService } from './shared/scryfall.service';
import { ConfigService } from './shared/config.service';
import { ExportService } from './shared/export.service';
import { AppDeckBuilderComponent } from './deck-builder/app-deck-builder.component';
import { FilterContainerComponent, FilterCheckboxComponent } from './shared/filters';
import { CardDisplayComponent } from './deck-builder/card-display/card-display.component';
import { SortPipe } from './shared/sort-pipe';
import { CardFilterPipe } from './shared/card-filter-pipe';

const appRoutes: Routes = [
  { path: '', component: AppHomeComponent },
  { path: 'create', component: AppCreateComponent },
  { path: 'join', component: AppJoinComponent},
  { path: 'draft/:code/:player', component: AppDraftComponent },
  { path: 'draft/:code/:player/export', component: AppExportComponent },
  { path: 'draft/:code/:player/export/deckbuilder', component: AppDeckBuilderComponent },
  { path: '**', component: AppHomeComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    AppHomeComponent,
    AppCreateComponent,
    AppJoinComponent,
    AppDraftComponent,
    AppExportComponent,
    AppDeckBuilderComponent,
    FilterContainerComponent,
    FilterCheckboxComponent,
    CardDisplayComponent,
    SortPipe,
    CardFilterPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(
      appRoutes
    )
  ],
  providers: [
    ManagementService,
    GameService,
    ScryfallService,
    ConfigService,
    ExportService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

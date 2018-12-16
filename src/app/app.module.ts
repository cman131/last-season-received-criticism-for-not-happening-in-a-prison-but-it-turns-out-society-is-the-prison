import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { AppCreateComponent } from 'src/app/create/app-create.component';
import { AppJoinComponent } from './join/app-join.component';
import { AppHomeComponent } from './home/app-home.component';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AppDraftComponent } from './draft/app-draft.component';
import { ManagementService } from './shared/management.service';
import { GameService } from './shared/game.service';
import { ScryfallService } from './shared/scryfall.service';

const appRoutes: Routes = [
  { path: '', component: AppHomeComponent },
  { path: 'create', component: AppCreateComponent },
  { path: 'join', component: AppJoinComponent},
  { path: 'draft/:code/:player', component: AppDraftComponent },
  { path: '**', component: AppHomeComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    AppHomeComponent,
    AppCreateComponent,
    AppJoinComponent,
    AppDraftComponent
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
    ScryfallService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

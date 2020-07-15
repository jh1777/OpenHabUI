import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { UiModule } from './ui/ui.module';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ClarityModule } from '@clr/angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RoomboxComponent } from './components/dashboard/roombox/roombox.component';
import { TileComponent } from './components/dashboard/tile/tile.component';
import { ItemiconComponent } from './components/itemicon/itemicon.component';
import { SummaryComponent } from './components/dashboard/summary/summary.component';
import { ItemDetailsDialogComponent } from './components/item-details-dialog/item-details-dialog.component';
import { TileConfigComponent } from './components/dashboard/tile-config/tile-config.component';
import { LoggingService } from './services/log.service';
import { ItemDetailsComponent } from './components/dashboard/item-details/item-details.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    RoomboxComponent,
    TileComponent,
    ItemiconComponent,
    SummaryComponent,
    ItemDetailsDialogComponent,
    TileConfigComponent,
    ItemDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    BrowserAnimationsModule,
    UiModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [LoggingService],
  bootstrap: [AppComponent]
})
export class AppModule { }

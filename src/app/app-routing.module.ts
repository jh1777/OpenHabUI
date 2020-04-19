import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RoomsComponent } from './pages/rooms/rooms.component';
import { ConfigComponent } from './pages/config/config.component';

const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'rooms', component: RoomsComponent },
      { path: 'config', component: ConfigComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

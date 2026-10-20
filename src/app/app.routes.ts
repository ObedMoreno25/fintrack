
import { Routes } from '@angular/router';

import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { IngresosPage } from './pages/ingresos-page/ingresos-page';
import { GastosPage } from './pages/gastos-page/gastos-page';
import { CategoriasPage } from './pages/categorias-page/categorias-page';
import { HistorialPage } from './pages/historial-page/historial-page';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'ingresos', component: IngresosPage },
  { path: 'gastos', component: GastosPage },
  { path: 'categorias', component: CategoriasPage },
  { path: 'historial', component: HistorialPage },
  { path: '**', redirectTo: 'dashboard' }
];

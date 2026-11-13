
import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { IngresosPage } from './pages/ingresos-page/ingresos-page';
import { GastosPage } from './pages/gastos-page/gastos-page';
import { CategoriasPage } from './pages/categorias-page/categorias-page';
import { HistorialPage } from './pages/historial-page/historial-page';
import { RegistroPage } from './pages/registro-page/registro-page';
import { LoginPage } from './pages/login-page/login-page';
import { TarjetasPage } from './pages/tarjetas-page/tarjetas-page';

export const routes: Routes = [
  { path: '', redirectTo: 'bienvenida', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardPage },
  { path: 'ingresos', component: IngresosPage },
  { path: 'gastos', component: GastosPage },
  { path: 'categorias', component: CategoriasPage },
  { path: 'historial', component: HistorialPage },
  { path: 'bienvenida', component: LandingPage },
  { path: 'registro', component: RegistroPage },
  { path: 'login', component: LoginPage },
  {path: 'tarjetas', component: TarjetasPage},
  { path: '**', redirectTo: 'dashboard' }
];

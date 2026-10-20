import { Component, inject, signal, computed} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { IngresosService } from '../../services/ingresos';

@Component({
  imports: [CurrencyPipe, RouterLink],
  selector: 'app-dashboard-page',
  styleUrl: './dashboard-page.css',
  templateUrl: './dashboard-page.html',
})
export class DashboardPage {


   private ingresosService = inject(IngresosService);

  // Ingresos obtenidos del servicio
  ingresos = this.ingresosService.totalIngresos;

  // Gastos temporales, hasta crear su servicio
  gastos = signal(6500);

  // Balance calculado automáticamente
  balance = computed(() => this.ingresos() - this.gastos());
}

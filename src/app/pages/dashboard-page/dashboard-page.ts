
import { Component, inject, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { IngresosService } from '../../services/ingresos';
import { GastosService } from '../../services/gastos';
import { Movimiento } from '../../interfaces/movimiento.interface';

@Component({
  selector: 'app-dashboard-page',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css'
})
export class DashboardPage {

  private ingresosService = inject(IngresosService);
  private gastosService = inject(GastosService);

  ingresos = this.ingresosService.totalIngresos;
  gastos = this.gastosService.totalGastos;

  balance = computed(() =>
    this.ingresos() - this.gastos()
  );

  movimientosRecientes = computed<Movimiento[]>(() => {

    const ingresos: Movimiento[] =
      this.ingresosService.ingresos().map(ingreso => ({
        ...ingreso,
        tipo: 'ingreso'
      }));

    const gastos: Movimiento[] =
      this.gastosService.gastos().map(gasto => ({
        ...gasto,
        tipo: 'gasto'
      }));

    return [...ingresos, ...gastos]
      .sort((a, b) => b.fecha.localeCompare(a.fecha))
      .slice(0, 5);
  });
}

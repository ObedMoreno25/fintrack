
import { Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';

import { IngresosService } from '../../services/ingresos';
import { GastosService } from '../../services/gastos';
import { Movimiento } from '../../interfaces/movimiento.interface';

@Component({
  selector: 'app-historial-page',
  imports: [CurrencyPipe, DatePipe],
  templateUrl: './historial-page.html',
  styleUrl: './historial-page.css'
})
export class HistorialPage {

  private ingresosService = inject(IngresosService);
  private gastosService = inject(GastosService);

  ingresos = this.ingresosService.ingresos;
  gastos = this.gastosService.gastos;

  totalIngresos = this.ingresosService.totalIngresos;
  totalGastos = this.gastosService.totalGastos;

  balance = computed(() =>
    this.totalIngresos() - this.totalGastos()
  );

  filtro = signal<'todos' | 'ingreso' | 'gasto'>('todos');

  movimientos = computed<Movimiento[]>(() => {

    const ingresos: Movimiento[] = this.ingresos().map(ingreso => ({
      ...ingreso,
      tipo: 'ingreso'
    }));

    const gastos: Movimiento[] = this.gastos().map(gasto => ({
      ...gasto,
      tipo: 'gasto'
    }));

    return [...ingresos, ...gastos].sort(
      (a, b) => b.fecha.localeCompare(a.fecha)
    );
  });

  movimientosFiltrados = computed(() => {

    const tipo = this.filtro();

    if (tipo === 'todos') {
      return this.movimientos();
    }

    return this.movimientos().filter(
      movimiento => movimiento.tipo === tipo
    );
  });

  cambiarFiltro(tipo: 'todos' | 'ingreso' | 'gasto'): void {
    this.filtro.set(tipo);
  }
}

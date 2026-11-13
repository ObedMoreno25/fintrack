
import { Injectable, signal, computed } from '@angular/core';
import { Gasto } from '../interfaces/gasto.interface';

@Injectable({
  providedIn: 'root'
})
export class GastosService {

  private gastosSignal = signal<Gasto[]>([]);

  readonly gastos = this.gastosSignal.asReadonly();

  readonly totalGastos = computed(() =>
    this.gastosSignal().reduce(
      (total, gasto) => total + gasto.cantidad,
      0
    )
  );

  addGasto(gasto: Omit<Gasto, 'id'>): void {
    const nextId = Math.max(
      0,
      ...this.gastosSignal().map(g => g.id)
    ) + 1;

    this.gastosSignal.update(gastos => [
      ...gastos,
      { ...gasto, id: nextId }
    ]);
  }

  deleteGasto(id: number): void {
    this.gastosSignal.update(gastos =>
      gastos.filter(gasto => gasto.id !== id)
    );
  }
}

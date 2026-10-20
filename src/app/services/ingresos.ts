
import { Injectable, signal, computed } from '@angular/core';
import { Ingreso } from '../interfaces/ingreso.interface';

@Injectable({
  providedIn: 'root'
})
export class IngresosService {

  private ingresosSignal = signal<Ingreso[]>([]);

  readonly ingresos = this.ingresosSignal.asReadonly();

  readonly totalIngresos = computed(() =>
    this.ingresosSignal().reduce(
      (total, ingreso) => total + ingreso.cantidad, 0
    )
  );

  addIngreso(ingreso: Omit<Ingreso, 'id'>): void {
    const nextId = Math.max(
      0,
      ...this.ingresosSignal().map(i => i.id)
    ) + 1;

    this.ingresosSignal.update(ingresos => [
      ...ingresos,
      { ...ingreso, id: nextId }
    ]);
  }

  deleteIngreso(id: number): void {
    this.ingresosSignal.update(ingresos =>
      ingresos.filter(ingreso => ingreso.id !== id)
    );
  }
}

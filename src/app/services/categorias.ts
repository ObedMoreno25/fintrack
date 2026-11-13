import { Service } from '@angular/core';

@Service()
export class Categorias {}

import { Injectable, signal, computed } from '@angular/core';
import { Categoria } from '../interfaces/categoria.interface';

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {

  private categoriasSignal = signal<Categoria[]>([
    { id: 1, nombre: 'Salario', tipo: 'ingreso' },
    { id: 2, nombre: 'Negocio', tipo: 'ingreso' },
    { id: 3, nombre: 'Freelance', tipo: 'ingreso' },
    { id: 4, nombre: 'Otros ingresos', tipo: 'ingreso' },

    { id: 5, nombre: 'Alimentación', tipo: 'gasto' },
    { id: 6, nombre: 'Transporte', tipo: 'gasto' },
    { id: 7, nombre: 'Vivienda', tipo: 'gasto' },
    { id: 8, nombre: 'Entretenimiento', tipo: 'gasto' },
    { id: 9, nombre: 'Servicios', tipo: 'gasto' },
    { id: 10, nombre: 'Otros gastos', tipo: 'gasto' }
  ]);

  readonly categorias = this.categoriasSignal.asReadonly();

  readonly categoriasIngresos = computed(() =>
    this.categoriasSignal().filter(
      categoria => categoria.tipo === 'ingreso'
    )
  );

  readonly categoriasGastos = computed(() =>
    this.categoriasSignal().filter(
      categoria => categoria.tipo === 'gasto'
    )
  );

  addCategoria(categoria: Omit<Categoria, 'id'>): void {

    const existe = this.categoriasSignal().some(
      c =>
        c.nombre.trim().toLowerCase() ===
          categoria.nombre.trim().toLowerCase() &&
        c.tipo === categoria.tipo
    );

    if (existe || !categoria.nombre.trim()) {
      return;
    }

    const nextId = Math.max(
      0,
      ...this.categoriasSignal().map(c => c.id)
    ) + 1;

    this.categoriasSignal.update(categorias => [
      ...categorias,
      {
        ...categoria,
        id: nextId,
        nombre: categoria.nombre.trim()
      }
    ]);
  }

  deleteCategoria(id: number): void {
    this.categoriasSignal.update(categorias =>
      categorias.filter(categoria => categoria.id !== id)
    );
  }
}

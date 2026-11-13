
import { Component, inject } from '@angular/core';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import { CategoriasService } from '../../services/categorias';
import { Categoria } from '../../interfaces/categoria.interface';

@Component({
  selector: 'app-categorias-page',
  imports: [ReactiveFormsModule],
  templateUrl: './categorias-page.html',
  styleUrl: './categorias-page.css'
})
export class CategoriasPage {

  private categoriasService = inject(CategoriasService);

  categoriasIngresos = this.categoriasService.categoriasIngresos;
  categoriasGastos = this.categoriasService.categoriasGastos;

  categoriaForm = new FormGroup({
    nombre: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    tipo: new FormControl<'ingreso' | 'gasto'>(
      'ingreso',
      Validators.required
    )
  });

  onSubmit(): void {

    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    const { nombre, tipo } = this.categoriaForm.getRawValue();

    const newCategoria: Omit<Categoria, 'id'> = {
      nombre: nombre!,
      tipo: tipo!
    };

    this.categoriasService.addCategoria(newCategoria);

    this.categoriaForm.reset({
      nombre: '',
      tipo: 'ingreso'
    });
  }

  deleteCategoria(id: number): void {
    this.categoriasService.deleteCategoria(id);
  }
}

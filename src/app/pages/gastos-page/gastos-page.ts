
import { Component, inject } from '@angular/core';
import { CategoriasService } from '../../services/categorias';
import { CurrencyPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import { GastosService } from '../../services/gastos';
import { Gasto } from '../../interfaces/gasto.interface';

@Component({
  selector: 'app-gastos-page',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './gastos-page.html',
  styleUrl: './gastos-page.css'
})
export class GastosPage {

  private gastosService = inject(GastosService);
  private categoriasService = inject(CategoriasService);

  gastos = this.gastosService.gastos;
  totalGastos = this.gastosService.totalGastos;
  categoriasGastos = this.categoriasService.categoriasGastos;

  gastoForm = new FormGroup({
    concepto: new FormControl('', [
      Validators.required,
      Validators.minLength(3)
    ]),
    cantidad: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01)
    ]),
    categoria: new FormControl('', Validators.required),
    fecha: new FormControl('', Validators.required)
  });

  onSubmit(): void {
    if (this.gastoForm.invalid) {
      this.gastoForm.markAllAsTouched();
      return;
    }

    const { concepto, cantidad, categoria, fecha } =
      this.gastoForm.getRawValue();

    const newGasto: Omit<Gasto, 'id'> = {
      concepto: concepto!,
      cantidad: cantidad!,
      categoria: categoria!,
      fecha: fecha!
    };

    this.gastosService.addGasto(newGasto);
    this.gastoForm.reset();
  }

  deleteGasto(id: number): void {
    this.gastosService.deleteGasto(id);
  }
}

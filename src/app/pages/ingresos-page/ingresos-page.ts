
import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  ReactiveFormsModule,
  FormControl,
  FormGroup,
  Validators
} from '@angular/forms';

import { IngresosService } from '../../services/ingresos';
import { Ingreso } from '../../interfaces/ingreso.interface';

@Component({
  selector: 'app-ingresos-page',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './ingresos-page.html',
  styleUrl: './ingresos-page.css'
})
export class IngresosPage {

  private ingresosService = inject(IngresosService);

  ingresos = this.ingresosService.ingresos;
  totalIngresos = this.ingresosService.totalIngresos;

  ingresoForm = new FormGroup({
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
    if (this.ingresoForm.invalid) {
      this.ingresoForm.markAllAsTouched();
      return;
    }

    const { concepto, cantidad, categoria, fecha } =
      this.ingresoForm.getRawValue();

    const newIngreso: Omit<Ingreso, 'id'> = {
      concepto: concepto!,
      cantidad: cantidad!,
      categoria: categoria!,
      fecha: fecha!
    };

    this.ingresosService.addIngreso(newIngreso);
    this.ingresoForm.reset();
  }

  deleteIngreso(id: number): void {
    this.ingresosService.deleteIngreso(id);
  }
}

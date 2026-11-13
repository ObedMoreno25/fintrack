
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

@Component({
  selector: 'app-registro-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './registro-page.html',
  styleUrl: './registro-page.css'
})
export class RegistroPage {

  mostrarPassword = false;
  enviado = false;

  registroForm = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3)
      ]
    }),

    correo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email
      ]
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(8)
      ]
    }),

    confirmarPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required]
    })
  });

  registrar() {
    this.enviado = true;

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const { password, confirmarPassword } =
      this.registroForm.getRawValue();

    if (password !== confirmarPassword) {
      return;
    }

    // Por ahora solo validamos el formulario.
    // Después conectaremos el registro con nuestra API.
    console.log('Formulario de registro válido');
  }
}

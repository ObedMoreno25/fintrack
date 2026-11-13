
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

interface Tarjeta {
  id: number;
  nombre: string;
  banco: string;
  tipo: 'credito' | 'debito';
  ultimosDigitos: string;
  color: string;
  saldo: number;
  limite?: number;
  diaCorte?: number;
  diaPago?: number;
}

interface AbonoMSI {
  id: number;
  monto: number;
  fecha: string;
}

interface CompraMSI {
  id: number;
  tarjetaId: number;
  concepto: string;
  montoTotal: number;
  meses: number;
  fechaCompra: string;
  abonos: AbonoMSI[];
}

@Component({
  selector: 'app-tarjetas-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './tarjetas-page.html',
  styleUrl: './tarjetas-page.css'
})
export class TarjetasPage {
  private fb = inject(FormBuilder);
  private siguienteId = 100;
  compraEditando = signal<number | null>(null);

  tarjetas = signal<Tarjeta[]>([
    {
      id: 1,
      nombre: 'Tarjeta principal',
      banco: 'Banco de ejemplo',
      tipo: 'credito',
      ultimosDigitos: '4582',
      color: '#6540bd',
      saldo: 5600,
      limite: 18100,
      diaCorte: 6,
      diaPago: 25
    },
    {
      id: 2,
      nombre: 'Cuenta de débito',
      banco: 'Cuenta de ejemplo',
      tipo: 'debito',
      ultimosDigitos: '9021',
      color: '#24515b',
      saldo: 4850
    }
  ]);

  tarjetaSeleccionada = signal<number | null>(1);

  tarjetaActiva = computed(() =>
    this.tarjetas().find(
      tarjeta => tarjeta.id === this.tarjetaSeleccionada()
    ) ?? null
  );

  mostrarFormulario = signal(false);
  tarjetaEditando = signal<number | null>(null);
  errorFormulario = signal('');

  comprasMSI = signal<CompraMSI[]>([]);
  mostrarFormularioMSI = signal(false);
  errorMSI = signal('');

  mostrarFormularioAbono = signal(false);
  compraParaAbono = signal<number | null>(null);
  errorAbono = signal('');

  comprasTarjetaActiva = computed(() =>
    this.comprasMSI().filter(
      compra => compra.tarjetaId === this.tarjetaSeleccionada()
    )
  );

  totalPendienteMSI = computed(() =>
    this.comprasTarjetaActiva().reduce(
      (total, compra) => total + this.saldoPendienteMSI(compra),
      0
    )
  );

  compraActivaParaAbono = computed(() =>
    this.comprasMSI().find(
      compra => compra.id === this.compraParaAbono()
    ) ?? null
  );

  formTarjeta = this.fb.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3)
    ]],
    banco: ['', Validators.required],
    tipo: ['credito' as 'credito' | 'debito'],
    ultimosDigitos: ['', [
      Validators.required,
      Validators.pattern(/^\d{4}$/)
    ]],
    color: ['#6540bd'],
    saldo: [0, [
      Validators.required,
      Validators.min(0)
    ]],
    limite: [0, Validators.min(0)],
    diaCorte: [1, [
      Validators.required,
      Validators.min(1),
      Validators.max(31),
      Validators.pattern(/^\d+$/)
    ]],
    diaPago: [1, [
      Validators.required,
      Validators.min(1),
      Validators.max(31),
      Validators.pattern(/^\d+$/)
    ]]
  });

  formMSI = this.fb.nonNullable.group({
    concepto: ['', [
      Validators.required,
      Validators.minLength(3)
    ]],
    montoTotal: [0, [
      Validators.required,
      Validators.min(0.01)
    ]],
    meses: [12, Validators.required],
    fechaCompra: ['', Validators.required]
  });

  formAbono = this.fb.nonNullable.group({
    monto: [0, [
      Validators.required,
      Validators.min(0.01)
    ]],
    fecha: ['', Validators.required]
  });

  private nuevoId(): number {
    return ++this.siguienteId;
  }

  private redondear(monto: number): number {
    return Math.round((monto + Number.EPSILON) * 100) / 100;
  }

  private fechaValida(valor: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;

    const [anio, mes, dia] = valor.split('-').map(Number);
    const fecha = new Date(anio, mes - 1, dia);

    return fecha.getFullYear() === anio &&
      fecha.getMonth() === mes - 1 &&
      fecha.getDate() === dia;
  }

  private fechaHoy(): string {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');

    return `${anio}-${mes}-${dia}`;
  }

  formatoMoneda(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }

  seleccionarTarjeta(id: number): void {
    this.tarjetaSeleccionada.set(id);
  }

  obtenerDisponible(tarjeta: Tarjeta): number {
    return tarjeta.tipo === 'credito'
      ? Math.max(0, (tarjeta.limite ?? 0) - tarjeta.saldo)
      : tarjeta.saldo;
  }

  porcentajeUtilizado(tarjeta: Tarjeta): number {
    if (tarjeta.tipo !== 'credito' || !tarjeta.limite) {
      return 0;
    }

    return Math.min(
      100,
      (tarjeta.saldo / tarjeta.limite) * 100
    );
  }

  // CREAR TARJETA
  abrirFormulario(): void {
    this.tarjetaEditando.set(null);
    this.formTarjeta.reset();
    this.errorFormulario.set('');
    this.mostrarFormulario.set(true);
  }

  // EDITAR TARJETA
  editarTarjeta(): void {
    const tarjeta = this.tarjetaActiva();
    if (!tarjeta) return;

    this.tarjetaEditando.set(tarjeta.id);
    this.errorFormulario.set('');

    this.formTarjeta.setValue({
      nombre: tarjeta.nombre,
      banco: tarjeta.banco,
      tipo: tarjeta.tipo,
      ultimosDigitos: tarjeta.ultimosDigitos,
      color: tarjeta.color,
      saldo: tarjeta.saldo,
      limite: tarjeta.limite ?? 0,
      diaCorte: tarjeta.diaCorte ?? 1,
      diaPago: tarjeta.diaPago ?? 1
    });

    this.mostrarFormulario.set(true);
  }

  cerrarFormulario(): void {
    this.mostrarFormulario.set(false);
    this.tarjetaEditando.set(null);
    this.errorFormulario.set('');
  }

  guardarTarjeta(): void {
    this.errorFormulario.set('');

    if (this.formTarjeta.invalid) {
      this.formTarjeta.markAllAsTouched();
      return;
    }

    const datos = this.formTarjeta.getRawValue();
    const nombre = datos.nombre.trim();
    const banco = datos.banco.trim();

    if (nombre.length < 3 || !banco) {
      this.errorFormulario.set(
        'Verifica el nombre de la tarjeta y el banco.'
      );
      return;
    }

    if (!Number.isFinite(datos.saldo) || datos.saldo < 0) {
      this.errorFormulario.set('Ingresa un saldo válido.');
      return;
    }

    if (datos.tipo === 'credito') {
      if (
        !Number.isFinite(datos.limite) ||
        datos.limite <= 0 ||
        datos.saldo > datos.limite
      ) {
        this.errorFormulario.set(
          'El límite debe ser mayor que cero y el crédito utilizado no puede superarlo.'
        );
        return;
      }

      if (![datos.diaCorte, datos.diaPago].every(
        dia => Number.isInteger(dia) && dia >= 1 && dia <= 31
      )) {
        this.errorFormulario.set(
          'Los días de corte y pago deben estar entre 1 y 31.'
        );
        return;
      }
    }

    const idEditando = this.tarjetaEditando();

    if (
      idEditando !== null &&
      datos.tipo === 'debito' &&
      this.comprasMSI().some(c => c.tarjetaId === idEditando)
    ) {
      this.errorFormulario.set(
        'No puedes cambiar a débito una tarjeta con compras MSI.'
      );
      return;
    }

    const tarjetaGuardada: Tarjeta = {
      id: idEditando ?? this.nuevoId(),
      nombre,
      banco,
      tipo: datos.tipo,
      ultimosDigitos: datos.ultimosDigitos,
      color: datos.color,
      saldo: datos.saldo,
      ...(datos.tipo === 'credito'
        ? {
            limite: datos.limite,
            diaCorte: datos.diaCorte,
            diaPago: datos.diaPago
          }
        : {})
    };

    if (idEditando !== null) {
      this.tarjetas.update(actuales =>
        actuales.map(t =>
          t.id === idEditando ? tarjetaGuardada : t
        )
      );
    } else {
      this.tarjetas.update(actuales => [
        ...actuales,
        tarjetaGuardada
      ]);
    }

    this.tarjetaSeleccionada.set(tarjetaGuardada.id);
    this.cerrarFormulario();
  }

  eliminarTarjeta(): void {
    const tarjeta = this.tarjetaActiva();
    if (!tarjeta) return;

    if (this.comprasMSI().some(c => c.tarjetaId === tarjeta.id)) {
      window.alert(
        'Esta tarjeta tiene compras MSI. Elimina primero esas compras.'
      );
      return;
    }

    if (!window.confirm(
      `¿Eliminar la tarjeta "${tarjeta.nombre}"?`
    )) return;

    this.tarjetas.update(actuales =>
      actuales.filter(t => t.id !== tarjeta.id)
    );

    this.tarjetaSeleccionada.set(this.tarjetas()[0]?.id ?? null);
  }

  // CREAR COMPRA MSI
  abrirFormularioMSI(): void {
  const tarjeta = this.tarjetaActiva();

  if (!tarjeta || tarjeta.tipo !== 'credito') return;

  this.compraEditando.set(null);

  this.formMSI.reset({
    concepto: '',
    montoTotal: 0,
    meses: 12,
    fechaCompra: this.fechaHoy()
  });

  this.errorMSI.set('');
  this.mostrarFormularioMSI.set(true);
}

editarCompraMSI(compraId: number): void {
  const compra = this.comprasMSI().find(
    c => c.id === compraId &&
         c.tarjetaId === this.tarjetaSeleccionada()
  );

  if (!compra) return;

  this.compraEditando.set(compra.id);
  this.errorMSI.set('');

  this.formMSI.setValue({
    concepto: compra.concepto,
    montoTotal: compra.montoTotal,
    meses: compra.meses,
    fechaCompra: compra.fechaCompra
  });

  this.mostrarFormularioMSI.set(true);
}


  cerrarFormularioMSI(): void {
  this.mostrarFormularioMSI.set(false);
  this.compraEditando.set(null);
  this.errorMSI.set('');
}

  guardarCompraMSI(): void {
  this.errorMSI.set('');

  if (this.formMSI.invalid) {
    this.formMSI.markAllAsTouched();
    return;
  }

  const tarjeta = this.tarjetaActiva();

  if (!tarjeta || tarjeta.tipo !== 'credito') return;

  const datos = this.formMSI.getRawValue();
  const concepto = datos.concepto.trim();

  if (concepto.length < 3) {
    this.errorMSI.set('Escribe un concepto válido.');
    return;
  }

  if (
    !Number.isFinite(datos.montoTotal) ||
    datos.montoTotal <= 0
  ) {
    this.errorMSI.set('Ingresa un monto válido.');
    return;
  }

  if (![3, 6, 9, 12, 15, 18, 24].includes(datos.meses)) {
    this.errorMSI.set('Selecciona un plazo válido.');
    return;
  }

  if (!this.fechaValida(datos.fechaCompra)) {
    this.errorMSI.set('Ingresa una fecha válida.');
    return;
  }

  const idEditando = this.compraEditando();
  const montoTotal = this.redondear(datos.montoTotal);

  // EDITAR COMPRA EXISTENTE
  if (idEditando !== null) {
    const compraOriginal = this.comprasMSI().find(
      c => c.id === idEditando &&
           c.tarjetaId === tarjeta.id
    );

    if (!compraOriginal) {
      this.errorMSI.set('No se encontró la compra.');
      return;
    }

    const totalAbonado = this.totalAbonadoMSI(compraOriginal);

    if (montoTotal < totalAbonado) {
      this.errorMSI.set(
        'El monto de la compra no puede ser menor que el total abonado.'
      );
      return;
    }

    if (
      compraOriginal.abonos.some(
        abono => abono.fecha < datos.fechaCompra
      )
    ) {
      this.errorMSI.set(
        'La fecha de compra no puede ser posterior a un abono registrado.'
      );
      return;
    }

    this.comprasMSI.update(actuales =>
      actuales.map(compra =>
        compra.id === idEditando
          ? {
              ...compra,
              concepto,
              montoTotal,
              meses: datos.meses,
              fechaCompra: datos.fechaCompra
            }
          : compra
      )
    );

  } else {
    // CREAR NUEVA COMPRA
    const nuevaCompra: CompraMSI = {
      id: this.nuevoId(),
      tarjetaId: tarjeta.id,
      concepto,
      montoTotal,
      meses: datos.meses,
      fechaCompra: datos.fechaCompra,
      abonos: []
    };

    this.comprasMSI.update(actuales => [
      ...actuales,
      nuevaCompra
    ]);
  }

  this.cerrarFormularioMSI();
}

  // CÁLCULOS MSI
  mensualidadMSI(compra: CompraMSI): number {
    return this.redondear(compra.montoTotal / compra.meses);
  }

  totalAbonadoMSI(compra: CompraMSI): number {
    return this.redondear(
      compra.abonos.reduce(
        (total, abono) => total + abono.monto,
        0
      )
    );
  }

  saldoPendienteMSI(compra: CompraMSI): number {
    return Math.max(
      0,
      this.redondear(
        compra.montoTotal - this.totalAbonadoMSI(compra)
      )
    );
  }

  porcentajeMSI(compra: CompraMSI): number {
    if (compra.montoTotal <= 0) return 0;

    return Math.min(
      100,
      this.totalAbonadoMSI(compra) / compra.montoTotal * 100
    );
  }

  mensualidadesCubiertas(compra: CompraMSI): number {
    return Math.min(
      compra.meses,
      Math.floor(
        (this.totalAbonadoMSI(compra) + 0.000001) /
        (compra.montoTotal / compra.meses)
      )
    );
  }

  adelantoSiguienteMSI(compra: CompraMSI): number {
    if (this.saldoPendienteMSI(compra) === 0) return 0;

    const cubiertas = this.mensualidadesCubiertas(compra);
    const mensualidadExacta = compra.montoTotal / compra.meses;

    return Math.max(
      0,
      this.redondear(
        this.totalAbonadoMSI(compra) -
        cubiertas * mensualidadExacta
      )
    );
  }

  faltaSiguienteMSI(compra: CompraMSI): number {
    if (this.saldoPendienteMSI(compra) === 0) return 0;

    return this.redondear(
      compra.montoTotal / compra.meses -
      this.adelantoSiguienteMSI(compra)
    );
  }

  // REGISTRAR ABONO
  abrirFormularioAbono(compraId: number): void {
    const compra = this.comprasMSI().find(c => c.id === compraId);
    if (!compra || this.saldoPendienteMSI(compra) <= 0) return;

    this.compraParaAbono.set(compraId);
    this.errorAbono.set('');

    this.formAbono.reset({
      monto: 0,
      fecha: this.fechaHoy()
    });

    this.mostrarFormularioAbono.set(true);
  }

  cerrarFormularioAbono(): void {
    this.mostrarFormularioAbono.set(false);
    this.compraParaAbono.set(null);
    this.errorAbono.set('');
  }

  guardarAbono(): void {
    this.errorAbono.set('');

    if (this.formAbono.invalid) {
      this.formAbono.markAllAsTouched();
      return;
    }

    const compra = this.compraActivaParaAbono();
    if (!compra) return;

    const datos = this.formAbono.getRawValue();
    const monto = this.redondear(datos.monto);

    if (!Number.isFinite(monto) || monto <= 0) {
      this.errorAbono.set('Ingresa un monto válido.');
      return;
    }

    if (monto > this.saldoPendienteMSI(compra)) {
      this.errorAbono.set(
        'El abono no puede superar el saldo pendiente de la compra.'
      );
      return;
    }

    if (!this.fechaValida(datos.fecha)) {
      this.errorAbono.set('Ingresa una fecha válida.');
      return;
    }

    if (datos.fecha < compra.fechaCompra) {
      this.errorAbono.set(
        'La fecha del abono no puede ser anterior a la compra.'
      );
      return;
    }

    const nuevoAbono: AbonoMSI = {
      id: this.nuevoId(),
      monto,
      fecha: datos.fecha
    };

    this.comprasMSI.update(actuales =>
      actuales.map(c =>
        c.id === compra.id
          ? { ...c, abonos: [...c.abonos, nuevoAbono] }
          : c
      )
    );

    this.cerrarFormularioAbono();
  }

  // CORREGIR UN ABONO EQUIVOCADO
  eliminarAbono(compraId: number, abonoId: number): void {
    if (!window.confirm(
      '¿Eliminar este abono del historial? El saldo pendiente se recalculará.'
    )) return;

    this.comprasMSI.update(actuales =>
      actuales.map(compra =>
        compra.id === compraId
          ? {
              ...compra,
              abonos: compra.abonos.filter(a => a.id !== abonoId)
            }
          : compra
      )
    );
  }

  // ELIMINAR COMPRA MSI
  eliminarCompraMSI(compraId: number): void {
    const compra = this.comprasMSI().find(c => c.id === compraId);
    if (!compra) return;

    if (!window.confirm(
      `¿Eliminar la compra "${compra.concepto}" y su historial de abonos?`
    )) return;

    this.comprasMSI.update(actuales =>
      actuales.filter(c => c.id !== compraId)
    );
  }

  
  // FECHAS DE CORTE Y PAGO

  private crearFechaDelMes(
    anio: number,
    mes: number,
    dia: number
  ): Date {
    const ultimoDia = new Date(anio, mes + 1, 0).getDate();

    return new Date(
      anio,
      mes,
      Math.min(dia, ultimoDia)
    );
  }

  private siguienteFecha(dia: number): Date {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let fecha = this.crearFechaDelMes(
      hoy.getFullYear(),
      hoy.getMonth(),
      dia
    );

    if (fecha < hoy) {
      fecha = this.crearFechaDelMes(
        hoy.getFullYear(),
        hoy.getMonth() + 1,
        dia
      );
    }

    return fecha;
  }

  proximoCorte(tarjeta: Tarjeta): Date | null {
    if (tarjeta.tipo !== 'credito' || !tarjeta.diaCorte) {
      return null;
    }

    return this.siguienteFecha(tarjeta.diaCorte);
  }

  proximoPago(tarjeta: Tarjeta): Date | null {
    if (tarjeta.tipo !== 'credito' || !tarjeta.diaPago) {
      return null;
    }

    return this.siguienteFecha(tarjeta.diaPago);
  }

  diasParaPago(tarjeta: Tarjeta): number | null {
    const fecha = this.proximoPago(tarjeta);
    if (!fecha) return null;

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const diferencia = fecha.getTime() - hoy.getTime();

    return Math.round(diferencia / 86400000);
  }

  estadoProximoPago(tarjeta: Tarjeta): string {
    const dias = this.diasParaPago(tarjeta);

    if (dias === null) return 'Sin fecha';

    if (dias === 0) return 'La fecha de pago es hoy';

    if (dias === 1) return 'La fecha de pago es mañana';

    if (dias <= 5) {
      return `Faltan ${dias} días para la fecha de pago`;
    }

    return `Faltan ${dias} días para la fecha de pago`;
  }

  nivelAlertaPago(tarjeta: Tarjeta): string {
    const dias = this.diasParaPago(tarjeta);

    if (dias === null) return 'normal';
    if (dias <= 2) return 'urgente';
    if (dias <= 5) return 'proximo';

    return 'normal';
  }

  formatearFecha(fecha: Date | null): string {
    if (!fecha) return 'No disponible';

    return new Intl.DateTimeFormat('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(fecha);
  }

}

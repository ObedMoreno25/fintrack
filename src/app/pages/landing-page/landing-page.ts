
import { Component, signal, computed} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {

  funcionalidades = [
    {
      icono: '/icons/credit-card-check.svg',
      titulo: 'Tus tarjetas',
      descripcion: 'Controla fechas de corte, pagos y compras a meses sin intereses.'
    },
    {
      icono: '/icons/chart-no-axes-column-increasing.svg',
      titulo: 'Presupuestos',
      descripcion: 'Organiza tu sueldo y planifica tus gastos con el método 50/30/20.'
    },
    {
      icono: '/icons/piggy-bank.svg',
      titulo: 'Metas de ahorro',
      descripcion: 'Establece objetivos, registra aportaciones y visualiza tu progreso.'
    },
    {
      icono: '/icons/chart-pie.svg',
      titulo: 'Ingresos y gastos',
      descripcion: 'Registra tus movimientos y conoce en qué se va tu dinero.'
    }
  ];

  
seccionActiva = signal<'tarjetas' | 'presupuestos' | 'ahorro'>('tarjetas');

secciones = {
  tarjetas: {
    titulo: 'Todas tus tarjetas, bajo control',
    descripcion: 'Consulta fechas de corte, próximos pagos y compras a meses sin intereses.',
    etiqueta: 'Próximo pago',
    cantidad: '$850',
    detalle: 'Tarjeta de ejemplo',
    icono: '/icons/credit-card-check.svg'
  },

  presupuestos: {
    titulo: 'Dale un propósito a tu sueldo',
    descripcion: 'Organiza tus ingresos con el método 50/30/20 y adapta tus presupuestos.',
    etiqueta: 'Presupuesto quincenal',
    cantidad: '$7,000',
    detalle: '50% necesidades · 30% deseos · 20% ahorro',
    icono: '/icons/chart-pie.svg'
  },

  ahorro: {
    titulo: 'Convierte tus metas en logros',
    descripcion: 'Establece objetivos de ahorro y visualiza cuánto te falta para alcanzarlos.',
    etiqueta: 'Fondo de emergencia',
    cantidad: '65%',
    detalle: '$6,500 de $10,000',
    icono: '/icons/target.svg'
  }
};

contenidoActivo = computed(() => {
  return this.secciones[this.seccionActiva()];
});

cambiarSeccion(seccion: 'tarjetas' | 'presupuestos' | 'ahorro') {
  this.seccionActiva.set(seccion);
}


}

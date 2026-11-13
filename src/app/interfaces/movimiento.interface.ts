
export interface Movimiento {
  id: number;
  concepto: string;
  cantidad: number;
  categoria: string;
  fecha: string;
  tipo: 'ingreso' | 'gasto';
}

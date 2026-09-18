export type TipoTorre = 'TORRE_MONTADA' | 'TORRE_SEPARADA';

export interface RegistroProducao {
  id: string;
  tipo: TipoTorre;
  os: string;            // Ordem de Serviço
  so: string;            // Sales Order / Ordem de Venda
  of: string;            // Ordem de Fabricação
  peso: number;          // em kg
  data_registro: string; // YYYY-MM-DD
  observacoes?: string;
  criado_em?: string;
}

export interface FiltroProducao {
  mesAno: string;        // 'YYYY-MM' ou 'TODOS'
  termoBusca: string;    // Busca por OS, SO, OF
  tipoFiltro?: TipoTorre | 'TODOS';
}

export interface MetricasResumo {
  pesoTotalMontada: number;
  pesoTotalSeparada: number;
  pesoTotalGeral: number;
  totalOrdens: number;
  ordensMontadas: number;
  ordensSeparadas: number;
  pesoMedioOrdem: number;
}

export interface HistoricoMensal {
  mesAno: string;       // 'YYYY-MM'
  nomeMes: string;      // 'Set/2026'
  pesoMontada: number;
  pesoSeparada: number;
  pesoTotal: number;
  qtdOrdens: number;
}

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { RegistroProducao, FiltroProducao, MetricasResumo, HistoricoMensal, TipoTorre } from '../types/production';
import { storageService } from '../services/storageService';
import { obterMesAnoAtual } from '../utils/formatters';

interface ProductionContextType {
  registros: RegistroProducao[];
  registrosFiltrados: RegistroProducao[];
  filtro: FiltroProducao;
  setFiltro: React.Dispatch<React.SetStateAction<FiltroProducao>>;
  mesesDisponiveis: { valor: string; label: string }[];
  metricasMes: MetricasResumo;
  metricasGerais: MetricasResumo;
  historicoMensal: HistoricoMensal[];
  adicionarRegistro: (registro: Omit<RegistroProducao, 'id' | 'criado_em'>) => void;
  adicionarRegistrosEmLote: (novos: Omit<RegistroProducao, 'id' | 'criado_em'>[]) => void;
  atualizarRegistro: (id: string, dados: Partial<RegistroProducao>) => void;
  excluirRegistro: (id: string) => void;
  resetarDados: () => void;
  exportarBackup: () => void;
  importarDadosJSON: (jsonData: RegistroProducao[]) => void;
}

const ProductionContext = createContext<ProductionContextType | undefined>(undefined);

export const ProductionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registros, setRegistros] = useState<RegistroProducao[]>(() => storageService.carregarRegistros());
  const [filtro, setFiltro] = useState<FiltroProducao>({
    mesAno: obterMesAnoAtual(),
    termoBusca: '',
    tipoFiltro: 'TODOS',
  });

  // Salvar no localStorage sempre que os registros mudarem
  useEffect(() => {
    storageService.salvarRegistros(registros);
  }, [registros]);

  // Lista de meses disponíveis dinamicamente com base nos registros
  const mesesDisponiveis = useMemo(() => {
    const mesesSet = new Set<string>();
    registros.forEach(r => {
      if (r.data_registro) {
        const mesAno = r.data_registro.slice(0, 7);
        mesesSet.add(mesAno);
      }
    });

    const mesAtual = obterMesAnoAtual();
    mesesSet.add(mesAtual);

    const mesesArr = Array.from(mesesSet).sort().reverse();

    const nomesMeses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return mesesArr.map(m => {
      const [ano, mes] = m.split('-');
      const nomeMes = nomesMeses[parseInt(mes, 10) - 1] || mes;
      return {
        valor: m,
        label: `${nomeMes} de ${ano}`
      };
    });
  }, [registros]);

  // Histórico consolidado por mês (para gráficos e relatório consolidado)
  const historicoMensal = useMemo(() => {
    const map = new Map<string, { pesoMontada: number; pesoSeparada: number; qtd: number }>();

    registros.forEach(r => {
      const mes = r.data_registro.slice(0, 7);
      const atual = map.get(mes) || { pesoMontada: 0, pesoSeparada: 0, qtd: 0 };
      if (r.tipo === 'TORRE_MONTADA') {
        atual.pesoMontada += r.peso;
      } else {
        atual.pesoSeparada += r.peso;
      }
      atual.qtd += 1;
      map.set(mes, atual);
    });

    const nomesAbrev = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([mesAno, val]) => {
        const [ano, mes] = mesAno.split('-');
        const nomeMes = `${nomesAbrev[parseInt(mes, 10) - 1]}/${ano.slice(2)}`;
        return {
          mesAno,
          nomeMes,
          pesoMontada: val.pesoMontada,
          pesoSeparada: val.pesoSeparada,
          pesoTotal: val.pesoMontada + val.pesoSeparada,
          qtdOrdens: val.qtd
        };
      });
  }, [registros]);

  // Registros filtrados com base no mês e busca
  const registrosFiltrados = useMemo(() => {
    return registros.filter(r => {
      // Filtro por Mês/Ano
      if (filtro.mesAno !== 'TODOS') {
        const rMes = r.data_registro.slice(0, 7);
        if (rMes !== filtro.mesAno) return false;
      }

      // Filtro por Tipo de Torre
      if (filtro.tipoFiltro && filtro.tipoFiltro !== 'TODOS') {
        if (r.tipo !== filtro.tipoFiltro) return false;
      }

      // Filtro por Termo de Busca (OS, SO, OF, Observações)
      if (filtro.termoBusca.trim()) {
        const termo = filtro.termoBusca.toLowerCase().trim();
        const matchOS = r.os.toLowerCase().includes(termo);
        const matchSO = r.so.toLowerCase().includes(termo);
        const matchOF = r.of.toLowerCase().includes(termo);
        const matchObs = (r.observacoes || '').toLowerCase().includes(termo);
        if (!matchOS && !matchSO && !matchOF && !matchObs) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.data_registro).getTime() - new Date(a.data_registro).getTime());
  }, [registros, filtro]);

  // Métricas do período filtrado (ou mês selecionado)
  const metricasMes = useMemo(() => {
    // Calculamos as métricas baseadas no mês selecionado
    const registrosMes = filtro.mesAno === 'TODOS'
      ? registros
      : registros.filter(r => r.data_registro.slice(0, 7) === filtro.mesAno);

    let montada = 0;
    let separada = 0;
    let ordensM = 0;
    let ordensS = 0;

    registrosMes.forEach(r => {
      if (r.tipo === 'TORRE_MONTADA') {
        montada += r.peso;
        ordensM++;
      } else {
        separada += r.peso;
        ordensS++;
      }
    });

    const total = montada + separada;
    const qtdTotal = ordensM + ordensS;
    const media = qtdTotal > 0 ? total / qtdTotal : 0;

    return {
      pesoTotalMontada: montada,
      pesoTotalSeparada: separada,
      pesoTotalGeral: total,
      totalOrdens: qtdTotal,
      ordensMontadas: ordensM,
      ordensSeparadas: ordensS,
      pesoMedioOrdem: media,
    };
  }, [registros, filtro.mesAno]);

  // Métricas Gerais (histórico acumulado total do sistema)
  const metricasGerais = useMemo(() => {
    let montada = 0;
    let separada = 0;
    let ordensM = 0;
    let ordensS = 0;

    registros.forEach(r => {
      if (r.tipo === 'TORRE_MONTADA') {
        montada += r.peso;
        ordensM++;
      } else {
        separada += r.peso;
        ordensS++;
      }
    });

    const total = montada + separada;
    const qtdTotal = ordensM + ordensS;
    const media = qtdTotal > 0 ? total / qtdTotal : 0;

    return {
      pesoTotalMontada: montada,
      pesoTotalSeparada: separada,
      pesoTotalGeral: total,
      totalOrdens: qtdTotal,
      ordensMontadas: ordensM,
      ordensSeparadas: ordensS,
      pesoMedioOrdem: media,
    };
  }, [registros]);

  const adicionarRegistro = (dados: Omit<RegistroProducao, 'id' | 'criado_em'>) => {
    const novo: RegistroProducao = {
      ...dados,
      id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      criado_em: new Date().toISOString(),
    };
    setRegistros(prev => [novo, ...prev]);
  };

  const adicionarRegistrosEmLote = (novos: Omit<RegistroProducao, 'id' | 'criado_em'>[]) => {
    const comIds: RegistroProducao[] = novos.map((item, idx) => ({
      ...item,
      id: 'rec-bulk-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).substring(2, 6),
      criado_em: new Date().toISOString(),
    }));
    setRegistros(prev => [...comIds, ...prev]);
  };

  const atualizarRegistro = (id: string, dados: Partial<RegistroProducao>) => {
    setRegistros(prev => prev.map(r => r.id === id ? { ...r, ...dados } : r));
  };

  const excluirRegistro = (id: string) => {
    setRegistros(prev => prev.filter(r => r.id !== id));
  };

  const resetarDados = () => {
    const dados = storageService.resetarParaDadosIniciais();
    setRegistros(dados);
  };

  const exportarBackup = () => {
    storageService.exportarBackupJSON(registros);
  };

  const importarDadosJSON = (jsonData: RegistroProducao[]) => {
    if (Array.isArray(jsonData)) {
      setRegistros(jsonData);
    }
  };

  return (
    <ProductionContext.Provider
      value={{
        registros,
        registrosFiltrados,
        filtro,
        setFiltro,
        mesesDisponiveis,
        metricasMes,
        metricasGerais,
        historicoMensal,
        adicionarRegistro,
        adicionarRegistrosEmLote,
        atualizarRegistro,
        excluirRegistro,
        resetarDados,
        exportarBackup,
        importarDadosJSON,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};

export const useProduction = () => {
  const context = useContext(ProductionContext);
  if (!context) {
    throw new Error('useProduction deve ser usado dentro de ProductionProvider');
  }
  return context;
};

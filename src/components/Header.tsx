import React, { useState } from 'react';
import { 
  Building2, 
  FileDown, 
  Layers, 
  RotateCcw, 
  Download, 
  Upload, 
  PlusCircle, 
  TableProperties,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';

import { useProduction } from '../context/ProductionContext';
import { pdfService } from '../services/pdfService';
import { formatarMesAno } from '../utils/formatters';

interface HeaderProps {
  onOpenBulkModal: () => void;
  onOpenExcelModal: () => void;
  getChartCanvas1?: () => HTMLCanvasElement | null;
  getChartCanvas2?: () => HTMLCanvasElement | null;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenBulkModal,
  onOpenExcelModal,
  getChartCanvas1,
  getChartCanvas2
}) => {

  const { 
    registros, 
    registrosFiltrados, 
    filtro, 
    metricasMes, 
    metricasGerais, 
    historicoMensal, 
    resetarDados, 
    exportarBackup,
    importarDadosJSON 
  } = useProduction();

  const [gerandoPdfMes, setGerandoPdfMes] = useState(false);
  const [gerandoPdfConsolidado, setGerandoPdfConsolidado] = useState(false);
  const [alertaSucesso, setAlertaSucesso] = useState<string | null>(null);

  const mostrarSucesso = (msg: string) => {
    setAlertaSucesso(msg);
    setTimeout(() => setAlertaSucesso(null), 4000);
  };

  const handleExportarPdfMes = () => {
    try {
      setGerandoPdfMes(true);
      let chartImg: string | undefined = undefined;
      
      const canvas1 = getChartCanvas1?.();
      if (canvas1) {
        chartImg = canvas1.toDataURL('image/png', 1.0);
      }

      pdfService.exportarPdfMensal({
        mesAno: filtro.mesAno,
        registros: registrosFiltrados,
        metricas: metricasMes,
        chartDataUrl: chartImg,
      });

      mostrarSucesso(`Relatório PDF de ${formatarMesAno(filtro.mesAno)} gerado com sucesso!`);
    } catch (err) {
      console.error('Erro ao gerar PDF mensal:', err);
      alert('Ocorreu um erro ao gerar o relatório PDF.');
    } finally {
      setGerandoPdfMes(false);
    }
  };

  const handleExportarPdfConsolidado = () => {
    try {
      setGerandoPdfConsolidado(true);
      let chartImg: string | undefined = undefined;
      
      const canvas1 = getChartCanvas1?.();
      if (canvas1) {
        chartImg = canvas1.toDataURL('image/png', 1.0);
      }

      pdfService.exportarPdfConsolidado({
        historico: historicoMensal,
        metricasGerais: metricasGerais,
        chartDataUrl: chartImg,
      });

      mostrarSucesso('Relatório PDF Consolidado gerado com sucesso!');
    } catch (err) {
      console.error('Erro ao gerar PDF consolidado:', err);
      alert('Ocorreu um erro ao gerar o relatório PDF consolidado.');
    } finally {
      setGerandoPdfConsolidado(false);
    }
  };

  const handleImportarArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target?.result as string);
        if (Array.isArray(json)) {
          importarDadosJSON(json);
          mostrarSucesso(`${json.length} registros importados com sucesso!`);
        } else {
          alert('Arquivo JSON inválido. Certifique-se de que é uma lista de registros.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-xl backdrop-blur-md bg-opacity-95">
      {/* Notificação Toast Flutuante */}
      {alertaSucesso && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-lg shadow-2xl border border-emerald-400 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{alertaSucesso}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Logo e Identificação do Sistema */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  GESTÃO DE PRODUÇÃO
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    PESO DE TORRES
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>Controle de Torre Montada vs. Torre Separada</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="text-slate-400 font-mono text-[11px]">{registros.length} ordens registradas</span>
              </p>
            </div>
          </div>

          {/* Barra de Ações & Botões de Exportação PDF */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* NOVO: Importar Planilha Excel */}
            <button
              onClick={onOpenExcelModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 hover:border-emerald-500/70 transition-all shadow-sm active:scale-95"
              title="Importar dados de planilha Excel (.xlsx, .xls, .csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Importar Excel</span>
            </button>

            {/* Lançamento em Lote / Planilha Rápida */}
            <button
              onClick={onOpenBulkModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition-all shadow-sm active:scale-95"
              title="Inserir vários registros em modo planilha manual"
            >
              <TableProperties className="w-4 h-4 text-amber-400" />
              <span>Entrada em Planilha</span>
            </button>


            {/* BOTÃO 1: Exportar PDF do Mês */}
            <button
              onClick={handleExportarPdfMes}
              disabled={gerandoPdfMes}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30 transition-all active:scale-95 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{gerandoPdfMes ? 'Gerando...' : 'Exportar PDF do Mês'}</span>
            </button>

            {/* BOTÃO 2: Exportar PDF Consolidado */}
            <button
              onClick={handleExportarPdfConsolidado}
              disabled={gerandoPdfConsolidado}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 hover:border-cyan-500/60 shadow-lg shadow-cyan-950/40 transition-all active:scale-95 disabled:opacity-50"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{gerandoPdfConsolidado ? 'Consolidando...' : 'Exportar PDF Consolidado'}</span>
            </button>

            {/* Menu Utilitários (Backup / Reset) */}
            <div className="flex items-center border-l border-slate-700 pl-2.5 ml-1 gap-1.5">
              <button
                onClick={exportarBackup}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Baixar Backup em JSON"
              >
                <Download className="w-4 h-4" />
              </button>

              <label 
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Restaurar Backup JSON"
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportarArquivo} 
                  className="hidden" 
                />
              </label>

              <button
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja limpar todos os registros?')) {
                    resetarDados();
                    mostrarSucesso('Todos os registros foram limpos com sucesso!');
                  }
                }}
                className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                title="Limpar todos os registros"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

            </div>

          </div>
        </div>
      </div>
    </header>
  );
};

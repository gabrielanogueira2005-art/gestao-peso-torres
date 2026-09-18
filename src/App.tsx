import React, { useRef, useState } from 'react';
import { ProductionProvider } from './context/ProductionContext';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { EntryForm } from './components/EntryForm';
import { FilterBar } from './components/FilterBar';
import { ProductionTables } from './components/ProductionTables';
import { ProductionCharts, ProductionChartsRef } from './components/ProductionCharts';
import { BulkEntryModal } from './components/BulkEntryModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ShieldCheck, HardHat } from 'lucide-react';

export function AppContent() {
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const chartsRef = useRef<ProductionChartsRef>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Cabeçalho Industrial com Ações e Botões de PDF */}
      <Header
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        getChartCanvas1={() => chartsRef.current?.getChart1Canvas() || null}
        getChartCanvas2={() => chartsRef.current?.getChart2Canvas() || null}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-2">
        {/* 1. Painel Superior (KPIs) */}
        <MetricCards />

        {/* 2. Área de Lançamento Rápido */}
        <EntryForm onOpenExcelModal={() => setIsExcelModalOpen(true)} />

        {/* 3. Barra de Filtros (Mês/Ano & Busca em Tempo Real) */}
        <FilterBar />

        {/* 4. Visualização e Gráficos */}
        <ProductionCharts ref={chartsRef} />

        {/* 5. Tabelas Principais (Torre Montada vs. Torre Separada) */}
        <ProductionTables />
      </main>

      {/* Modal de Lançamento Rápido em Planilha Manual */}
      <BulkEntryModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
      />

      {/* Modal de Importação de Arquivos Excel */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
      />


      {/* Rodapé Industrial */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 mt-12 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HardHat className="w-4 h-4 text-amber-400" />
            <span>Sistema Integrado de Gestão de Produção & Controle de Peso Estrutural</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Módulo: Pesagem de Torres v2.4</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              ISO 9001 Quality Compliant
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProductionProvider>
      <AppContent />
    </ProductionProvider>
  );
}


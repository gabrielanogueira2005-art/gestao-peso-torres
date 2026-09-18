import React from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  X,
  Layers,
  Boxes,
  Layers2,
  LayoutGrid
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { TipoTorre } from '../types/production';

export const FilterBar: React.FC = () => {
  const { filtro, setFiltro, mesesDisponiveis, registrosFiltrados, registros } = useProduction();

  const handleMesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFiltro(prev => ({ ...prev, mesAno: e.target.value }));
  };

  const handleBuscaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltro(prev => ({ ...prev, termoBusca: e.target.value }));
  };

  const handleTipoChange = (tipo: TipoTorre | 'TODOS') => {
    setFiltro(prev => ({ ...prev, tipoFiltro: tipo }));
  };

  const limparBusca = () => {
    setFiltro(prev => ({ ...prev, termoBusca: '' }));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 shadow-md">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Lado Esquerdo: Filtro Global de Mês/Ano & Tipo */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Seletor Mês/Ano */}
          <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-3 py-2 text-white focus-within:border-blue-500 transition-colors">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Período:</span>
            <select
              value={filtro.mesAno}
              onChange={handleMesChange}
              aria-label="Filtro de Período"
              className="bg-transparent text-sm font-bold text-white focus:outline-none cursor-pointer pr-2"
            >
              <option value="TODOS" className="bg-slate-900 text-white">Todos os Meses (Consolidado)</option>
              {mesesDisponiveis.map(m => (
                <option key={m.valor} value={m.valor} className="bg-slate-900 text-white">
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Rápido por Tipo */}
          <div className="inline-flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/80">
            <button
              onClick={() => handleTipoChange('TODOS')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                !filtro.tipoFiltro || filtro.tipoFiltro === 'TODOS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => handleTipoChange('TORRE_MONTADA')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filtro.tipoFiltro === 'TORRE_MONTADA'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Montada
            </button>
            <button
              onClick={() => handleTipoChange('TORRE_SEPARADA')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filtro.tipoFiltro === 'TORRE_SEPARADA'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-cyan-400'
              }`}
            >
              <Layers2 className="w-3.5 h-3.5" />
              Separada
            </button>
          </div>

        </div>

        {/* Lado Direito: Campo de Busca em Tempo Real por OS, SO, OF */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={filtro.termoBusca}
              onChange={handleBuscaChange}
              placeholder="Buscar por OS, SO, OF ou observações..."
              className="w-full pl-9 pr-8 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
            />
            {filtro.termoBusca && (
              <button
                onClick={limparBusca}
                className="absolute right-2.5 p-1 text-slate-400 hover:text-white rounded-md transition"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Indicador de Resultados Filtrados */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div>
          Exibindo <span className="font-bold text-white">{registrosFiltrados.length}</span> de <span className="font-bold text-slate-300">{registros.length}</span> registros totais
          {filtro.termoBusca && (
            <span className="ml-2 text-amber-400 font-mono">
              (filtro: "{filtro.termoBusca}")
            </span>
          )}
        </div>
        {filtro.mesAno !== 'TODOS' && (
          <span className="text-blue-400 text-[11px] font-mono">
            Filtrado por mês contábil
          </span>
        )}
      </div>
    </div>
  );
};

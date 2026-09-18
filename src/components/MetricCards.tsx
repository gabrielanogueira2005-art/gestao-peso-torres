import React from 'react';
import { 
  Boxes, 
  Layers2, 
  Scale, 
  ClipboardCheck, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { formatarPeso, formatarToneladas, formatarMesAno } from '../utils/formatters';

export const MetricCards: React.FC = () => {
  const { metricasMes, filtro } = useProduction();

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Indicadores de Desempenho ({formatarMesAno(filtro.mesAno)})</span>
        </h2>
        <span className="text-[11px] text-slate-500 font-mono">Atualizado em tempo real</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* CARD 1: Total Peso Torre Montada */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-emerald-500/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Torre Montada
              </p>
              <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight group-hover:text-emerald-400 transition-colors">
                {formatarPeso(metricasMes.pesoTotalMontada)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {metricasMes.ordensMontadas} ordens finalizadas
            </span>
            <span className="text-emerald-400 font-mono font-semibold">
              {formatarToneladas(metricasMes.pesoTotalMontada)}
            </span>
          </div>
        </div>

        {/* CARD 2: Total Peso Torre Separada */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-cyan-500/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Torre Separada
              </p>
              <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight group-hover:text-cyan-400 transition-colors">
                {formatarPeso(metricasMes.pesoTotalSeparada)}
              </h3>
            </div>
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Layers2 className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              {metricasMes.ordensSeparadas} ordens finalizadas
            </span>
            <span className="text-cyan-400 font-mono font-semibold">
              {formatarToneladas(metricasMes.pesoTotalSeparada)}
            </span>
          </div>
        </div>

        {/* CARD 3: Total Geral em Peso */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-blue-500/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Total Geral em Peso
              </p>
              <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight group-hover:text-blue-400 transition-colors">
                {formatarToneladas(metricasMes.pesoTotalGeral)}
              </h3>
            </div>
            <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Equivalente em kg:</span>
            <span className="text-blue-400 font-mono font-bold">
              {formatarPeso(metricasMes.pesoTotalGeral)}
            </span>
          </div>
        </div>

        {/* CARD 4: Quantidade Total de Ordens */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-amber-500/50 transition-all group relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
          
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Ordens Finalizadas
              </p>
              <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight group-hover:text-amber-400 transition-colors">
                {metricasMes.totalOrdens} <span className="text-sm font-normal text-slate-400">OS/OF</span>
              </h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <ClipboardCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Média por Ordem:</span>
            <span className="text-amber-400 font-mono font-bold">
              {formatarPeso(metricasMes.pesoMedioOrdem)}
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};

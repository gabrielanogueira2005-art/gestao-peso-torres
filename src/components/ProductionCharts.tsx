import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BarChart3, LineChart as LineChartIcon, Info } from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { formatarPeso, formatarDataBR, formatarMesAno } from '../utils/formatters';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export interface ProductionChartsRef {
  getChart1Canvas: () => HTMLCanvasElement | null;
  getChart2Canvas: () => HTMLCanvasElement | null;
}

export const ProductionCharts = forwardRef<ProductionChartsRef>((_, ref) => {
  const { registrosFiltrados, historicoMensal, filtro } = useProduction();
  
  const chart1Ref = useRef<any>(null);
  const chart2Ref = useRef<any>(null);

  useImperativeHandle(ref, () => ({
    getChart1Canvas: () => {
      return chart1Ref.current?.canvas || null;
    },
    getChart2Canvas: () => {
      return chart2Ref.current?.canvas || null;
    }
  }));

  // ==========================================
  // GRÁFICO 1: Barras Comparativas (Mês a Mês)
  // ==========================================
  const chart1Labels = historicoMensal.map(h => h.nomeMes);
  const dataMontada = historicoMensal.map(h => h.pesoMontada);
  const dataSeparada = historicoMensal.map(h => h.pesoSeparada);

  const barChartData = {
    labels: chart1Labels,
    datasets: [
      {
        label: 'Torre Montada (kg)',
        data: dataMontada,
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderColor: '#10b981',
        borderWidth: 1.5,
        borderRadius: 6,
      },
      {
        label: 'Torre Separada (kg)',
        data: dataSeparada,
        backgroundColor: 'rgba(6, 182, 212, 0.85)',
        borderColor: '#06b6d4',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 12, weight: 600 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y ?? 0;
            return ` ${context.dataset.label}: ${formatarPeso(val)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `${Number(value) / 1000} t`
        }
      }
    }
  };

  // ==========================================
  // GRÁFICO 2: Tendência Diária no Mês
  // ==========================================
  // Agrupar produção diária dentro dos registros filtrados
  const mapaDias = new Map<string, { montada: number; separada: number; total: number }>();

  registrosFiltrados.forEach(r => {
    if (r.data_registro) {
      const dia = r.data_registro;
      const atual = mapaDias.get(dia) || { montada: 0, separada: 0, total: 0 };
      if (r.tipo === 'TORRE_MONTADA') {
        atual.montada += r.peso;
      } else {
        atual.separada += r.peso;
      }
      atual.total += r.peso;
      mapaDias.set(dia, atual);
    }
  });

  const diasOrdenados = Array.from(mapaDias.keys()).sort();
  const lineLabels = diasOrdenados.map(d => formatarDataBR(d).slice(0, 5)); // "DD/MM"
  const lineMontada = diasOrdenados.map(d => mapaDias.get(d)?.montada || 0);
  const lineSeparada = diasOrdenados.map(d => mapaDias.get(d)?.separada || 0);
  const lineTotal = diasOrdenados.map(d => mapaDias.get(d)?.total || 0);

  const lineChartData = {
    labels: lineLabels.length > 0 ? lineLabels : ['Sem dados no período'],
    datasets: [
      {
        label: 'Produção Diária Total (kg)',
        data: lineTotal.length > 0 ? lineTotal : [0],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        borderWidth: 2.5,
      },
      {
        label: 'Montada (kg)',
        data: lineMontada.length > 0 ? lineMontada : [0],
        borderColor: '#10b981',
        borderDash: [5, 5],
        tension: 0.35,
        fill: false,
        pointRadius: 3,
        borderWidth: 2,
      },
      {
        label: 'Separada (kg)',
        data: lineSeparada.length > 0 ? lineSeparada : [0],
        borderColor: '#06b6d4',
        borderDash: [3, 3],
        tension: 0.35,
        fill: false,
        pointRadius: 3,
        borderWidth: 2,
      }
    ],
  };

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#cbd5e1',
          font: { family: 'Inter', size: 12, weight: 600 },
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleColor: '#f8fafc',
        bodyColor: '#cbd5e1',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context) => {
            const val = context.parsed.y ?? 0;
            return ` ${context.dataset.label}: ${formatarPeso(val)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 } }
      },
      y: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          callback: (value) => `${Number(value) / 1000} t`
        }
      }
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      {/* GRÁFICO 1 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Comparativo Mensal (Montada vs. Separada)
              </h3>
              <p className="text-xs text-slate-400">Histórico de tonelagem mês a mês</p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full relative">
          <Bar ref={chart1Ref} data={barChartData} options={barChartOptions} />
        </div>
      </div>

      {/* GRÁFICO 2 */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <LineChartIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Tendência Diária de Produção
              </h3>
              <p className="text-xs text-slate-400">
                Evolução no período ({formatarMesAno(filtro.mesAno)})
              </p>
            </div>
          </div>
        </div>

        <div className="h-64 w-full relative">
          <Line ref={chart2Ref} data={lineChartData} options={lineChartOptions} />
        </div>
      </div>

    </section>
  );
});

ProductionCharts.displayName = 'ProductionCharts';

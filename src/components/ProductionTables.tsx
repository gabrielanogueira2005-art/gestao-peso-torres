import React, { useState } from 'react';
import { 
  Boxes, 
  Layers2, 
  ListFilter, 
  Edit3, 
  Trash2, 
  Scale, 
  Calendar, 
  FileText, 
  ArrowUpDown,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { RegistroProducao, TipoTorre } from '../types/production';
import { formatarPeso, formatarToneladas, formatarDataBR } from '../utils/formatters';
import { EditRecordModal } from './EditRecordModal';

export const ProductionTables: React.FC = () => {
  const { registrosFiltrados, atualizarRegistro, excluirRegistro } = useProduction();

  const [activeTab, setActiveTab] = useState<'TODAS' | 'TORRE_MONTADA' | 'TORRE_SEPARADA'>('TORRE_MONTADA');
  const [registroEmEdicao, setRegistroEmEdicao] = useState<RegistroProducao | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [registroParaExcluir, setRegistroParaExcluir] = useState<RegistroProducao | null>(null);

  // Filtragem local conforme a aba ativa
  const registrosExibidos = registrosFiltrados.filter(r => {
    if (activeTab === 'TODAS') return true;
    return r.tipo === activeTab;
  });

  // Totais do conjunto exibido na tabela
  const totalPesoExibido = registrosExibidos.reduce((acc, r) => acc + r.peso, 0);

  const handleAbrirEdicao = (reg: RegistroProducao) => {
    setRegistroEmEdicao(reg);
    setIsEditModalOpen(true);
  };

  const handleConfirmarExclusao = () => {
    if (registroParaExcluir) {
      excluirRegistro(registroParaExcluir.id);
      setRegistroParaExcluir(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden mb-8">
      
      {/* Barra de Abas da Tabela */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 px-6 py-3 bg-slate-950/70 gap-3">
        
        <div className="flex items-center space-x-2">
          {/* Aba 1: Torre Montada */}
          <button
            onClick={() => setActiveTab('TORRE_MONTADA')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TORRE_MONTADA'
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>PESO DE TORRE MONTADA</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-emerald-500/20 text-emerald-300">
              {registrosFiltrados.filter(r => r.tipo === 'TORRE_MONTADA').length}
            </span>
          </button>

          {/* Aba 2: Torre Separada */}
          <button
            onClick={() => setActiveTab('TORRE_SEPARADA')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TORRE_SEPARADA'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers2 className="w-4 h-4" />
            <span>PESO DE TORRE SEPARADA</span>
            <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-cyan-500/20 text-cyan-300">
              {registrosFiltrados.filter(r => r.tipo === 'TORRE_SEPARADA').length}
            </span>
          </button>

          {/* Aba 3: Todas as Ordens */}
          <button
            onClick={() => setActiveTab('TODAS')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'TODAS'
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            <span>Todas as Ordens</span>
          </button>
        </div>

        {/* Resumo da visualização atual */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-400">
            Total da listagem:
          </span>
          <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 font-mono font-bold text-amber-400">
            {formatarPeso(totalPesoExibido)} ({formatarToneladas(totalPesoExibido)})
          </span>
        </div>

      </div>

      {/* Tabela de Registros */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Data Registro</th>
              <th className="py-3 px-4">Tipo Estrutura</th>
              <th className="py-3 px-4 font-mono">OS (Ordem Serviço)</th>
              <th className="py-3 px-4 font-mono">SO (Sales Order)</th>
              <th className="py-3 px-4 font-mono">OF (Ordem Fabr.)</th>
              <th className="py-3 px-4 text-right">Peso Registrado</th>
              <th className="py-3 px-4">Observações Técnicas</th>
              <th className="py-3 px-4 text-center w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {registrosExibidos.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Boxes className="w-8 h-8 text-slate-400 opacity-50" />
                    <p className="font-semibold text-slate-400">Nenhum registro encontrado para este filtro.</p>
                    <p className="text-xs text-slate-400">Tente ajustar o período ou o termo de busca.</p>
                  </div>
                </td>
              </tr>
            ) : (
              registrosExibidos.map((item, index) => {
                const isMontada = item.tipo === 'TORRE_MONTADA';
                return (
                  <tr 
                    key={item.id} 
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-3 px-4 text-center text-slate-400 font-mono font-bold">
                      {index + 1}
                    </td>

                    <td className="py-3 px-4 text-slate-300 font-sans whitespace-nowrap">
                      {formatarDataBR(item.data_registro)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isMontada 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {isMontada ? <Boxes className="w-3 h-3" /> : <Layers2 className="w-3 h-3" />}
                        {isMontada ? 'MONTADA' : 'SEPARADA'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-white whitespace-nowrap">
                      {item.os}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {item.so}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-blue-400 whitespace-nowrap">
                      {item.of}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-300 text-sm whitespace-nowrap">
                      {formatarPeso(item.peso)}
                    </td>

                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate" title={item.observacoes}>
                      {item.observacoes || '-'}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleAbrirEdicao(item)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
                          title="Editar registro"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setRegistroParaExcluir(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                          title="Excluir registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Edição */}
      <EditRecordModal
        registro={registroEmEdicao}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={atualizarRegistro}
      />

      {/* Modal de Confirmação de Exclusão */}
      {registroParaExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Confirmar Exclusão</h3>
            </div>
            <p className="text-xs text-slate-300 mb-4">
              Deseja realmente excluir o registro da <strong className="text-white">{registroParaExcluir.os}</strong> (OF: {registroParaExcluir.of}) com peso de <strong className="text-amber-400">{formatarPeso(registroParaExcluir.peso)}</strong>?
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setRegistroParaExcluir(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarExclusao}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition shadow-lg active:scale-95"
              >
                Excluir Registro
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

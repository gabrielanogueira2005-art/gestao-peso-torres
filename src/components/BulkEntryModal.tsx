import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Check, 
  TableProperties, 
  AlertCircle 
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { TipoTorre } from '../types/production';
import { parsearValorInput } from '../utils/formatters';

interface BulkRow {
  tipo: TipoTorre;
  os: string;
  so: string;
  of: string;
  peso: string;
  data_registro: string;
  observacoes: string;
}

interface BulkEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LINHA_VAZIA: BulkRow = {
  tipo: 'TORRE_MONTADA',
  os: '',
  so: '',
  of: '',
  peso: '',
  data_registro: new Date().toISOString().slice(0, 10),
  observacoes: '',
};

export const BulkEntryModal: React.FC<BulkEntryModalProps> = ({ isOpen, onClose }) => {
  const { adicionarRegistrosEmLote } = useProduction();
  
  const [rows, setRows] = useState<BulkRow[]>([
    { ...LINHA_VAZIA },
    { ...LINHA_VAZIA },
    { ...LINHA_VAZIA },
  ]);

  if (!isOpen) return null;

  const handleRowChange = (index: number, field: keyof BulkRow, value: string) => {
    setRows(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const adicionarLinha = () => {
    setRows(prev => [...prev, { ...LINHA_VAZIA }]);
  };

  const removerLinha = (index: number) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSalvar = () => {
    const validas: Array<{
      tipo: TipoTorre;
      os: string;
      so: string;
      of: string;
      peso: number;
      data_registro: string;
      observacoes: string;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const pesoNum = parsearValorInput(r.peso);

      if (!r.os.trim() && !r.of.trim() && pesoNum === 0) {
        continue; // Ignora linhas vazias
      }

      if (!r.os.trim() || !r.of.trim() || pesoNum <= 0) {
        alert(`A linha ${i + 1} possui dados incompletos (OS, OF e Peso válido são obrigatórios).`);
        return;
      }

      validas.push({
        tipo: r.tipo,
        os: r.os.trim().toUpperCase(),
        so: r.so.trim().toUpperCase() || `SO-${r.os.replace(/\D/g, '')}`,
        of: r.of.trim().toUpperCase(),
        peso: pesoNum,
        data_registro: r.data_registro || new Date().toISOString().slice(0, 10),
        observacoes: r.observacoes.trim(),
      });
    }

    if (validas.length === 0) {
      alert('Nenhum registro preenchido para salvar.');
      return;
    }

    adicionarRegistrosEmLote(validas);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <TableProperties className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Lançamento em Modo Planilha Rápida</h3>
              <p className="text-xs text-slate-400">Preencha múltiplas ordens e grave tudo de uma só vez</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabela de Inserção Estilo Planilha */}
        <div className="flex-1 overflow-auto p-6">
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-inner">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 w-40">Tipo de Torre *</th>
                  <th className="py-2.5 px-3 w-28">OS *</th>
                  <th className="py-2.5 px-3 w-28">SO</th>
                  <th className="py-2.5 px-3 w-28">OF *</th>
                  <th className="py-2.5 px-3 w-32">Peso (kg) *</th>
                  <th className="py-2.5 px-3 w-36">Data *</th>
                  <th className="py-2.5 px-3">Observações</th>
                  <th className="py-2.5 px-2 w-12 text-center">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs font-mono">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                    
                    <td className="py-1 px-2">
                      <select
                        value={row.tipo}
                        onChange={(e) => handleRowChange(idx, 'tipo', e.target.value as TipoTorre)}
                        aria-label={`Tipo de Torre linha ${idx + 1}`}
                        className={`w-full py-1.5 px-2 rounded-md font-sans text-xs font-semibold focus:outline-none border ${
                          row.tipo === 'TORRE_MONTADA'
                            ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                            : 'bg-cyan-950/60 border-cyan-700/60 text-cyan-300'
                        }`}
                      >
                        <option value="TORRE_MONTADA">TORRE MONTADA</option>
                        <option value="TORRE_SEPARADA">TORRE SEPARADA</option>
                      </select>
                    </td>

                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={row.os}
                        onChange={(e) => handleRowChange(idx, 'os', e.target.value)}
                        placeholder="OS-0000"
                        aria-label={`OS linha ${idx + 1}`}
                        className="w-full py-1.5 px-2 bg-slate-800/80 border border-slate-700 rounded-md text-white uppercase focus:outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={row.so}
                        onChange={(e) => handleRowChange(idx, 'so', e.target.value)}
                        placeholder="SO-0000"
                        aria-label={`SO linha ${idx + 1}`}
                        className="w-full py-1.5 px-2 bg-slate-800/80 border border-slate-700 rounded-md text-white uppercase focus:outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={row.of}
                        onChange={(e) => handleRowChange(idx, 'of', e.target.value)}
                        placeholder="OF-0000"
                        aria-label={`OF linha ${idx + 1}`}
                        className="w-full py-1.5 px-2 bg-slate-800/80 border border-slate-700 rounded-md text-white uppercase focus:outline-none focus:border-blue-500"
                      />
                    </td>

                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={row.peso}
                        onChange={(e) => handleRowChange(idx, 'peso', e.target.value)}
                        placeholder="4500,00"
                        aria-label={`Peso linha ${idx + 1}`}
                        className="w-full py-1.5 px-2 bg-slate-800/80 border border-slate-700 rounded-md text-amber-300 font-bold focus:outline-none focus:border-amber-500 text-right"
                      />
                    </td>

                    <td className="py-1 px-2 font-sans">
                      <input
                        type="date"
                        value={row.data_registro}
                        onChange={(e) => handleRowChange(idx, 'data_registro', e.target.value)}
                        aria-label={`Data linha ${idx + 1}`}
                        className="w-full py-1.5 px-2 bg-slate-800/80 border border-slate-700 rounded-md text-white focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </td>

                    <td className="py-1 px-2 font-sans">
                      <input
                        type="text"
                        value={row.observacoes}
                        onChange={(e) => handleRowChange(idx, 'observacoes', e.target.value)}
                        placeholder="Observação opcional..."
                        aria-label={`Observações linha ${idx + 1}`}
                        className="w-full py-1.5 px-2 bg-slate-800/80 border border-slate-700 rounded-md text-slate-300 focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </td>

                    <td className="py-1 px-2 text-center">
                      <button
                        onClick={() => removerLinha(idx)}
                        disabled={rows.length === 1}
                        className="p-1.5 text-slate-500 hover:text-rose-400 disabled:opacity-30 transition rounded"
                        title="Remover linha"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={adicionarLinha}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Adicionar Mais Linhas</span>
            </button>

            <span className="text-xs text-slate-400">
              Total de linhas prontas: <strong className="text-white">{rows.length}</strong>
            </span>
          </div>
        </div>

        {/* Rodapé de Ações */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Cancelar
          </button>

          <button
            onClick={handleSalvar}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-950/40 active:scale-95 transition"
          >
            <Check className="w-4 h-4" />
            <span>Salvar Todos os Registros</span>
          </button>
        </div>

      </div>
    </div>
  );
};

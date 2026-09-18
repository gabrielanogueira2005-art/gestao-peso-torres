import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Boxes,
  Layers2,
  Trash2,
  Check
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { excelService, LinhaImportadaExcel } from '../services/excelService';
import { TipoTorre } from '../types/production';
import { formatarPeso, formatarDataBR } from '../utils/formatters';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({ isOpen, onClose }) => {
  const { adicionarRegistrosEmLote } = useProduction();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [arquivoNome, setArquivoNome] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [linhas, setLinhas] = useState<LinhaImportadaExcel[]>([]);
  const [tipoPadrao, setTipoPadrao] = useState<TipoTorre>('TORRE_MONTADA');
  const [dataPadrao, setDataPadrao] = useState(() => new Date().toISOString().slice(0, 10));
  const [erroGeral, setErroGeral] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCarregando(true);
      setErroGeral(null);
      setArquivoNome(file.name);

      const resultado = await excelService.processarArquivoExcel(file, tipoPadrao, dataPadrao);
      if (resultado.length === 0) {
        setErroGeral('Nenhuma linha de dados válida encontrada no arquivo.');
      }
      setLinhas(resultado);
    } catch (err: any) {
      setErroGeral(err.message || 'Erro ao processar planilha.');
      setLinhas([]);
    } finally {
      setCarregando(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoverLinha = (index: number) => {
    setLinhas(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleAlternarTipoLinha = (index: number) => {
    setLinhas(prev => {
      const copy = [...prev];
      copy[index].tipo = copy[index].tipo === 'TORRE_MONTADA' ? 'TORRE_SEPARADA' : 'TORRE_MONTADA';
      return copy;
    });
  };

  const linhasValidas = linhas.filter(l => l.valido);
  const pesoTotalValido = linhasValidas.reduce((acc, l) => acc + l.peso, 0);

  const handleConfirmarImportacao = () => {
    if (linhasValidas.length === 0) {
      alert('Não há registros válidos para importar.');
      return;
    }

    const novos = linhasValidas.map(l => ({
      tipo: l.tipo,
      os: l.os,
      so: l.so,
      of: l.of,
      peso: l.peso,
      data_registro: l.data_registro,
      observacoes: l.observacoes || '',
    }));

    adicionarRegistrosEmLote(novos);
    onClose();
    setLinhas([]);
    setArquivoNome(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Importar Planilha Excel (.xlsx, .xls, .csv)
              </h3>
              <p className="text-xs text-slate-400">
                Lê automaticamente as colunas <strong className="text-slate-200">OS</strong>, <strong className="text-slate-200">SO</strong>, <strong className="text-slate-200">OF</strong> e <strong className="text-slate-200">PESO</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Configurações e Upload */}
        <div className="flex-1 overflow-auto p-6 space-y-5">
          
          {/* Configuração de Padrões */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Tipo Padrão (se não especificado):
                </span>
                <div className="inline-flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setTipoPadrao('TORRE_MONTADA')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition ${
                      tipoPadrao === 'TORRE_MONTADA' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Boxes className="w-3.5 h-3.5" />
                    Montada
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoPadrao('TORRE_SEPARADA')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition ${
                      tipoPadrao === 'TORRE_SEPARADA' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Layers2 className="w-3.5 h-3.5" />
                    Separada
                  </button>
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Data Padrão:
                </span>
                <input
                  type="date"
                  value={dataPadrao}
                  onChange={(e) => setDataPadrao(e.target.value)}
                  className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Botão de Selecionar Arquivo */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={carregando}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg active:scale-95 transition"
              >
                <Upload className="w-4 h-4" />
                <span>{arquivoNome ? 'Trocar Planilha' : 'Selecionar Arquivo'}</span>
              </button>
            </div>
          </div>

          {/* Alerta de Erro */}
          {erroGeral && (
            <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{erroGeral}</span>
            </div>
          )}

          {/* Tabela de Pré-visualização dos Dados */}
          {linhas.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">Pré-visualização:</span>
                  <span className="text-emerald-400 font-bold">{linhasValidas.length} válidas</span>
                  {linhas.length - linhasValidas.length > 0 && (
                    <span className="text-rose-400">({linhas.length - linhasValidas.length} inválidas)</span>
                  )}
                </div>
                <div className="text-slate-400">
                  Peso total a importar: <strong className="text-amber-400 font-mono">{formatarPeso(pesoTotalValido)}</strong>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800 sticky top-0">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Tipo (Clique p/ alternar)</th>
                      <th className="py-2.5 px-3 font-mono">OS</th>
                      <th className="py-2.5 px-3 font-mono">SO</th>
                      <th className="py-2.5 px-3 font-mono">OF</th>
                      <th className="py-2.5 px-3 text-right">Peso (kg)</th>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Observações</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-xs">
                    {linhas.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={row.valido ? 'hover:bg-slate-800/40' : 'bg-rose-950/20 text-slate-400'}
                      >
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {row.valido ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Válido
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-rose-400 font-semibold" title={row.erro}>
                              <AlertCircle className="w-3.5 h-3.5" /> {row.erro}
                            </span>
                          )}
                        </td>

                        <td className="py-2 px-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleAlternarTipoLinha(idx)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold border transition ${
                              row.tipo === 'TORRE_MONTADA'
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            }`}
                          >
                            {row.tipo === 'TORRE_MONTADA' ? 'MONTADA' : 'SEPARADA'}
                          </button>
                        </td>

                        <td className="py-2 px-3 font-mono font-bold text-white">{row.os || '-'}</td>
                        <td className="py-2 px-3 font-mono text-slate-300">{row.so || '-'}</td>
                        <td className="py-2 px-3 font-mono font-semibold text-blue-400">{row.of || '-'}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-300">{formatarPeso(row.peso)}</td>
                        <td className="py-2 px-3 font-sans">{formatarDataBR(row.data_registro)}</td>
                        <td className="py-2 px-3 text-slate-400 max-w-xs truncate">{row.observacoes || '-'}</td>
                        <td className="py-2 px-2 text-center">
                          <button
                            onClick={() => handleRemoverLinha(idx)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded"
                            title="Remover linha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-10 text-center cursor-pointer bg-slate-950/40 transition-colors flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Clique para selecionar ou arraste sua planilha</h4>
                <p className="text-xs text-slate-400 mt-1">Suporta arquivos .xlsx, .xls e .csv com colunas OS, SO, OF e PESO</p>
              </div>
            </div>
          )}

        </div>

        {/* Rodapé de Confirmação */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950/70">
          <span className="text-xs text-slate-400">
            {arquivoNome && (
              <>Arquivo: <strong className="text-slate-200">{arquivoNome}</strong></>
            )}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={linhasValidas.length === 0}
              onClick={handleConfirmarImportacao}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg active:scale-95 disabled:opacity-40 transition"
            >
              <Check className="w-4 h-4" />
              <span>Inserir {linhasValidas.length} Registros</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

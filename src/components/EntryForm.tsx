import React, { useState, useRef } from 'react';
import { 
  PlusCircle, 
  Boxes, 
  Layers2, 
  Check, 
  Calendar, 
  Scale, 
  FileSpreadsheet,
  Upload,
  Sparkles
} from 'lucide-react';
import { useProduction } from '../context/ProductionContext';
import { TipoTorre } from '../types/production';
import { parsearValorInput, obterMesAnoAtual } from '../utils/formatters';
import { excelService } from '../services/excelService';

interface EntryFormProps {
  onOpenExcelModal?: () => void;
}

export const EntryForm: React.FC<EntryFormProps> = ({ onOpenExcelModal }) => {
  const { adicionarRegistro, adicionarRegistrosEmLote } = useProduction();
  const directFileInputRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState<TipoTorre>('TORRE_MONTADA');
  const [os, setOs] = useState('');
  const [so, setSo] = useState('');
  const [ofNum, setOfNum] = useState('');
  const [peso, setPeso] = useState('');
  // Mês e ano selecionados (ex: 'YYYY-MM')
  const [mesAnoRegistro, setMesAnoRegistro] = useState(() => obterMesAnoAtual());
  const [observacoes, setObservacoes] = useState('');
  const [sucessoMsg, setSucessoMsg] = useState<string | null>(null);
  const [carregandoExcel, setCarregandoExcel] = useState(false);

  // Upload direto de Excel (.xlsx, .xls, .csv) inserindo diretamente no estado
  const handleDirectExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCarregandoExcel(true);
      const dataPadrao = `${mesAnoRegistro}-01`;
      const resultado = await excelService.processarArquivoExcel(file, tipo, dataPadrao);
      
      const linhasValidas = resultado.filter(l => l.valido);

      if (linhasValidas.length === 0) {
        alert('Nenhum registro válido com OS, OF e PESO foi encontrado no arquivo.');
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
      setSucessoMsg(`${linhasValidas.length} registros importados com sucesso do Excel!`);
      setTimeout(() => setSucessoMsg(null), 3500);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar o arquivo Excel.');
    } finally {
      setCarregandoExcel(false);
      if (directFileInputRef.current) directFileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pesoNumerico = parsearValorInput(peso);

    if (!os.trim()) {
      alert('Por favor, informe o número da OS.');
      return;
    }
    if (!ofNum.trim()) {
      alert('Por favor, informe a OF (Ordem de Fabricação).');
      return;
    }
    if (pesoNumerico <= 0) {
      alert('Informe um peso válido maior que zero (kg).');
      return;
    }

    // Define a data como o primeiro dia do mês selecionado: AAAA-MM-01
    const dataPrimeiroDia = `${mesAnoRegistro}-01`;

    adicionarRegistro({
      tipo,
      os: os.trim().toUpperCase(),
      so: so.trim().toUpperCase() || `SO-${os.replace(/\D/g, '')}`,
      of: ofNum.trim().toUpperCase(),
      peso: pesoNumerico,
      data_registro: dataPrimeiroDia,
      observacoes: observacoes.trim(),
    });

    // Feedback e Reset dos campos principais
    setSucessoMsg('Registro gravado com sucesso!');
    setTimeout(() => setSucessoMsg(null), 2500);

    setOs('');
    setSo('');
    setOfNum('');
    setPeso('');
    setObservacoes('');
  };


  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg mb-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-400" />
            Lançamento Rápido de Produção
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre um novo registro de peso de torre montada ou separada
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Upload Direto de Excel (.xlsx, .xls, .csv) */}
          <input
            type="file"
            ref={directFileInputRef}
            accept=".xlsx,.xls,.csv"
            onChange={handleDirectExcelUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={carregandoExcel}
            onClick={() => directFileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-emerald-950/30 active:scale-95 disabled:opacity-50"
            title="Importar e salvar registros de arquivo Excel automaticamente"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{carregandoExcel ? 'Importando Planilha...' : 'Upload Excel (.xlsx, .csv)'}</span>
          </button>

          {onOpenExcelModal && (
            <button
              type="button"
              onClick={onOpenExcelModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition shadow-sm active:scale-95"
              title="Abrir pré-visualização detalhada da planilha"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pré-visualizar Planilha</span>
            </button>
          )}

          {/* Notificação de Sucesso */}
          {sucessoMsg && (
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
              <Check className="w-3.5 h-3.5" />
              {sucessoMsg}
            </div>
          )}
        </div>

      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seletor de Tipo de Torre com Abas Visuais */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Tipo de Estrutura:
          </label>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              type="button"
              onClick={() => setTipo('TORRE_MONTADA')}
              className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg font-bold text-xs transition-all border ${
                tipo === 'TORRE_MONTADA'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-500/40'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Boxes className="w-4 h-4" />
              TORRE MONTADA
            </button>

            <button
              type="button"
              onClick={() => setTipo('TORRE_SEPARADA')}
              className={`flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-lg font-bold text-xs transition-all border ${
                tipo === 'TORRE_SEPARADA'
                  ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-950/40 ring-2 ring-cyan-500/40'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Layers2 className="w-4 h-4" />
              TORRE SEPARADA
            </button>
          </div>
        </div>

        {/* Linha de Campos Principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          {/* OS */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
              Ordem de Serviço (OS) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={os}
                onChange={(e) => setOs(e.target.value)}
                placeholder="Ex: OS-9300"
                className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
              />
            </div>
          </div>

          {/* SO */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
              Sales Order (SO)
            </label>
            <input
              type="text"
              value={so}
              onChange={(e) => setSo(e.target.value)}
              placeholder="Ex: SO-4500"
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
            />
          </div>

          {/* OF */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
              Ordem Fabricação (OF) *
            </label>
            <input
              type="text"
              required
              value={ofNum}
              onChange={(e) => setOfNum(e.target.value)}
              placeholder="Ex: OF-1150"
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm font-mono text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
            />
          </div>

          {/* PESO (KG) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-amber-400" />
              <span>Peso em KG *</span>
            </label>
            <input
              type="text"
              required
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              placeholder="Ex: 4850,50"
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm font-mono font-bold text-amber-300 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* DATA (MÊS E ANO COM type="month") */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>Mês de Registro *</span>
            </label>
            <input
              type="month"
              required
              value={mesAnoRegistro}
              onChange={(e) => setMesAnoRegistro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/90 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

        </div>


        {/* Linha de Observações & Botão Gravar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div className="flex-1">
            <input
              type="text"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações complementares (ex: torre autoportante 42m, linha pesada, galvanização especial...)"
              className="w-full px-3 py-2 bg-slate-800/70 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-blue-900/30 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Gravar Registro</span>
          </button>
        </div>
      </form>
    </div>
  );
};

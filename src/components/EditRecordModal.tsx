import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Boxes, Layers2, Scale, Calendar } from 'lucide-react';
import { RegistroProducao, TipoTorre } from '../types/production';
import { parsearValorInput } from '../utils/formatters';

interface EditRecordModalProps {
  registro: RegistroProducao | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, dados: Partial<RegistroProducao>) => void;
}

export const EditRecordModal: React.FC<EditRecordModalProps> = ({
  registro,
  isOpen,
  onClose,
  onSave,
}) => {
  const [tipo, setTipo] = useState<TipoTorre>('TORRE_MONTADA');
  const [os, setOs] = useState('');
  const [so, setSo] = useState('');
  const [ofNum, setOfNum] = useState('');
  const [peso, setPeso] = useState('');
  const [dataRegistro, setDataRegistro] = useState('');
  const [observacoes, setObservacoes] = useState('');

  useEffect(() => {
    if (registro) {
      setTipo(registro.tipo);
      setOs(registro.os);
      setSo(registro.so);
      setOfNum(registro.of);
      setPeso(String(registro.peso).replace('.', ','));
      setDataRegistro(registro.data_registro);
      setObservacoes(registro.observacoes || '');
    }
  }, [registro]);

  if (!isOpen || !registro) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pesoNum = parsearValorInput(peso);

    if (!os.trim() || !ofNum.trim() || pesoNum <= 0) {
      alert('Preencha os campos obrigatórios com valores válidos.');
      return;
    }

    onSave(registro.id, {
      tipo,
      os: os.trim().toUpperCase(),
      so: so.trim().toUpperCase(),
      of: ofNum.trim().toUpperCase(),
      peso: pesoNum,
      data_registro: dataRegistro,
      observacoes: observacoes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Editar Registro de Produção</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {registro.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Tipo de Torre */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-2">
              Tipo de Estrutura
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTipo('TORRE_MONTADA')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  tipo === 'TORRE_MONTADA'
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Boxes className="w-4 h-4" />
                Torre Montada
              </button>
              <button
                type="button"
                onClick={() => setTipo('TORRE_SEPARADA')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold border transition ${
                  tipo === 'TORRE_SEPARADA'
                    ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                <Layers2 className="w-4 h-4" />
                Torre Separada
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                OS *
              </label>
              <input
                type="text"
                required
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                SO
              </label>
              <input
                type="text"
                value={so}
                onChange={(e) => setSo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                OF *
              </label>
              <input
                type="text"
                required
                value={ofNum}
                onChange={(e) => setOfNum(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
                Peso em KG *
              </label>
              <input
                type="text"
                required
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Data de Registro *
            </label>
            <input
              type="date"
              required
              value={dataRegistro}
              onChange={(e) => setDataRegistro(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

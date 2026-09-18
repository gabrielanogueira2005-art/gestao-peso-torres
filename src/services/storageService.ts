import { RegistroProducao } from '../types/production';

const STORAGE_KEY = 'GESTAO_PESO_TORRES_DATA_V1';

export const storageService = {
  carregarRegistros(): RegistroProducao[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) {
        this.salvarRegistros([]);
        return [];
      }
      return JSON.parse(data);
    } catch (err) {
      console.error('Erro ao ler localStorage, iniciando com lista vazia:', err);
      return [];
    }
  },

  salvarRegistros(registros: RegistroProducao[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(registros));
    } catch (err) {
      console.error('Erro ao salvar no localStorage:', err);
    }
  },

  resetarParaDadosIniciais(): RegistroProducao[] {
    this.salvarRegistros([]);
    return [];
  },

  exportarBackupJSON(registros: RegistroProducao[]): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registros, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `backup_producao_torres_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }
};


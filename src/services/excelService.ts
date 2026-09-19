import * as XLSX from 'xlsx';
import { RegistroProducao, TipoTorre } from '../types/production';
import { parsearValorInput } from '../utils/formatters';

export interface LinhaImportadaExcel {
  tipo: TipoTorre;
  os: string;
  so: string;
  of: string;
  peso: number;
  data_registro: string;
  observacoes?: string;
  valido: boolean;
  erro?: string;
}

export const excelService = {
  processarArquivoExcel(
    file: File,
    tipoPadrao: TipoTorre = 'TORRE_MONTADA',
    dataPadrao: string = new Date().toISOString().slice(0, 10)
  ): Promise<LinhaImportadaExcel[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array', cellDates: true });
          
          const firstSheetName = workbook.SheetNames[0];
          if (!firstSheetName) {
            reject(new Error('A planilha está vazia ou não contém abas.'));
            return;
          }

          const worksheet = workbook.Sheets[firstSheetName];
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

          if (!rawRows || rawRows.length === 0) {
            resolve([]);
            return;
          }

          const registrosProcessados: LinhaImportadaExcel[] = rawRows.map((row) => {
            // Normalização inteligente de chaves (Case-insensitive e sem acentos/espaços)
            const getCol = (...possibilidades: string[]): string => {
              for (const key of Object.keys(row)) {
                const normKey = key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                for (const pos of possibilidades) {
                  const normPos = pos.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                  if (normKey === normPos || normKey.includes(normPos)) {
                    return String(row[key] || '').trim();
                  }
                }
              }
              return '';
            };

            const osVal = getCol('os', 'ordem de servico', 'ordem de serviço', 'ordem servico');
            const soVal = getCol('so', 'sales order', 'ordem de venda', 'pedido');
            const ofVal = getCol('of', 'ordem de fabricacao', 'ordem de fabricação', 'ordem fabricacao');
            const pesoRaw = getCol('peso', 'peso (kg)', 'peso kg', 'peso_kg', 'peso liquido', 'peso bruto', 'weight');
            const dataVal = getCol('data', 'data_registro', 'data registro', 'date');
            const obsVal = getCol('obs', 'observacao', 'observação', 'observacoes', 'observações', 'notas');
            const tipoVal = getCol('tipo', 'tipo de torre', 'estrutura', 'tipo torre');

            // Conversão explícita de peso com suporte robusto ao formato brasileiro (ex: '97,1844' -> 97.1844, '1950,435' -> 1950.435)
            const pesoNum = parsearValorInput(pesoRaw);

            // Determina tipo
            let tipoFinal: TipoTorre = tipoPadrao;

            const tipoLower = tipoVal.toLowerCase();
            if (tipoLower.includes('separad') || tipoLower.includes('separar')) {
              tipoFinal = 'TORRE_SEPARADA';
            } else if (tipoLower.includes('montad')) {
              tipoFinal = 'TORRE_MONTADA';
            }

            // Determina data válida (formato YYYY-MM-DD)
            let dataFinal = dataPadrao;
            if (dataVal) {
              // Tenta converter se for DD/MM/YYYY
              if (dataVal.includes('/')) {
                const partes = dataVal.split('/');
                if (partes.length === 3) {
                  const d = partes[0].padStart(2, '0');
                  const m = partes[1].padStart(2, '0');
                  const a = partes[2].length === 2 ? `20${partes[2]}` : partes[2];
                  dataFinal = `${a}-${m}-${d}`;
                }
              } else if (dataVal.includes('-') && dataVal.length >= 10) {
                dataFinal = dataVal.slice(0, 10);
              }
            }

            const osFinal = osVal.toUpperCase();
            const soFinal = soVal.toUpperCase() || (osFinal ? `SO-${osFinal.replace(/\D/g, '')}` : '');
            const ofFinal = ofVal.toUpperCase();

            // Validação da linha
            let valido = true;
            let erro = '';

            if (!osFinal && !ofFinal && pesoNum <= 0) {
              valido = false;
              erro = 'Linha vazia ou sem campos obrigatórios';
            } else if (!osFinal) {
              valido = false;
              erro = 'Coluna OS ausente';
            } else if (!ofFinal) {
              valido = false;
              erro = 'Coluna OF ausente';
            } else if (pesoNum <= 0) {
              valido = false;
              erro = 'Peso inválido ou zerado';
            }

            return {
              tipo: tipoFinal,
              os: osFinal,
              so: soFinal,
              of: ofFinal,
              peso: pesoNum,
              data_registro: dataFinal,
              observacoes: obsVal || '',
              valido,
              erro
            };
          });

          // Filtrar linhas completamente vazias
          const linhasRelevantes = registrosProcessados.filter(
            r => r.os || r.of || r.peso > 0 || r.valido
          );

          resolve(linhasRelevantes);
        } catch (err: any) {
          reject(new Error(err.message || 'Falha ao processar o arquivo Excel.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Erro ao ler arquivo do disco.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }
};

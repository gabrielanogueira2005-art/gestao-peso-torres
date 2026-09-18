export const formatarPeso = (peso: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(peso) + ' kg';
};

export const formatarToneladas = (peso: number): string => {
  const toneladas = peso / 1000;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(toneladas) + ' t';
};

export const formatarDataBR = (dataIso: string): string => {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }
  return dataIso;
};

export const formatarMesAno = (mesAnoIso: string): string => {
  if (!mesAnoIso || mesAnoIso === 'TODOS') return 'Todos os Períodos';
  const [ano, mes] = mesAnoIso.split('-');
  const nomesMeses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const indiceMes = parseInt(mes, 10) - 1;
  return `${nomesMeses[indiceMes] || mes}/${ano}`;
};

export const obterMesAnoAtual = (): string => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  return `${ano}-${mes}`;
};

export const parsearValorInput = (valor: string | number): number => {
  if (typeof valor === 'number') return valor;
  if (!valor) return 0;
  const limpo = valor.replace(/\./g, '').replace(',', '.').replace(/[^0-9.]/g, '');
  const num = parseFloat(limpo);
  return isNaN(num) ? 0 : num;
};

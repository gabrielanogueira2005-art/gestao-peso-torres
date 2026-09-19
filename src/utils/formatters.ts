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
  if (typeof valor === 'number') {
    return isNaN(valor) ? 0 : valor;
  }
  if (!valor) return 0;

  let str = String(valor).trim();
  if (!str) return 0;

  // Se houver vírgula e ponto:
  // Exemplo: '1.950,435' -> remove ponto de milhar e troca vírgula por ponto -> '1950.435'
  // Exemplo: '1,950.435' -> remove vírgula de milhar -> '1950.435'
  if (str.includes(',') && str.includes('.')) {
    const ultimoPonto = str.lastIndexOf('.');
    const ultimaVirgula = str.lastIndexOf(',');
    if (ultimaVirgula > ultimoPonto) {
      // Padrão brasileiro: 1.250,50
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // Padrão americano: 1,250.50
      str = str.replace(/,/g, '');
    }
  } else if (str.includes(',')) {
    // Caso venha apenas com vírgula (ex: '97,1844' ou '1950,435') -> substitui vírgula por ponto
    str = str.replace(',', '.');
  }

  // Remove quaisquer outros caracteres não numéricos exceto dígito e ponto
  str = str.replace(/[^0-9.-]/g, '');

  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
};


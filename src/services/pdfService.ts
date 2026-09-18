import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { RegistroProducao, MetricasResumo, HistoricoMensal } from '../types/production';
import { formatarPeso, formatarToneladas, formatarDataBR, formatarMesAno } from '../utils/formatters';

interface ExportarPdfMensalParams {
  mesAno: string;
  registros: RegistroProducao[];
  metricas: MetricasResumo;
  chartDataUrl?: string;
  nomeEmpresa?: string;
}

interface ExportarPdfConsolidadoParams {
  historico: HistoricoMensal[];
  metricasGerais: MetricasResumo;
  chartDataUrl?: string;
  nomeEmpresa?: string;
}

export const pdfService = {
  // 1. Exportar PDF do Mês Selecionado
  exportarPdfMensal({
    mesAno,
    registros,
    metricas,
    chartDataUrl,
    nomeEmpresa = 'INDÚSTRIA METALÚRGICA DE ESTRUTURAS & TORRES S.A.'
  }: ExportarPdfMensalParams): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const corPrimaria: [number, number, number] = [15, 23, 42]; // Slate 900
    const corDestaque: [number, number, number] = [37, 99, 235]; // Blue 600
    const corCinza: [number, number, number] = [100, 116, 139]; // Slate 500

    // 1. Cabeçalho Corporativo
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(nomeEmpresa, 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text('SISTEMA DE CONTROLE DE PRODUÇÃO E GESTÃO DE PESO DE TORRES', 14, 16);

    const dataEmissao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(7.5);
    doc.text(`Emissão: ${dataEmissao}`, 196, 16, { align: 'right' });

    // 2. Título do Relatório
    doc.setTextColor(...corPrimaria);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`RELATÓRIO MENSAL DE PRODUÇÃO - ${formatarMesAno(mesAno).toUpperCase()}`, 14, 33);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 36, 196, 36);

    // 3. Quadro de Resumo dos Indicadores (KPIs)
    const larguraCard = 42;
    const alturaCard = 18;
    const yCards = 40;

    const cardsData = [
      { label: 'PESO MONTADA', valor: formatarPeso(metricas.pesoTotalMontada), sub: `${metricas.ordensMontadas} ordens`, cor: [16, 185, 129] as [number, number, number] },
      { label: 'PESO SEPARADA', valor: formatarPeso(metricas.pesoTotalSeparada), sub: `${metricas.ordensSeparadas} ordens`, cor: [6, 182, 212] as [number, number, number] },
      { label: 'TOTAL GERAL', valor: formatarToneladas(metricas.pesoTotalGeral), sub: formatarPeso(metricas.pesoTotalGeral), cor: [37, 99, 235] as [number, number, number] },
      { label: 'TOTAL ORDENS', valor: `${metricas.totalOrdens}`, sub: `Média: ${formatarPeso(metricas.pesoMedioOrdem)}`, cor: [245, 158, 11] as [number, number, number] }
    ];

    cardsData.forEach((c, idx) => {
      const x = 14 + (idx * (larguraCard + 4));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, yCards, larguraCard, alturaCard, 2, 2, 'FD');

      // Barra colorida no topo do card
      doc.setFillColor(...c.cor);
      doc.rect(x, yCards, larguraCard, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...corCinza);
      doc.text(c.label, x + 3, yCards + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...corPrimaria);
      doc.text(c.valor, x + 3, yCards + 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...corCinza);
      doc.text(c.sub, x + 3, yCards + 15.5);
    });

    let currentY = 63;

    // 4. Se houver imagem do gráfico capturada, insere aqui
    if (chartDataUrl) {
      try {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...corPrimaria);
        doc.text('VISÃO GRÁFICA DO PERÍODO', 14, currentY);
        currentY += 2;
        doc.addImage(chartDataUrl, 'PNG', 14, currentY, 182, 55);
        currentY += 60;
      } catch (err) {
        console.error('Erro ao anexar gráfico no PDF:', err);
      }
    }

    // 5. Tabela Detalhada de Ordens de Produção
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...corPrimaria);
    doc.text('DETALHAMENTO DAS ORDENS DE FABRICAÇÃO E MONTAGEM', 14, currentY);
    currentY += 3;

    const rows = registros.map((r, index) => [
      index + 1,
      r.data_registro ? formatarDataBR(r.data_registro) : '-',
      r.tipo === 'TORRE_MONTADA' ? 'MONTADA' : 'SEPARADA',
      r.os,
      r.so,
      r.of,
      formatarPeso(r.peso),
      r.observacoes || '-'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'DATA', 'TIPO DE TORRE', 'OS', 'SO', 'OF', 'PESO (KG)', 'OBSERVAÇÕES']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'center',
      },
      styles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        1: { halign: 'center', cellWidth: 18 },
        2: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 18 },
        6: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
        7: { cellWidth: 'auto' },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          if (data.cell.raw === 'MONTADA') {
            data.cell.styles.textColor = [16, 185, 129]; // Verde
          } else {
            data.cell.styles.textColor = [6, 182, 212]; // Azul ciano
          }
        }
      },
      margin: { left: 14, right: 14, bottom: 20 },
      didDrawPage: (data) => {
        // Rodapé da página
        const str = `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(str, 196, 290, { align: 'right' });
        doc.text('Relatório Gerencial de Produção Industrial - Documento Confidencial', 14, 290);
      }
    });

    doc.save(`relatorio_producao_${mesAno}.pdf`);
  },

  // 2. Exportar PDF Consolidado (Histórico Completo)
  exportarPdfConsolidado({
    historico,
    metricasGerais,
    chartDataUrl,
    nomeEmpresa = 'INDÚSTRIA METALÚRGICA DE ESTRUTURAS & TORRES S.A.'
  }: ExportarPdfConsolidadoParams): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const corPrimaria: [number, number, number] = [15, 23, 42]; // Slate 900
    const corCinza: [number, number, number] = [100, 116, 139]; // Slate 500

    // 1. Cabeçalho Corporativo
    doc.setFillColor(...corPrimaria);
    doc.rect(0, 0, 210, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(nomeEmpresa, 14, 10);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(203, 213, 225);
    doc.text('RELATÓRIO EXECUTIVO CONSOLIDADO - HISTÓRICO ACUMULADO DE PRODUÇÃO', 14, 16);

    const dataEmissao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(7.5);
    doc.text(`Emissão: ${dataEmissao}`, 196, 16, { align: 'right' });

    // 2. Título
    doc.setTextColor(...corPrimaria);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('BALANÇO GERAL DE PESO DE TORRES (MONTADA vs. SEPARADA)', 14, 33);

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, 36, 196, 36);

    // 3. Quadro de Resumo Geral
    const larguraCard = 42;
    const alturaCard = 18;
    const yCards = 40;

    const cardsData = [
      { label: 'PESO TOTAL MONTADA', valor: formatarToneladas(metricasGerais.pesoTotalMontada), sub: formatarPeso(metricasGerais.pesoTotalMontada), cor: [16, 185, 129] as [number, number, number] },
      { label: 'PESO TOTAL SEPARADA', valor: formatarToneladas(metricasGerais.pesoTotalSeparada), sub: formatarPeso(metricasGerais.pesoTotalSeparada), cor: [6, 182, 212] as [number, number, number] },
      { label: 'ACUMULADO GERAL', valor: formatarToneladas(metricasGerais.pesoTotalGeral), sub: `${metricasGerais.totalOrdens} Ordens Produzidas`, cor: [37, 99, 235] as [number, number, number] },
      { label: 'PESO MÉDIO / ORDEM', valor: formatarPeso(metricasGerais.pesoMedioOrdem), sub: `Média de Produção`, cor: [245, 158, 11] as [number, number, number] }
    ];

    cardsData.forEach((c, idx) => {
      const x = 14 + (idx * (larguraCard + 4));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, yCards, larguraCard, alturaCard, 2, 2, 'FD');

      doc.setFillColor(...c.cor);
      doc.rect(x, yCards, larguraCard, 1.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.setTextColor(...corCinza);
      doc.text(c.label, x + 3, yCards + 5.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...corPrimaria);
      doc.text(c.valor, x + 3, yCards + 11.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...corCinza);
      doc.text(c.sub, x + 3, yCards + 15.5);
    });

    let currentY = 63;

    // 4. Gráfico consolidado
    if (chartDataUrl) {
      try {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...corPrimaria);
        doc.text('COMPARATIVO HISTÓRICO MÊS A MÊS', 14, currentY);
        currentY += 2;
        doc.addImage(chartDataUrl, 'PNG', 14, currentY, 182, 60);
        currentY += 65;
      } catch (err) {
        console.error('Erro ao anexar gráfico consolidado:', err);
      }
    }

    // 5. Tabela de Comparativo Mensal Consolidado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...corPrimaria);
    doc.text('TABELA CONSOLIDADA DE PESO POR MÊS', 14, currentY);
    currentY += 3;

    const rows = historico.map((h, idx) => [
      idx + 1,
      formatarMesAno(h.mesAno),
      `${h.qtdOrdens} ordens`,
      formatarPeso(h.pesoMontada),
      formatarPeso(h.pesoSeparada),
      formatarPeso(h.pesoTotal),
      formatarToneladas(h.pesoTotal)
    ]);

    // Linha de Totalizador
    rows.push([
      'TOTAL',
      'ACUMULADO GERAL',
      `${metricasGerais.totalOrdens} ordens`,
      formatarPeso(metricasGerais.pesoTotalMontada),
      formatarPeso(metricasGerais.pesoTotalSeparada),
      formatarPeso(metricasGerais.pesoTotalGeral),
      formatarToneladas(metricasGerais.pesoTotalGeral)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['#', 'MÊS / ANO', 'QTD ORDENS', 'PESO MONTADA (KG)', 'PESO SEPARADA (KG)', 'TOTAL (KG)', 'TOTAL (TON)']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
        halign: 'center',
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { fontStyle: 'bold', cellWidth: 35 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'right', cellWidth: 30 },
        4: { halign: 'right', cellWidth: 30 },
        5: { halign: 'right', cellWidth: 30, fontStyle: 'bold' },
        6: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      },
      didParseCell: (data) => {
        // Estilizar linha de Total
        if (data.section === 'body' && data.row.index === rows.length - 1) {
          data.cell.styles.fillColor = [241, 245, 249];
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.textColor = [15, 23, 42];
        }
      },
      margin: { left: 14, right: 14, bottom: 20 },
      didDrawPage: (data) => {
        const str = `Página ${data.pageNumber} de ${doc.getNumberOfPages()}`;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(148, 163, 184);
        doc.text(str, 196, 290, { align: 'right' });
        doc.text('Relatório Consolidado de Engenharia e Produção - Torre Montada vs. Separada', 14, 290);
      }
    });

    doc.save(`relatorio_consolidado_producao_${new Date().toISOString().slice(0, 10)}.pdf`);
  }
};

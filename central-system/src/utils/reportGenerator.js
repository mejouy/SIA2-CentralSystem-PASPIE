import { jsPDF } from 'jspdf';

function fitText(doc, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  let curY = y;
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = doc.getTextWidth(testLine);
    if (metrics > maxWidth && n > 0) {
      doc.text(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) doc.text(line.trim(), x, curY);
  return curY;
}

export function generateIntegrationPDF(data, options = {}) {
  const generatedBy = options.generatedBy || 'Administrator';
  const reportId = options.reportId || `R-${Date.now()}`;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 48;

  // Header block
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 72, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Smart City Systems Integration Control Register', margin, 34);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report ID: ${reportId} • Generated: ${new Date(data.generatedAt || Date.now()).toLocaleString()} • By: ${generatedBy}`, margin, 52);

  y = 100;

  // Executive summary KPIs
  doc.setTextColor(25, 118, 210);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Executive Summary & Core Infrastructure Health', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const metrics = data.metrics || {};
  const totalSyncs = metrics.totalLogs ?? 0;
  const success = metrics.successfulLogs ?? 0;
  const failed = metrics.failedLogs ?? 0;
  const reliability = metrics.reliabilityRate ?? (totalSyncs ? `${Math.round((success / totalSyncs) * 100)}%` : 'N/A');

  doc.text(`- Global Sync Reliability Rate: ${reliability}`, margin, y);
  y += 14;
  doc.text(`- System Ingestion Volume: ${totalSyncs}`, margin, y);
  y += 14;
  const onlineCount = (data.systems || []).filter(s => s.isOnline).length;
  const totalNodes = (data.systems || []).length;
  doc.text(`- Node Breakdown Status: ${onlineCount} online / ${totalNodes} total`, margin, y);
  y += 18;

  // Summary KPI boxes (visual)
  const kpiY = y;
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, kpiY, 160, 44, 'F');
  doc.rect(margin + 176, kpiY, 160, 44, 'F');
  doc.rect(margin + 352, kpiY, 160, 44, 'F');
  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Syncs`, margin + 8, kpiY + 16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(String(totalSyncs), margin + 8, kpiY + 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Reliability`, margin + 176 + 8, kpiY + 16);
  doc.setFontSize(14);
  doc.text(String(reliability), margin + 176 + 8, kpiY + 36);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`Active Nodes`, margin + 352 + 8, kpiY + 16);
  doc.setFontSize(14);
  doc.text(`${onlineCount}/${totalNodes}`, margin + 352 + 8, kpiY + 36);

  y = kpiY + 64;

  // Main Performance Table header
  doc.setTextColor(25, 118, 210);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Cluster Subsystem Performance Breakdown', margin, y);
  y += 18;

  // Table columns
  const headers = ['Subsystem', 'Leader', 'Payload Volume', 'Errors', 'Avg Size', 'Last Heartbeat'];
  const colWidths = [140, 80, 80, 60, 60, 110];
  let x = margin;
  const rowH = 18;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y);
    x += colWidths[i];
  });
  y += 12;

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  (data.breakdown || []).forEach((row) => {
    if (y > 730) { doc.addPage(); y = 48; }
    x = margin;
    const match = (data.systems || []).find(s => s.systemName === row._id) || {};
    const owner = (match.leader) || ( (data.chosenMap && data.chosenMap[row._id]) || '' );
    doc.text((match.displayName || row._id || '').toString(), x + 2, y);
    x += colWidths[0];
    doc.text((owner || '').toString(), x + 2, y);
    x += colWidths[1];
    doc.text(String(row.totalSyncs || 0), x + 2, y);
    x += colWidths[2];
    doc.text(String(row.failures || 0), x + 2, y);
    x += colWidths[3];
    doc.text(String(row.avgPayloadSize || 'N/A'), x + 2, y);
    x += colWidths[4];
    doc.text(row.lastHeartbeat ? new Date(row.lastHeartbeat).toLocaleString() : 'N/A', x + 2, y);
    y += rowH;
  });

  // Log appendix
  if ((data.recentActivity || []).length > 0) {
    if (y > 680) { doc.addPage(); y = 48; }
    doc.setTextColor(25, 118, 210);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Log Appendix - Recent Failures & Payload Signatures', margin, y);
    y += 18;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    data.recentActivity.slice(0, 40).forEach((log) => {
      if (y > 740) { doc.addPage(); y = 48; }
      doc.setTextColor(100, 100, 100);
      doc.text(new Date(log.timestamp).toLocaleString(), margin, y);
      doc.setTextColor(51, 65, 85);
      const origin = (log.systemName || '').toString();
      doc.text(`${origin} • ${log.status}`, margin + 140, y);
      y += 10;
      const payload = JSON.stringify(log.payloadReceived || {});
      // wrap payload snippet
      fitText(doc, payload.slice(0, 600), margin + 8, y, pageWidth - margin * 2 - 8, 10);
      y += 26;
    });
  }

  const fileName = `SmartCity_IntegrationReport_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

export default generateIntegrationPDF;

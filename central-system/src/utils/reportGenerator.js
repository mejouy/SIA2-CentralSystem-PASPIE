import { jsPDF } from 'jspdf';

/**
 * Renders multiline text, wrapping cleanly inside a defined width.
 * Prevents overlapping by capturing and updating the active page cursor.
 */
function fitText(doc, text, x, y, maxWidth, lineHeight) {
  const words = String(text).split(' ');
  let line = '';
  let curY = y;
  
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = doc.getTextWidth(testLine);
    
    // Check if we need to wrap the line
    if (metrics > maxWidth && n > 0) {
      // Check for page boundary before writing
      if (curY > 750) {
        doc.addPage();
        curY = 48;
      }
      doc.text(line.trim(), x, curY);
      line = words[n] + ' ';
      curY += lineHeight;
    } else {
      line = testLine;
    }
  }
  
  if (line) {
    if (curY > 750) {
      doc.addPage();
      curY = 48;
    }
    doc.text(line.trim(), x, curY);
  }
  
  return curY;
}

export function generateIntegrationPDF(data = {}, options = {}) {
  // Safe Fallbacks
  const systems = data.systems || [];
  const breakdown = data.breakdown || [];
  const recentActivity = data.recentActivity || [];
  const metrics = data.metrics || {};
  const chosenMap = data.chosenMap || {};

  const generatedBy = options.generatedBy || 'Administrator';
  const reportId = options.reportId || `R-${Date.now()}`;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 48;

  // ==========================================
  // Header Block
  // ==========================================
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 72, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('Smart City Systems Integration Control Register', margin, 34);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const dateString = new Date(data.generatedAt || Date.now()).toLocaleString();
  doc.text(`Report ID: ${reportId} • Generated: ${dateString} • By: ${generatedBy}`, margin, 52);

  y = 110;

  // ==========================================
  // Executive Summary & KPIs
  // ==========================================
  doc.setTextColor(25, 118, 210);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Executive Summary & Core Infrastructure Health', margin, y);
  y += 18;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);

  const totalLogs = metrics.totalLogs ?? 0;
  const success = metrics.successfulLogs ?? 0;
  const failed = metrics.failedLogs ?? 0;
  const reliability = metrics.reliabilityRate ?? (totalLogs ? `${Math.round((success / totalLogs) * 100)}%` : 'N/A');
  const onlineCount = systems.filter(s => s.isOnline).length;
  const totalNodes = systems.length;

  doc.text(`- Global Sync Reliability Rate: ${reliability}`, margin, y);
  y += 14;
  doc.text(`- System Ingestion Volume: ${totalLogs}`, margin, y);
  y += 14;
  doc.text(`- Node Breakdown Status: ${onlineCount} online / ${totalNodes} total`, margin, y);
  y += 24;

  // ==========================================
  // Summary KPI Boxes
  // ==========================================
  const kpiY = y;
  doc.setFillColor(241, 245, 249);
  
  // Render cards
  doc.rect(margin, kpiY, 160, 44, 'F');
  doc.rect(margin + 176, kpiY, 160, 44, 'F');
  doc.rect(margin + 352, kpiY, 160, 44, 'F');
  
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`TOTAL SYNCS`, margin + 8, kpiY + 16);
  doc.text(`RELIABILITY`, margin + 176 + 8, kpiY + 16);
  doc.text(`ACTIVE NODES`, margin + 352 + 8, kpiY + 16);

  doc.setTextColor(17, 24, 39);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(String(totalLogs), margin + 8, kpiY + 36);
  doc.text(String(reliability), margin + 176 + 8, kpiY + 36);
  doc.text(`${onlineCount}/${totalNodes}`, margin + 352 + 8, kpiY + 36);

  y = kpiY + 68;

  // ==========================================
  // Cluster Performance Table
  // ==========================================
  doc.setTextColor(25, 118, 210);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Cluster Subsystem Performance Breakdown', margin, y);
  y += 18;

  // Table Setup
  const headers = ['Subsystem', 'Leader', 'Payloads', 'Errors', 'Avg Size', 'Last Heartbeat'];
  const colWidths = [140, 80, 70, 60, 60, 110];
  const rowH = 20;

  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');

  // Header render
  let x = margin;
  headers.forEach((h, i) => {
    doc.text(h, x + 2, y);
    x += colWidths[i];
  });
  
  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  // Row render
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  breakdown.forEach((row) => {
    if (y > 730) { 
      doc.addPage(); 
      y = 48; 
    }
    
    x = margin;
    const match = systems.find(s => s.systemName === row._id) || {};
    const owner = (match.leader) || (chosenMap[row._id] || '');
    const displayName = match.displayName || row._id || '';

    // Clip text elements to fit inside their bounds
    const cleanSubsystem = doc.splitTextToSize(String(displayName), colWidths[0] - 8)[0] || '';
    const cleanOwner = doc.splitTextToSize(String(owner), colWidths[1] - 8)[0] || '';

    doc.text(cleanSubsystem, x + 2, y);
    x += colWidths[0];
    
    doc.text(cleanOwner, x + 2, y);
    x += colWidths[1];
    
    doc.text(String(row.totalSyncs || 0), x + 2, y);
    x += colWidths[2];
    
    doc.text(String(row.failures || 0), x + 2, y);
    x += colWidths[3];
    
    doc.text(String(row.avgPayloadSize || 'N/A'), x + 2, y);
    x += colWidths[4];
    
    const heartbeatStr = row.lastHeartbeat ? new Date(row.lastHeartbeat).toLocaleString() : 'N/A';
    doc.text(heartbeatStr, x + 2, y);
    
    y += rowH;
  });

  // ==========================================
  // Log Appendix
  // ==========================================
  if (recentActivity.length > 0) {
    y += 10;
    if (y > 680) { 
      doc.addPage(); 
      y = 48; 
    }

    doc.setTextColor(25, 118, 210);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Log Appendix - Recent Failures & Payload Signatures', margin, y);
    y += 18;

    recentActivity.slice(0, 40).forEach((log) => {
      // Keep safety space for timestamp and initial details
      if (y > 730) { 
        doc.addPage(); 
        y = 48; 
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      const logTime = new Date(log.timestamp).toLocaleString();
      doc.text(logTime, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      const origin = (log.systemName || '').toString();
      doc.text(`${origin} • Status: ${log.status}`, margin + 140, y);
      
      y += 12;

      const payload = JSON.stringify(log.payloadReceived || {});
      doc.setFont('courier', 'normal'); // Use courier for raw logs
      doc.setTextColor(100, 100, 100);
      
      // fitText updates y automatically and returns the terminal position
      y = fitText(doc, payload.slice(0, 600), margin + 8, y, pageWidth - (margin * 2) - 8, 10);
      y += 18; // Spacing between logs
    });
  }

  const fileName = `SmartCity_IntegrationReport_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

export default generateIntegrationPDF;
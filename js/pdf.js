import { supabase } from '/js/supabase.js';
import { jsPDF } from 'https://esm.sh/jspdf@2.5.1';

export async function generatePdf(requestId) {
  const { data: req } = await supabase.from('requests').select('*').eq('id', requestId).single();
  const { data: items } = await supabase.from('items').select('*').eq('request_id', requestId).order('created_at');
  const { data: pk } = await supabase.from('packing').select('*').eq('request_id', requestId).maybeSingle();

  const doc = new jsPDF('p', 'mm', 'a4');
  let y = 18;

  // === Header ===
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('DOKUMEN TRANSPORT REQUEST (TR)', 105, y, { align: 'center' });
  y += 12;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Request No: ${req.request_no}`, 15, y); y += 6;
  doc.text(`Tanggal: ${req.tanggal}`, 15, y); y += 6;
  doc.text(`SURINDO PIC: ${req.surindo_pic}`, 15, y); y += 6;
  doc.text(`Factory Code: ${req.factory_code}`, 15, y); y += 6;
  doc.text(`Status: ${req.status}`, 15, y); y += 6;
  y += 3;

  // Indicate Document wrap
  doc.setFont('helvetica', 'bold');
  doc.text('Indicate Document:', 15, y); y += 5;
  doc.setFont('helvetica', 'normal');
  const indText = doc.splitTextToSize(req.indicate_document || '-', 170);
  doc.text(indText, 15, y);
  y += indText.length * 5 + 4;

  // === Tabel Barang ===
  doc.setFont('helvetica', 'bold');
  doc.text('Barang:', 15, y); y += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const colX = [15, 65, 105, 125, 145, 165];
  ['Part Name', 'Part No', 'Unit', 'Qty IN', 'Qty OUT', 'Saldo']
    .forEach((h, i) => doc.text(h, colX[i], y));
  y += 2;
  doc.line(15, y, 195, y);
  y += 5;

  for (const it of (items || [])) {
    const { data: saldo } = await supabase.rpc('get_stock', { p_part_no: it.part_no });
    const saldoAfter = (Number(saldo) || 0) + Number(it.qty_in) - Number(it.qty_out);

    doc.text(String(it.part_name).slice(0, 30), colX[0], y);
    doc.text(String(it.part_no).slice(0, 22), colX[1], y);
    doc.text(String(it.unit), colX[2], y);
    doc.text(String(it.qty_in), colX[3], y);
    doc.text(String(it.qty_out), colX[4], y);
    doc.text(String(saldoAfter), colX[5], y);
    y += 5;

    if (y > 265) {
      doc.addPage();
      y = 20;
    }
  }

  // === Packing List ===
  y += 6;
  if (pk) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Packing List:', 15, y); y += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(`Jumlah Box: ${pk.jumlah_box}`, 15, y); y += 5;
    doc.text(`Dimensi: ${pk.dimensi}`, 15, y); y += 5;
    doc.text(`Gross Weight: ${pk.gross_weight} Kg`, 15, y); y += 5;
    doc.text(`Nett Weight: ${pk.nett_weight} Kg`, 15, y); y += 8;
  }

  // Remarks
  if (req.remarks) {
    doc.setFont('helvetica', 'bold');
    doc.text('Remarks:', 15, y); y += 5;
    doc.setFont('helvetica', 'normal');
    const rm = doc.splitTextToSize(req.remarks, 170);
    doc.text(rm, 15, y);
    y += rm.length * 5 + 5;
  }

  // === Tanda tangan ===
  const signY = 255;
  doc.setFontSize(10);
  doc.text('Dibuat oleh,', 15, signY);
  doc.line(15, signY + 18, 70, signY + 18);
  doc.text(req.surindo_pic, 15, signY + 24);

  doc.text('Disetujui oleh,', 130, signY);
  doc.line(130, signY + 18, 185, signY + 18);
  doc.text(req.approved_at ? '(approved)' : '_______________', 130, signY + 24);

  doc.save(`TR_${req.request_no}.pdf`);
}

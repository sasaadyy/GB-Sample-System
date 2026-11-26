import { supabase } from '/js/supabase.js';

// ================= SESSION & STATE =================
const { data: { session } } = await supabase.auth.getSession();
if (!session) location.href = '/index.html';

const urlParams = new URLSearchParams(location.search);
let requestId = urlParams.get('id');
let requestNo = null;
let currentStatus = 'draft';
let currentPicId = null;

// ================= PROFILE =================
const { data: profile } = await supabase
  .from('profiles').select('pic_code,role')
  .eq('id', session.user.id).single();
document.getElementById('surindoPic').value = profile.pic_code;

// Supervisor/admin = read-only untuk form input (hanya approve lewat approval.html)
const isReadOnly = ['supervisor','admin'].includes(profile.role);

// ================= TAB NAV =================
document.querySelectorAll('.tabnav button').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tabnav button').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(s => s.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  };
});

function showMsg(id, text, type = '') {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = 'msg ' + type;
}

// ================= LOAD DOKUMEN HARI INI =================
const today = new Date().toISOString().slice(0,10);

if (!requestId) {
  // Cari dokumen hari ini milik PIC
  const { data: todayDoc } = await supabase
    .from('requests')
    .select('id,status')
    .eq('pic_id', session.user.id)
    .eq('tanggal', today)
    .maybeSingle();

  if (todayDoc) {
    requestId = todayDoc.id;
    history.replaceState({}, '', `?id=${requestId}`);
  }
}

// Kalau ada requestId, load semua data
if (requestId) {
  await loadRequest();
} else {
  // Dokumen baru
  document.getElementById('tanggal').value = today;
  document.getElementById('tanggal').min = today;
  document.getElementById('tanggal').max = today; // 1 PIC 1 dokumen/hari
  document.getElementById('reqBadge').innerHTML =
    '<span class="badge draft">Dokumen Baru</span>';
}

async function loadRequest() {
  const { data: req, error } = await supabase
    .from('requests').select('*').eq('id', requestId).single();
  if (error || !req) {
    showMsg('msgDokumen', '❌ Dokumen tidak ditemukan', 'error');
    return;
  }
  requestNo = req.request_no;
  currentStatus = req.status;
  currentPicId = req.pic_id;

  document.getElementById('requestNo').value = req.request_no;
  document.getElementById('tanggal').value = req.tanggal;
  document.getElementById('indicateDocument').value = req.indicate_document;
  document.getElementById('remarks').value = req.remarks || '';
  document.getElementById('surindoPic').value = req.surindo_pic;

  document.getElementById('reqBadge').innerHTML =
    `<span class="badge ${req.status}">${req.status.replace('_',' ')}</span>`;

  // Isi dropdown Indicate Document (dari yang sudah tersimpan)
  refreshDocDropdown(req.indicate_document);

  // Kunci form kalau bukan draft/rejected
  if (req.status !== 'draft' && req.status !== 'rejected') {
    lockForm();
  }
  // Read-only kalau supervisor
  if (isReadOnly) lockForm();

  await loadBarang();
  await loadPacking();
}

function refreshDocDropdown(selected) {
  const sel = document.getElementById('barangDoc');
  const current = selected || document.getElementById('indicateDocument').value;
  sel.innerHTML = '<option value="">-- Pilih --</option>' +
    (current ? `<option value="${current}" selected>${current}</option>` : '');
}

function lockForm() {
  document.querySelectorAll('#tab-dokumen input, #tab-dokumen textarea, #tab-barang input, #tab-barang select, #tab-barang button, #tab-packing input, #tab-packing button').forEach(el => {
    el.disabled = true;
  });
  document.getElementById('sendAll').disabled = true;
  document.getElementById('downloadPdf').disabled = false;
}

// ================= TAB 1: SIMPAN DOKUMEN =================
document.getElementById('saveDokumen').onclick = async () => {
  if (isReadOnly) return;
  const tanggal = document.getElementById('tanggal').value;
  const indicateDocument = document.getElementById('indicateDocument').value.trim();
  const remarks = document.getElementById('remarks').value.trim();

  if (!tanggal || !indicateDocument) {
    return showMsg('msgDokumen', '❌ Tanggal & Indicate Document wajib diisi', 'error');
  }

  showMsg('msgDokumen', 'Menyimpan...');

  try {
    if (!requestId) {
      // Generate request_no
      const year = new Date().getFullYear() % 100;
      const { data: newNo, error: seqErr } = await supabase
        .rpc('next_request_no', { p_factory: 'I', p_year: year });
      if (seqErr) throw seqErr;
      requestNo = newNo;

      const { data, error } = await supabase.from('requests').insert({
        request_no: requestNo,
        factory_code: 'I',
        tanggal,
        surindo_pic: profile.pic_code,
        pic_id: session.user.id,
        indicate_document: indicateDocument,
        remarks: remarks || null
      }).select().single();
      if (error) throw error;
      requestId = data.id;
      history.replaceState({}, '', `?id=${requestId}`);
    } else {
      const { error } = await supabase.from('requests').update({
        indicate_document: indicateDocument,
        remarks: remarks || null
      }).eq('id', requestId);
      if (error) throw error;
    }

    document.getElementById('requestNo').value = requestNo;
    document.getElementById('reqBadge').innerHTML =
      '<span class="badge draft">draft</span>';
    refreshDocDropdown(indicateDocument);
    showMsg('msgDokumen', `✅ Dokumen tersimpan: ${requestNo}`, 'success');
  } catch (err) {
    showMsg('msgDokumen', '❌ ' + err.message, 'error');
  }
};

document.getElementById('resetDokumen').onclick = () => {
  if (isReadOnly) return;
  document.getElementById('indicateDocument').value = '';
  document.getElementById('remarks').value = '';
  showMsg('msgDokumen', '');
};

// ================= TAB 2: BARANG =================
// Load master part list ke dropdown
async function loadMasterParts() {
  const { data } = await supabase.from('master_parts')
    .select('part_no,part_name,unit')
    .order('part_no');
  const sel = document.getElementById('partNumber');
  sel.innerHTML = '<option value="">-- Pilih Part Number --</option>' +
    (data || []).map(p =>
      `<option value="${p.part_no}" data-name="${p.part_name}" data-unit="${p.unit}">
        ${p.part_no} — ${p.part_name}
       </option>`).join('');
}

// Saat pilih part: isi nama, unit, saldo otomatis
document.getElementById('partNumber').onchange = async (e) => {
  const opt = e.target.selectedOptions[0];
  document.getElementById('partName').value = opt.dataset.name || '';
  document.getElementById('unit').value = opt.dataset.unit || '';

  if (!e.target.value) {
    document.getElementById('saldoStock').value = '';
    return;
  }

  // Ambil saldo dari RPC get_stock (histori approved)
  const { data: saldo } = await supabase.rpc('get_stock', { p_part_no: e.target.value });
  document.getElementById('saldoStock').value = saldo ?? 0;
};

// Validasi live Qty OUT
function validateQty() {
  const saldo = Number(document.getElementById('saldoStock').value) || 0;
  const qtyIn = Number(document.getElementById('qtyIn').value) || 0;
  const qtyOut = Number(document.getElementById('qtyOut').value) || 0;
  const max = saldo + qtyIn;
  const qtyOutEl = document.getElementById('qtyOut');

  if (qtyOut > max) {
    qtyOutEl.classList.add('input-error');
    showMsg('msgBarang', `⚠️ Qty OUT (${qtyOut}) melebihi Saldo (${saldo}) + Qty IN (${qtyIn}) = ${max}`, 'error');
    return false;
  }
  qtyOutEl.classList.remove('input-error');
  if (document.getElementById('msgBarang').textContent.startsWith('⚠️'))
    showMsg('msgBarang', '');
  return true;
}
document.getElementById('qtyIn').oninput = validateQty;
document.getElementById('qtyOut').oninput = validateQty;

document.getElementById('addBarang').onclick = async () => {
  if (isReadOnly) return;
  if (!requestId) return showMsg('msgBarang', '❌ Simpan Dokumen dulu di Tab 1', 'error');

  const partNo = document.getElementById('partNumber').value;
  const partName = document.getElementById('partName').value;
  const unit = document.getElementById('unit').value;
  const qtyIn = Number(document.getElementById('qtyIn').value);
  const qtyOut = Number(document.getElementById('qtyOut').value);
  const saldoStock = Number(document.getElementById('saldoStock').value) || 0;

  if (!partNo || !partName || !unit) {
    return showMsg('msgBarang', '❌ Part Number wajib dipilih', 'error');
  }
  if (qtyIn < 0 || qtyOut < 0) {
    return showMsg('msgBarang', '❌ Qty tidak boleh negatif', 'error');
  }
  if (qtyOut > saldoStock + qtyIn) {
    return showMsg('msgBarang', `❌ Qty OUT melebihi Saldo (${saldoStock}) + Qty IN (${qtyIn})`, 'error');
  }

  showMsg('msgBarang', 'Menyimpan...');

  try {
    const { error } = await supabase.from('items').insert({
      request_id: requestId,
      part_no: partNo,
      part_name: partName,
      unit,
      qty_in: qtyIn,
      qty_out: qtyOut
    });
    if (error) throw error;
    showMsg('msgBarang', '✅ Barang ditambahkan', 'success');
    resetBarangForm();
    await loadBarang();
  } catch (err) {
    // Tangkap pesan trigger
    showMsg('msgBarang', '❌ ' + err.message, 'error');
  }
};

function resetBarangForm() {
  document.getElementById('partNumber').value = '';
  document.getElementById('partName').value = '';
  document.getElementById('unit').value = '';
  document.getElementById('saldoStock').value = '';
  document.getElementById('qtyIn').value = '';
  document.getElementById('qtyOut').value = '';
}
document.getElementById('resetBarang').onclick = resetBarangForm;

async function loadBarang() {
  if (!requestId) return;
  const { data } = await supabase.from('items')
    .select('*').eq('request_id', requestId).order('created_at', { ascending: true });
  const tbody = document.getElementById('barangTableBody');
  if (!data?.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Belum ada barang</td></tr>';
    return;
  }

  // Ambil saldo history untuk tiap part
  tbody.innerHTML = '';
  for (const it of data) {
    const { data: saldo } = await sup
// ---------- LANJUTAN loadBarang ----------
async function loadBarang() {
  if (!requestId) return;
  const { data } = await supabase.from('items')
    .select('*').eq('request_id', requestId).order('created_at', { ascending: true });
  const tbody = document.getElementById('barangTableBody');
  if (!data?.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center">Belum ada barang</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  for (const it of data) {
    // Hitung saldo SETELAH item ini
    const { data: saldoHistory } = await supabase.rpc('get_stock', { p_part_no: it.part_no });
    const saldoBase = Number(saldoHistory) || 0;
    const saldoAfter = saldoBase + Number(it.qty_in) - Number(it.qty_out);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${it.part_name}</td>
      <td>${it.part_no}</td>
      <td>${it.unit}</td>
      <td>${it.qty_in}</td>
      <td>${it.qty_out}</td>
      <td><strong>${saldoAfter}</strong></td>
      <td><button type="button" class="btn-small btn-danger" data-id="${it.id}">🗑</button></td>
    `;
    tbody.appendChild(tr);
  }

  // Handler hapus
  tbody.querySelectorAll('button[data-id]').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('Hapus barang ini?')) return;
      await supabase.from('items').delete().eq('id', btn.dataset.id);
      await loadBarang();
    };
  });
}

// ================= TAB 3: PACKING LIST =================
async function loadPacking() {
  if (!requestId) return;
  const { data } = await supabase.from('packing')
    .select('*').eq('request_id', requestId).maybeSingle();
  if (data) {
    document.getElementById('jumlahBox').value = data.jumlah_box;
    document.getElementById('dimensi').value = data.dimensi;
    document.getElementById('grossWeight').value = data.gross_weight;
    document.getElementById('nettWeight').value = data.nett_weight;
  }
}

document.getElementById('savePacking').onclick = async () => {
  if (isReadOnly) return;
  if (!requestId) return showMsg('msgPacking', '❌ Simpan Dokumen dulu di Tab 1', 'error');

  const payload = {
    request_id: requestId,
    jumlah_box: Number(document.getElementById('jumlahBox').value),
    dimensi: document.getElementById('dimensi').value.trim(),
    gross_weight: Number(document.getElementById('grossWeight').value),
    nett_weight: Number(document.getElementById('nettWeight').value)
  };

  if (!payload.jumlah_box || !payload.dimensi || !payload.gross_weight || !payload.nett_weight) {
    return showMsg('msgPacking', '❌ Semua field wajib diisi', 'error');
  }
  if (payload.nett_weight > payload.gross_weight) {
    return showMsg('msgPacking', '❌ Nett Weight tidak boleh > Gross Weight', 'error');
  }

  showMsg('msgPacking', 'Menyimpan...');
  try {
    const { error } = await supabase.from('packing')
      .upsert(payload, { onConflict: 'request_id' });
    if (error) throw error;
    showMsg('msgPacking', '✅ Packing List tersimpan', 'success');
  } catch (err) {
    showMsg('msgPacking', '❌ ' + err.message, 'error');
  }
};

document.getElementById('resetPacking').onclick = () => {
  if (isReadOnly) return;
  ['jumlahBox','dimensi','grossWeight','nettWeight']
    .forEach(id => document.getElementById(id).value = '');
  showMsg('msgPacking', '');
};

// ================= SEND UNTUK APPROVAL =================
document.getElementById('sendAll').onclick = async () => {
  if (!requestId) return showMsg('msgSend', '❌ Simpan dokumen dulu', 'error');

  // Validasi kelengkapan
  const { data: items } = await supabase.from('items').select('id').eq('request_id', requestId);
  if (!items?.length) return showMsg('msgSend', '❌ Minimal 1 barang harus diinput', 'error');

  const { data: pk } = await supabase.from('packing')
    .select('id').eq('request_id', requestId).maybeSingle();
  if (!pk) return showMsg('msgSend', '❌ Packing List belum diisi', 'error');

  if (!confirm('Kirim dokumen untuk approval? Setelah dikirim, dokumen tidak bisa diedit.')) return;

  showMsg('msgSend', 'Mengirim...');
  try {
    const { error } = await supabase.from('requests').update({
      status: 'pending_approval',
      submitted_at: new Date().toISOString()
    }).eq('id', requestId);
    if (error) throw error;

    await supabase.from('approvals').insert({
      request_id: requestId,
      action: 'submitted',
      actor_id: session.user.id
    });

    showMsg('msgSend', '✅ Dokumen terkirim ke atasan untuk approval', 'success');
    document.getElementById('reqBadge').innerHTML =
      '<span class="badge pending_approval">pending approval</span>';
    lockForm();
  } catch (err) {
    showMsg('msgSend', '❌ ' + err.message, 'error');
  }
};

// ================= DOWNLOAD PDF =================
document.getElementById('downloadPdf').onclick = async () => {
  if (!requestId) return;
  const { generatePdf } = await import('/js/pdf.js');
  await generatePdf(requestId);
};

// ================= INIT =================
await loadMasterParts();
if (requestId) {
  await loadBarang();
  await loadPacking();
}

// Lock form kalau read-only / bukan draft
if (isReadOnly) lockForm();
if (requestId && currentStatus !== 'draft' && currentStatus !== 'rejected') lockForm();
    

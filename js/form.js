// ================= STATE =================
const urlParams = new URLSearchParams(location.search);
let requestId = urlParams.get('id');
let currentDoc = null;

// Ambil data dari LocalStorage
let allRequests = JSON.parse(localStorage.getItem('requests') || '[]');

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

// ================= LOAD DATA =================
if (requestId) {
  currentDoc = allRequests.find(r => r.id === requestId);
  if (currentDoc) {
    document.getElementById('requestNo').value = currentDoc.request_no;
    document.getElementById('tanggal').value = currentDoc.tanggal;
    document.getElementById('indicateDocument').value = currentDoc.indicate_document;
    document.getElementById('remarks').value = currentDoc.remarks || '';
    
    // Load barang
    renderBarang();
    
    // Load packing
    if (currentDoc.packing) {
      document.getElementById('jumlahBox').value = currentDoc.packing.jumlah_box;
      document.getElementById('dimensi').value = currentDoc.packing.dimensi;
      document.getElementById('grossWeight').value = currentDoc.packing.gross_weight;
      document.getElementById('nettWeight').value = currentDoc.packing.nett_weight;
    }
  }
} else {
  // Set tanggal hari ini untuk dokumen baru
  document.getElementById('tanggal').value = new Date().toISOString().slice(0,10);
}

// ================= SIMPAN DOKUMEN =================
document.getElementById('saveDokumen').onclick = () => {
  const tanggal = document.getElementById('tanggal').value;
  const indicateDoc = document.getElementById('indicateDocument').value.trim();
  const remarks = document.getElementById('remarks').value.trim();

  if (!tanggal || !indicateDoc) {
    return showMsg('msgDokumen', '❌ Tanggal & Indicate Document wajib diisi', 'error');
  }

  if (!currentDoc) {
    // Buat dokumen baru
    const newId = 'req-' + Date.now();
    const year = new Date().getFullYear().toString().slice(-2);
    const seq = String(allRequests.length + 1).padStart(4, '0');
    
    currentDoc = {
      id: newId,
      request_no: `I-${year}-${seq}`,
      tanggal: tanggal,
      surindo_pic: 'Darijok',
      indicate_document: indicateDoc,
      remarks: remarks,
      status: 'draft',
      created_at: new Date().toISOString(),
      items: [],
      packing: null
    };
    allRequests.push(currentDoc);
    
    // Update URL agar tidak buat baru lagi jika di-refresh
    history.replaceState({}, '', `?id=${newId}`);
    document.getElementById('requestNo').value = currentDoc.request_no;
  } else {
    // Update dokumen yang sudah ada
    currentDoc.tanggal = tanggal;
    currentDoc.indicate_document = indicateDoc;
    currentDoc.remarks = remarks;
  }

  localStorage.setItem('requests', JSON.stringify(allRequests));
  showMsg('msgDokumen', '✅ Dokumen berhasil disimpan', 'success');
};

// ================= TAB BARANG =================
document.getElementById('addBarang').onclick = () => {
  if (!currentDoc) return showMsg('msgBarang', '❌ Simpan Dokumen dulu di Tab 1', 'error');
  
  const partNo = document.getElementById('partNumber').value.trim();
  const partName = document.getElementById('partName').value.trim();
  const unit = document.getElementById('unit').value.trim();
  const qtyIn = Number(document.getElementById('qtyIn').value) || 0;
  const qtyOut = Number(document.getElementById('qtyOut').value) || 0;

  if (!partNo || !partName || !unit) {
    return showMsg('msgBarang', '❌ Part Number, Part Name, dan Unit wajib diisi', 'error');
  }

  // Validasi Qty OUT (Simulasi saldo 0)
  if (qtyOut > qtyIn) {
    return showMsg('msgBarang', '❌ Qty OUT tidak boleh melebihi Qty IN (Saldo awal 0)', 'error');
  }

  // Tambah ke array items di dokumen
  currentDoc.items.push({
    id: 'item-' + Date.now(),
    part_no: partNo,
    part_name: partName,
    unit: unit,
    qty_in: qtyIn,
    qty_out: qtyOut
  });

  localStorage.setItem('requests', JSON.stringify(allRequests));
  showMsg('msgBarang', '✅ Barang ditambahkan', 'success');
  
  // Reset form
  document.getElementById('partNumber').value = '';
  document.getElementById('partName').value = '';
  document.getElementById('unit').value = '';
  document.getElementById('qtyIn').value = '0';
  document.getElementById('qtyOut').value = '0';
  
  renderBarang();
};

function renderBarang() {
  const tbody = document.getElementById('barangTableBody');
  if (!currentDoc || !currentDoc.items || currentDoc.items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Belum ada barang</td></tr>';
    return;
  }

  tbody.innerHTML = currentDoc.items.map(it => `
    <tr>
      <td>${it.part_no}</td>
      <td>${it.part_name}</td>
      <td>${it.unit}</td>
      <td>${it.qty_in}</td>
      <td>${it.qty_out}</td>
      <td><button class="btn-small btn-danger" onclick="hapusBarang('${it.id}')">🗑</button></td>
    </tr>
  `).join('');
}

window.hapusBarang = (itemId) => {
  currentDoc.items = currentDoc.items.filter(i => i.id !== itemId);
  localStorage.setItem('requests', JSON.stringify(allRequests));
  renderBarang();
};

// ================= TAB PACKING =================
document.getElementById('savePacking').onclick = () => {
  if (!currentDoc) return showMsg('msgPacking', '❌ Simpan Dokumen dulu di Tab 1', 'error');

  const box = Number(document.getElementById('jumlahBox').value);
  const dim = document.getElementById('dimensi').value.trim();
  const gross = Number(document.getElementById('grossWeight').value);
  const nett = Number(document.getElementById('nettWeight').value);

  if (!box || !dim || !gross || !nett) {
    return showMsg('msgPacking', '❌ Semua field packing list wajib diisi', 'error');
  }

  currentDoc.packing = {
    jumlah_box: box,
    dimensi: dim,
    gross_weight: gross,
    nett_weight: nett
  };

  localStorage.setItem('requests', JSON.stringify(allRequests));
  showMsg('msgPacking', '✅ Packing List disimpan', 'success');
};

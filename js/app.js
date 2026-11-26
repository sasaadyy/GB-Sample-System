// Format request number: REQ-YYYYMMDD-XXXX
function generateRequestNumber() {
  const now = new Date();
  const ymd = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `REQ-${ymd}-${rand}`;
}

const reqNumInput = document.getElementById('requestNumber');
reqNumInput.value = generateRequestNumber();

document.getElementById('regenReqNum').addEventListener('click', () => {
  reqNumInput.value = generateRequestNumber();
});

// Set tanggal hari ini default
document.getElementById('tanggal').valueAsDate = new Date();

// Submit
document.getElementById('requestForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const data = {
    requestNumber: reqNumInput.value,
    tanggal: document.getElementById('tanggal').value,
    movement: document.getElementById('movement').value,
    category: document.getElementById('category').value,
    factoryCode: document.getElementById('factoryCode').value,
    surindoPic: document.getElementById('surindoPic').value,
    purpose: document.getElementById('purpose').value,
    partName: document.getElementById('partName').value,
    partNo: document.getElementById('partNo').value,
    core: document.getElementById('core').value,
    resin: document.getElementById('resin').value,
    unit: document.getElementById('unit').value,
    item: document.getElementById('item').value,
    qty: document.getElementById('qty').value,
    suppId: document.getElementById('suppId').value,
    suppDesc: document.getElementById('suppDesc').value,
    picName: document.getElementById('picName').value,
    address: document.getElementById('address').value,
    tlp: document.getElementById('tlp').value,
    fax: document.getElementById('fax').value,
    createdAt: new Date().toISOString(),
  };

  saveData(data);
  alert('✅ Data tersimpan dengan Request Number: ' + data.requestNumber);
  e.target.reset();
  reqNumInput.value = generateRequestNumber();
  document.getElementById('tanggal').valueAsDate = new Date();
});

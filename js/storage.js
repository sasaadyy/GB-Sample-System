const STORAGE_KEY = 'master_data_requests';

function saveData(data) {
  const list = getAllData();
  list.push(data);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function getAllData() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function getDataByRequestNumber(reqNum) {
  return getAllData().find(d => d.requestNumber === reqNum);
}

function deleteData(reqNum) {
  const list = getAllData().filter(d => d.requestNumber !== reqNum);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

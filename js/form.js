import { supabase } from '/js/supabase.js';

// ================= DUMMY USER UNTUK TESTING =================
// Harus sama dengan DUMMY_USER_ID di dashboard.html
const DUMMY_USER_ID = 'a2d6e0a1-bb3a-48af-b308-90268502'; // Ganti dengan ID Anda
const DUMMY_PIC = 'Darijok';
const DUMMY_ROLE = 'supervisor'; // Set 'supervisor' agar bisa test approval, atau 'pic'

const session = { user: { id: DUMMY_USER_ID } }; 
const profile = { pic_code: DUMMY_PIC, role: DUMMY_ROLE };

// ================= SISA KODE DI BAWAH INI TETAP SAMA =================
document.getElementById('surindoPic').value = profile.pic_code;
const isReadOnly = ['supervisor','admin'].includes(profile.role);

// ... (Biarkan sisa kode form.js yang lama tetap ada di bawahnya) ...

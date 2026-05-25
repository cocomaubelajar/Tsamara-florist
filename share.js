// ── SHARED UTILITIES ──
const MAMA_WA = '6285604072483';
// MY_WA telah dihapus sesuai permintaan

function formatDateLong(d) {
  const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatDateShort(d) {
  const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(d) {
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatRp(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

function getNow() { return new Date(); }

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.style.background = isError ? '#e63946' : '#2d6a4f';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function customConfirm(msg, callback) {
  const overlay = document.getElementById('modalOverlay');
  const msgEl = document.getElementById('modalMsg');
  if (!overlay) { callback(confirm(msg)); return; }
  msgEl.textContent = msg;
  overlay.classList.add('show');
  document.getElementById('modalOk').onclick = () => { overlay.classList.remove('show'); callback(true); };
  document.getElementById('modalCancel').onclick = () => { overlay.classList.remove('show'); callback(false); };
}

// Kirim hanya ke MAMA_WA (nomor toko)
function sendWAToAll(msg) {
  const url = `https://wa.me/${MAMA_WA}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

async function kirimKeSheets(data) {
  const GS_URL = 'https://script.google.com/macros/s/AKfycbwWu4Dm7j-y9nsnHTNwf7jR0_MgUCkOjEGtsSKLYDpvkG7xknkSwfCYNNsSfXgxlghG/exec';
  try {
    await fetch(GS_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    console.warn('GSheets error:', err);
  }
}

// Modal HTML (inject ke semua halaman)
function injectModal() {
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-box">
        <div class="modal-title">Konfirmasi</div>
        <div class="modal-msg" id="modalMsg"></div>
        <div class="modal-btns">
          <button class="btn btn-reset" id="modalCancel">Batal</button>
          <button class="btn btn-dark-green" id="modalOk">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  `);
}

// Navbar active state
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectModal();
  setActiveNav();
});

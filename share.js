// ── SHARED UTILITIES TSAMARA FLORIST ──
const MAMA_WA = '6285604072483';
const GS_URL = 'https://script.google.com/macros/s/AKfycbwWu4Dm7j-y9nsnHTNwf7jR0_MgUCkOjEGtsSKLYDpvkG7xknkSwfCYNNsSfXgxlghG/exec';

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
  setTimeout(() => t.classList.remove('show'), 3000);
}

function initConfirm(msg, onOk) {
  const overlay = document.getElementById('modalOverlay');
  const msgEl = document.getElementById('modalMsg');
  const btnOk = document.getElementById('modalOk');
  const btnCancel = document.getElementById('modalCancel');
  
  if (!overlay || !msgEl) return;
  msgEl.textContent = msg;
  overlay.classList.add('show');
  
  btnOk.onclick = () => { overlay.classList.remove('show'); onOk(); };
  btnCancel.onclick = () => overlay.classList.remove('show');
}

// Fungsi kirim WA sudah difokuskan ke Mama saja
function sendWA(msg) {
  window.open(`https://wa.me/${MAMA_WA}?text=${encodeURIComponent(msg)}`, '_blank');
}

async function kirimKeSheets(data) {
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
  const path = window.location.pathname;
  const page = path.split("/").pop().toLowerCase();
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href').toLowerCase();
    if (page === href || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectModal();
  setActiveNav();
});

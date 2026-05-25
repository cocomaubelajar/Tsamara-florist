// ── SHARED UTILITIES TSAMARA FLORIST ──
const MAMA_WA = '6285604072483';
const MY_WA = '6285142531044';
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
  const num = parseInt(n) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

// Fungsi bantu untuk mengubah string format ribuan (10.000) kembali menjadi angka murni (10000)
function unformatRp(str) {
  if (!str) return 0;
  return parseInt(str.replace(/\./g, '')) || 0;
}

// Fungsi otomatis mengubah input ketikan biasa menjadi format ribuan (Currency Mask)
function setupCurrencyInput(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value) {
      e.target.value = parseInt(value).toLocaleString('id-ID');
    } else {
      e.target.value = '';
    }
  });
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

function openWhatsAppDuo(msg) {
  window.open(`https://wa.me/${MY_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  setTimeout(() => {
    window.open(`https://wa.me/${MAMA_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  }, 800);
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

function injectModal() {
  if (document.getElementById('modalOverlay')) return;
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay" id="modalOverlay">
      <div class="modal-box">
        <div class="modal-title">Konfirmasi</div>
        <div class="modal-msg" id="modalMsg"></div>
        <div class="modal-btns">
          <button class="btn btn-reset" id="modalCancel">Batal</button>\n          <button class="btn btn-dark-green" id="modalOk">Ya, Lanjutkan</button>
        </div>
      </div>
    </div>
    <div class="toast" id="toast"></div>
  `);
}

function confirmAction(msg, onConfirm) {
  injectModal();
  const overlay = document.getElementById('modalOverlay');
  const msgEl = document.getElementById('modalMsg');
  const btnOk = document.getElementById('modalOk');
  const btnCancel = document.getElementById('modalCancel');
  
  msgEl.textContent = msg;
  overlay.classList.add('show');
  
  const close = () => overlay.classList.remove('show');
  
  btnOk.onclick = () => { close(); onConfirm(); };
  btnCancel.onclick = close;
}

function setActiveNav() {
  const path = window.location.pathname;
  const page = path.split("/").pop() || "index.html";
  document.querySelectorAll('.nav-link').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectModal();
  setActiveNav();
});

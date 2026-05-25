// ── LOGIKA KHUSUS PENJUALAN TSAMARA FLORIST ──
let items = [];

function calcPreview() {
  const qty = parseFloat(document.getElementById('itemQty').value) || 0;
  const price = parseFloat(document.getElementById('itemPrice').value) || 0;
  const el = document.getElementById('previewTotal');
  if (qty > 0 && price > 0) {
    el.textContent = `${qty} × ${formatRp(price)} = ${formatRp(qty * price)}`;
  } else {
    el.textContent = '';
  }
}

function addItem() {
  const name = document.getElementById('itemName').value.trim();
  const qty = parseFloat(document.getElementById('itemQty').value);
  const price = parseFloat(document.getElementById('itemPrice').value);
  const customer = document.getElementById('customerName').value.trim();

  if (!name) { showToast('❌ Nama barang harus diisi', true); return; }
  if (!qty || qty <= 0) { showToast('❌ Jumlah harus diisi', true); return; }
  if (!price || price <= 0) { showToast('❌ Harga harus diisi', true); return; }

  items.push({ name, qty, price, total: qty * price, customer });

  document.getElementById('itemName').value = '';
  document.getElementById('itemQty').value = '';
  document.getElementById('itemPrice').value = '';
  document.getElementById('previewTotal').textContent = '';

  renderItems();
  showToast('✅ Barang ditambahkan!');
}

function deleteItem(i) {
  items.splice(i, 1);
  renderItems();
}

function getDiskon() {
  return parseFloat(document.getElementById('diskonInput').value) || 0;
}

function updateDiskon() {
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const diskon = getDiskon();
  const final = Math.max(0, subtotal - diskon);
  
  const elGrandTotal = document.getElementById('grandTotal');
  if(elGrandTotal) elGrandTotal.textContent = formatRp(final);
  
  const res = document.getElementById('diskonResult');
  if(res) {
    if (diskon > 0) {
      res.style.display = 'block';
      document.getElementById('diskonLabel').textContent = `− ${formatRp(diskon)}`;
    } else {
      res.style.display = 'none';
    }
  }
}

function renderItems() {
  const list = document.getElementById('itemsList');
  const noItems = document.getElementById('noItemsMsg');
  
  if (!list) return;

  if (items.length === 0) {
    list.innerHTML = '<div class="empty-state">Belum ada barang ditambahkan</div>';
    if(document.getElementById('subtotalDisplay')) document.getElementById('subtotalDisplay').textContent = 'Rp 0';
    if(document.getElementById('grandTotal')) document.getElementById('grandTotal').textContent = 'Rp 0';
    if(document.getElementById('summaryItems')) document.getElementById('summaryItems').textContent = '0 item';
    if(document.getElementById('diskonResult')) document.getElementById('diskonResult').style.display = 'none';
    if(noItems) noItems.style.display = 'none';
    return;
  }

  if(noItems) noItems.style.display = 'none';
  
  let html = '';
  items.forEach((it, i) => {
    html += `
      <div style="display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px dashed #ccc;">
        <div>
          <div style="font-weight:700;">${it.name} ${it.customer ? `(<small>${it.customer}</small>)` : ''}</div>
          <div style="font-size:0.85rem; color:#666;">${it.qty} pcs x ${formatRp(it.price)}</div>
        </div>
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-weight:700;">${formatRp(it.total)}</div>
          <button class="btn btn-reset text-red" onclick="deleteItem(${i})">❌</button>
        </div>
      </div>
    `;
  });
  list.innerHTML = html;

  const subtotal = items.reduce((s, it) => s + it.total, 0);
  if(document.getElementById('subtotalDisplay')) document.getElementById('subtotalDisplay').textContent = formatRp(subtotal);
  if(document.getElementById('summaryItems')) document.getElementById('summaryItems').textContent = `${items.length} item`;
  updateDiskon();
}

function simpanDanAksi(tipe) {
  if (items.length === 0) {
    showToast('❌ Rekap masih kosong!', true);
    return;
  }

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const diskon = getDiskon();
  const finalTotal = Math.max(0, subtotal - diskon);
  const sekarang = getNow();

  const dataLog = {
    tipe: 'Penjualan',
    date: formatDateShort(sekarang),
    time: formatTime(sekarang),
    items: items,
    subtotal: subtotal,
    diskon: diskon,
    finalTotal: finalTotal
  };

  initConfirm(`Lanjutkan simpan dan ${tipe === 'wa' ? 'Kirim ke WA' : 'Cetak Struk'}?`, async () => {
    // Kirim background ke Google Sheets
    kirimKeSheets(dataLog);

    if (tipe === 'wa') {
      buatTeksWA(dataLog);
    } else if (tipe === 'print') {
      cetakStruk(dataLog);
    }

    // Reset Form
    items = [];
    document.getElementById('diskonInput').value = 0;
    renderItems();
    showToast('✅ Transaksi berhasil diproses!');
  });
}

function buatTeksWA(data) {
  let msg = `*NOTA PENJUALAN TSAMARA FLORIST*\n`;
  msg += `📅 ${formatDateLong(getNow())} — 🕒 ${data.time}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━\n\n`;
  
  data.items.forEach((item, i) => {
    msg += `${i+1}. *${item.name}*\n`;
    msg += `   ${item.qty} pcs x ${formatRp(item.price)} = ${formatRp(item.total)}\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━\n`;
  msg += `Subtotal: ${formatRp(data.subtotal)}\n`;
  if (data.diskon > 0) msg += `Diskon: -${formatRp(data.diskon)}\n`;
  msg += `*Total Bayar: ${formatRp(data.finalTotal)}*\n\n`;
  msg += ` Terima kasih telah berbelanja di Tsamara Florist! 🌸`;

  // Menggunakan fungsi sendWA dari share.js (Otomatis ke Mama)
  sendWA(msg);
}

function cetakStruk(data) {
  const w = window.open('', '_blank');
  let itemRows = data.items.map(item => `
    <tr>
      <td style="padding:4px 0;">${item.name}<br><small>${item.qty} x ${formatRp(item.price)}</small></td>
      <td style="text-align:right; vertical-align:bottom;">${formatRp(item.total)}</td>
    </tr>
  `).join('');

  w.document.write(`
    <html>
    <head>
      <title>Cetak Struk</title>
      <style>
        @page { size: 58mm auto; margin: 0; }
        body { font-family: 'Courier New', Courier, monospace; width: 48mm; margin: 5mm; font-size: 11px; color: #000; }
        .text-center { text-align: center; }
        .divider { border-top: 1px dashed #000; margin: 8px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
      </style>
    </head>
    <body onload="window.print(); window.close();">
      <div class="text-center">
        <b style="font-size:13px;">TSAMARA FLORIST</b><br>
        Dsn. Kangkungan, Mojokerto<br>
        ${formatDateShort(getNow())} — ${data.time}
      </div>
      <div class="divider"></div>
      <table>${itemRows}</table>
      <div class="divider"></div>
      <table>
        <tr><td>Subtotal:</td><td style="text-align:right;">${formatRp(data.subtotal)}</td></tr>
        ${data.diskon > 0 ? `<tr><td>Diskon:</td><td style="text-align:right;">-${formatRp(data.diskon)}</td></tr>` : ''}
        <tr><td><b>Total:</b></td><td style="text-align:right;"><b>${formatRp(data.finalTotal)}</b></td></tr>
      </table>
      <div class="divider"></div>
      <div class="text-center" style="margin-top:10px;">
        Terima Kasih!<br>Selamat Bercocok Tanam 🌸
      </div>
    </body>
    </html>
  `);
  w.document.close();
}

document.addEventListener('DOMContentLoaded', () => {
  renderItems();
});

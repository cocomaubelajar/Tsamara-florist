let items = [];

document.addEventListener('DOMContentLoaded', () => {
  // Pasang listener real-time kalkulasi preview barang
  document.getElementById('brgJumlah')?.addEventListener('input', calcPreview);
  document.getElementById('brgHarga')?.addEventListener('input', calcPreview);
  
  // Pasang listener kalkulator tutup kios harian
  document.getElementById('clDiskon')?.addEventListener('input', hitungTutupKios);
  document.getElementById('clModal')?.addEventListener('input', hitungTutupKios);
  document.getElementById('clTakTerduga')?.addEventListener('input', hitungTutupKios);
  document.getElementById('clSisaUang')?.addEventListener('change', hitungTutupKios);

  // Jalankan hitung awal agar tampilan Rp 0 sinkron
  hitungTutupKios();
});

function calcPreview() {
  const qty = parseInt(document.getElementById('brgJumlah').value) || 0;
  const harga = parseInt(document.getElementById('brgHarga').value) || 0;
  const total = qty * harga;
  document.getElementById('brgPreview').textContent = total > 0 ? `Preview Total: ${formatRp(total)}` : '';
}

function tambahBarang() {
  const nama = document.getElementById('brgNama').value.trim();
  const qty = parseInt(document.getElementById('brgJumlah').value) || 0;
  const harga = parseInt(document.getElementById('brgHarga').value) || 0;
  const pembeli = document.getElementById('brgPembeli').value.trim() || 'Umum';

  if (!nama || qty <= 0 || harga <= 0) {
    showToast('Harap isi semua kolom input barang dengan benar!', true);
    return;
  }

  items.push({ nama, qty, harga, pembeli, total: qty * harga });
  
  // Reset form input barang
  document.getElementById('brgNama').value = '';
  document.getElementById('brgJumlah').value = '1';
  document.getElementById('brgHarga').value = '';
  document.getElementById('brgPembeli').value = '';
  document.getElementById('brgPreview').textContent = '';

  renderItems();
  hitungTutupKios();
  showToast('Barang berhasil ditambahkan!');
}

function renderItems() {
  const list = document.getElementById('barangList');
  if (items.length === 0) {
    list.innerHTML = '<tr><td colspan="5" class="empty-table" style="text-align:center; padding:20px; color:var(--muted);">Belum ada barang dimasukkan</td></tr>';
    return;
  }

  list.innerHTML = items.map((item, index) => `
    <tr>
      <td><strong>${item.nama}</strong><br><small style="color:var(--muted);">👤 ${item.pembeli}</small></td>
      <td style="text-align:center;">${item.qty}</td>
      <td style="text-align:right;">${formatRp(item.harga)}</td>
      <td style="text-align:right; font-weight:700; color:var(--green);">${formatRp(item.total)}</td>
      <td style="text-align:center;"><button class="btn-action btn-del" onclick="hapusBarang(${index})">🗑️</button></td>
    </tr>
  `).join('');
}

function hapusBarang(index) {
  items.splice(index, 1);
  renderItems();
  hitungTutupKios();
  showToast('Barang dihapus.');
}

function hitungTutupKios() {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const diskon = parseInt(document.getElementById('clDiskon').value) || 0;
  const modal = parseInt(document.getElementById('clModal').value) || 0;
  const takTerduga = parseInt(document.getElementById('clTakTerduga').value) || 0;
  const statusSisa = document.getElementById('clSisaUang').value;

  const totalPendapatan = subtotal - diskon;
  const sisaKasKios = modal + totalPendapatan - takTerduga;

  document.getElementById('lblSubtotal').textContent = formatRp(subtotal);
  document.getElementById('lblTotalPendapatan').textContent = formatRp(totalPendapatan);
  document.getElementById('lblSisaKas').textContent = formatRp(sisaKasKios);

  const detailSisa = document.getElementById('detailSisaUang');
  if (statusSisa === 'Bawa Pulang') {
    detailSisa.innerHTML = `💵 Uang dibawa pulang sebesar <strong>${formatRp(totalPendapatan)}</strong>. Sisa di laci kios kembali ke modal awal: <strong>${formatRp(modal - takTerduga)}</strong>.`;
  } else {
    detailSisa.innerHTML = `🏦 Semua uang kas ditinggal di kios. Total di laci laci malam ini: <strong>${formatRp(sisaKasKios)}</strong>.`;
  }

  return { subtotal, diskon, modal, takTerduga, totalPendapatan, sisaKasKios, statusSisa };
}

function simpanDanKirim() {
  if (items.length === 0) {
    showToast('Masukkan minimal 1 barang terlebih dahulu!', true);
    return;
  }

  confirmAction('Apakah data penjualan hari ini sudah benar dan siap dikirim?', async () => {
    const calc = hitungTutupKios();
    const d = getNow();

    // 1. Susun pesan teks WhatsApp dengan format asli kamu
    let msg = `*REKAP PENJUALAN TSAMARA FLORIST*\n`;
    msg += `📅 ${formatDateLong(d)}\n`;
    msg += `🕒 Jam Tutup: ${formatTime(d)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    items.forEach((item, i) => {
      msg += `${i+1}. *${item.nama}* [👤 ${item.pembeli}]\n`;
      msg += `   ${item.qty} pcs x ${formatRp(item.harga)} = *${formatRp(item.total)}*\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `💵 Subtotal: ${formatRp(calc.subtotal)}\n`;
    if (calc.diskon > 0) msg += `🔻 Diskon: ${formatRp(calc.diskon)}\n`;
    msg += `💰 *Total Pendapatan: ${formatRp(calc.totalPendapatan)}*\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `📦 Modal Awal: ${formatRp(calc.modal)}\n`;
    if (calc.takTerduga > 0) msg += `⚠️ Pengeluaran Tak Terduga: ${formatRp(calc.takTerduga)}\n`;
    msg += `🧮 *Sisa Kas Akhir: ${formatRp(calc.sisaKasKios)}*\n`;
    msg += `📌 Status Sisa Kas: *${calc.statusSisa}*\n\n`;
    msg += `_Laporan otomatis sistem kios_ 🌸`;

    // 2. Buka kirim pesan ke WhatsApp Duo (Kamu & Mama) via utilitas share.js
    openWhatsAppDuo(msg);

    // 3. Cadangkan data ke Google Sheets Cloud
    const dataSheets = {
      action: 'penjualan',
      date: formatDateShort(d),
      time: formatTime(d),
      subtotal: calc.subtotal,
      diskon: calc.diskon,
      finalTotal: calc.totalPendapatan,
      modal: calc.modal,
      takTerduga: calc.takTerduga,
      sisaKas: calc.sisaKasKios,
      statusSisa: calc.statusSisa,
      items: JSON.stringify(items)
    };
    await kirimKeSheets(dataSheets);

    // 4. Simpan Histori ke LocalStorage agar terhitung di Dashboard index.html
    let riwayat = JSON.parse(localStorage.getItem('riwayatPenjualan')) || [];
    riwayat.push(dataSheets);
    localStorage.setItem('riwayatPenjualan', JSON.stringify(riwayat));

    // Reset Form Input & Keranjang setelah data sukses diproses
    items = [];
    renderItems();
    document.getElementById('clDiskon').value = '';
    document.getElementById('clTakTerduga').value = '';
    hitungTutupKios();
    showToast('Laporan penjualan sukses terkirim dan disimpan!');
  });
}

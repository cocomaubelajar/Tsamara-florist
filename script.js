const MAMA_WA = '6285604072483';
  const GS_URL = 'https://script.google.com/macros/s/AKfycbwWu4Dm7j-y9nsnHTNwf7jR0_MgUCkOjEGtsSKLYDpvkG7xknkSwfCYNNsSfXgxlghG/exec';
  let items = [];

  // ── GOOGLE SHEETS INTEGRATION ──
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



  function getNow() { return new Date(); }

  function formatDateLong(d) {
    const days = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
    const months = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatDateShort(d) {
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  }

  function formatTime(d) {
    return d.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
  }

  function formatRp(n) {
    return 'Rp ' + n.toLocaleString('id-ID');
  }

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

    if (!name) { showToast('❌ Nama barang harus diisi'); return; }
    if (!qty || qty <= 0) { showToast('❌ Jumlah harus diisi'); return; }
    if (!price || price <= 0) { showToast('❌ Harga harus diisi'); return; }

    items.push({ name, qty, price, total: qty * price, customer });

    document.getElementById('itemName').value = '';
    document.getElementById('itemQty').value = '';
    document.getElementById('itemPrice').value = '';
    document.getElementById('previewTotal').textContent = '';

    renderItems();
    showToast('✅ Ditambahkan!');
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
    document.getElementById('grandTotal').textContent = formatRp(final);
    const res = document.getElementById('diskonResult');
    if (diskon > 0) {
      res.style.display = 'block';
      document.getElementById('diskonLabel').textContent = `− ${formatRp(diskon)}`;
    } else {
      res.style.display = 'none';
    }
  }

  function renderItems() {
    const list = document.getElementById('itemsList');
    const noItems = document.getElementById('noItemsMsg');

    if (items.length === 0) {
      list.innerHTML = '<div class="empty-state">Belum ada barang ditambahkan</div>';
      document.getElementById('subtotalDisplay').textContent = 'Rp 0';
      document.getElementById('grandTotal').textContent = 'Rp 0';
      document.getElementById('summaryItems').textContent = '0 item';
      document.getElementById('diskonResult').style.display = 'none';
      noItems.style.display = 'none';
      return;
    }

    noItems.style.display = 'none';
    let subtotal = 0;
    list.innerHTML = items.map((it, i) => {
      subtotal += it.total;
      return `
        <div class="item-row">
          <div class="item-info">
            <div class="item-name">${escHtml(it.name)}</div>
            ${it.customer ? `<div class="item-customer">👤 ${escHtml(it.customer)}</div>` : ''}
            <div class="item-detail">${it.qty} pcs × ${formatRp(it.price)}</div>
          </div>
          <div class="item-total">${formatRp(it.total)}</div>
          <button class="btn-del" onclick="deleteItem(${i})">✕</button>
        </div>
      `;
    }).join('');

    document.getElementById('subtotalDisplay').textContent = formatRp(subtotal);
    updateDiskon();
    document.getElementById('summaryItems').textContent = `${items.length} jenis barang`;
  }

  function escHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function buildWAMessage() {
    const d = getNow();
    const subtotal = items.reduce((s, it) => s + it.total, 0);
    const diskon = getDiskon();
    const final = Math.max(0, subtotal - diskon);

    let msg = `🌸 *REKAP PENJUALAN TSAMARA FLORIST*\n`;
    msg += `📅 ${formatDateLong(d)}\n`;
    msg += `🕐 Jam ${formatTime(d)}\n`;
    msg += `\n`;

    // Group items by customer
    const grouped = {};
    items.forEach(it => {
      const cust = it.customer || 'Tanpa Nama';
      if (!grouped[cust]) grouped[cust] = [];
      grouped[cust].push(it);
    });

    const customerNames = Object.keys(grouped).filter(c => c !== 'Tanpa Nama');
    if (customerNames.length > 0) {
      customerNames.forEach(cust => {
        msg += `*👤 ${cust}:*\n`;
        grouped[cust].forEach((it) => {
          msg += `  • ${it.name}\n`;
          msg += `     ${it.qty} pcs × ${formatRp(it.price)} = *${formatRp(it.total)}*\n`;
        });
        msg += `\n`;
      });
    } else {
      msg += `*Daftar Barang:*\n`;
      items.forEach((it) => {
        msg += `  • ${it.name}\n`;
        msg += `     ${it.qty} pcs × ${formatRp(it.price)} = *${formatRp(it.total)}*\n`;
      });
      msg += `\n`;
    }

    // Subtotal per customer if multiple
    if (customerNames.length > 1) {
      customerNames.forEach(cust => {
        const custSubtotal = grouped[cust].reduce((s, it) => s + it.total, 0);
        msg += `Subtotal ${cust}: ${formatRp(custSubtotal)}\n`;
      });
    }

    msg += `━━━━━━━━━━━━━━━\n`;
    msg += `Subtotal Total: ${formatRp(subtotal)}\n`;
    if (diskon > 0) msg += `✂️ Diskon: − ${formatRp(diskon)}\n`;
    msg += `💰 *TOTAL BAYAR: ${formatRp(final)}*\n`;
    msg += `\n_Tsamara Florist_ 🌸`;
    return msg;
  }

  function sendWA() {
    if (items.length === 0) {
      document.getElementById('noItemsMsg').style.display = 'block';
      showToast('❌ Belum ada barang!');
      return;
    }
    customConfirm('Apakah Anda yakin ingin mengirim rekap penjualan ke WhatsApp?', (confirmed) => {
      if (!confirmed) return;
      // Save to log
      const d = getNow();
      const subtotal = items.reduce((s, it) => s + it.total, 0);
      const diskon = getDiskon();
      const finalTotal = Math.max(0, subtotal - diskon);
      const customers = [...new Set(items.filter(it => it.customer).map(it => it.customer))].join(', ');
      const entry = {
        date: formatDateLong(d),
        time: formatTime(d),
        items: items.map(it => ({...it})),
        subtotal, diskon, finalTotal,
        customers
      };
      saveLog(entry);
      renderLog();
      updatePenghasilanAuto();

      // Kirim ke Google Sheets
      kirimKeSheets({
        type: 'transaksi',
        date: formatDateLong(d),
        time: formatTime(d),
        customers,
        items: entry.items,
        diskon,
        finalTotal
      });

      const msg = buildWAMessage();
      const url = `https://wa.me/${MAMA_WA}?text=${encodeURIComponent(msg)}`;
      window.open(url, '_blank');
      showToast('📤 Terkirim & tersimpan di riwayat!');

      // Auto reset data setelah kirim
      items = [];
      document.getElementById('customerName').value = '';
      document.getElementById('diskonInput').value = '';
      renderItems();
    });
  }

  function resetAll() {
    if (items.length === 0) { showToast('Rekap sudah kosong'); return; }
    customPrompt('Untuk mereset semua data transaksi, ketik: "Ya, Saya yakin"', 'Ya, Saya yakin', (confirmed) => {
      if (!confirmed) {
        showToast('Reset dibatalkan');
        return;
      }
      items = [];
      document.getElementById('customerName').value = '';
      document.getElementById('diskonInput').value = '';
      renderItems();
      showToast('🗑️ Rekap direset');
    });
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }


  // ── CUSTOM MODAL FUNCTIONS ──
  let modalCallback = null;

  function showModal(message, showInput = false, expectedText = '') {
    document.getElementById('modalMessage').textContent = message;
    const inputEl = document.getElementById('modalInput');
    if (showInput) {
      inputEl.style.display = 'block';
      inputEl.value = '';
      inputEl.focus();
      modalCallback = (result) => {
        if (expectedText && result !== expectedText) {
          showToast('❌ Teks tidak sesuai');
          return false;
        }
        return true;
      };
    } else {
      inputEl.style.display = 'none';
      modalCallback = null;
    }
    document.getElementById('customModal').style.display = 'flex';
  }

  function hideModal() {
    document.getElementById('customModal').style.display = 'none';
  }

  function customConfirm(message, callback) {
    showModal(message, false);
    const yesBtn = document.getElementById('modalYes');
    const noBtn = document.getElementById('modalNo');
    const handleYes = () => {
      hideModal();
      callback(true);
      yesBtn.removeEventListener('click', handleYes);
      noBtn.removeEventListener('click', handleNo);
    };
    const handleNo = () => {
      hideModal();
      callback(false);
      yesBtn.removeEventListener('click', handleYes);
      noBtn.removeEventListener('click', handleNo);
    };
    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
  }

  function customPrompt(message, expectedText, callback) {
    showModal(message, true, expectedText);
    const inputEl = document.getElementById('modalInput');
    const yesBtn = document.getElementById('modalYes');
    const noBtn = document.getElementById('modalNo');
    const handleYes = () => {
      const value = inputEl.value.trim();
      if (modalCallback && !modalCallback(value)) return;
      hideModal();
      callback(value === expectedText);
      yesBtn.removeEventListener('click', handleYes);
      noBtn.removeEventListener('click', handleNo);
      inputEl.removeEventListener('keydown', handleEnter);
    };
    const handleNo = () => {
      hideModal();
      callback(false);
      yesBtn.removeEventListener('click', handleYes);
      noBtn.removeEventListener('click', handleNo);
      inputEl.removeEventListener('keydown', handleEnter);
    };
    const handleEnter = (e) => {
      if (e.key === 'Enter') handleYes();
    };
    yesBtn.addEventListener('click', handleYes);
    noBtn.addEventListener('click', handleNo);
    inputEl.addEventListener('keydown', handleEnter);
  }


  // ── LAPORAN TUTUP KIOS ──
  let pengeluaranItems = [];
  let opsiSisa = 'pulang'; // default: dibawa pulang

  function pilihOpsiSisa(opsi) {
    opsiSisa = opsi;
    document.getElementById('opsiPulang').classList.toggle('active', opsi === 'pulang');
    document.getElementById('opsiKios').classList.toggle('active', opsi === 'kios');
  }

  function getPenghasilanHariIni() {
    const todayLabel = formatDateLong(getNow());
    const log = getLog();
    const todayEntries = log.filter(e => e.date === todayLabel);
    return {
      total: todayEntries.reduce((s, e) => s + e.finalTotal, 0),
      count: todayEntries.length
    };
  }

  function updatePenghasilanAuto() {
    const { total, count } = getPenghasilanHariIni();
    document.getElementById('penghasilanAuto').textContent = formatRp(total);
    document.getElementById('penghasilanNote').textContent = `dari ${count} transaksi hari ini`;
    hitungSisaKas();
  }

  function addPengeluaran() {
    const id = Date.now();
    pengeluaranItems.push({ id, nama: '', nominal: 0 });
    renderPengeluaran();
  }

  function removePengeluaran(id) {
    pengeluaranItems = pengeluaranItems.filter(p => p.id !== id);
    renderPengeluaran();
    hitungSisaKas();
  }

  function renderPengeluaran() {
    const el = document.getElementById('pengeluaranList');
    if (pengeluaranItems.length === 0) {
      el.innerHTML = '<div style="font-size:0.78rem;color:var(--muted);font-style:italic;margin-bottom:8px;text-align:center;">Tidak ada pengeluaran hari ini</div>';
      return;
    }
    el.innerHTML = pengeluaranItems.map(p => `
      <div class="pengeluaran-row">
        <input type="text" placeholder="Nama (cth: Kresek)" value="${p.nama}"
          oninput="updatePengeluaran(${p.id}, 'nama', this.value)" />
        <input type="number" placeholder="0" min="0" value="${p.nominal || ''}"
          oninput="updatePengeluaran(${p.id}, 'nominal', this.value)" />
        <button class="btn-del-kecil" onclick="removePengeluaran(${p.id})">✕</button>
      </div>
    `).join('');
  }

  function updatePengeluaran(id, field, value) {
    const item = pengeluaranItems.find(p => p.id === id);
    if (!item) return;
    item[field] = field === 'nominal' ? (parseFloat(value) || 0) : value;
    hitungSisaKas();
  }

  function getTotalPengeluaran() {
    return pengeluaranItems.reduce((s, p) => s + (p.nominal || 0), 0);
  }

  function hitungSisaKas() {
    const modal = parseFloat(document.getElementById('modalAwal').value) || 0;
    const penghasilan = getPenghasilanHariIni().total;
    const pengeluaran = getTotalPengeluaran();
    const sisa = modal + penghasilan - pengeluaran;

    document.getElementById('calcModal').textContent = `+ ${formatRp(modal)}`;
    document.getElementById('calcPenghasilan').textContent = `+ ${formatRp(penghasilan)}`;
    document.getElementById('calcPengeluaran').textContent = `− ${formatRp(pengeluaran)}`;
    document.getElementById('calcSisa').textContent = formatRp(sisa);
  }

  function buildTutupKiosMsg() {
    const d = getNow();
    const modal = parseFloat(document.getElementById('modalAwal').value) || 0;
    const { total: penghasilan, count } = getPenghasilanHariIni();
    const pengeluaran = getTotalPengeluaran();
    const sisa = modal + penghasilan - pengeluaran;
    const opsiLabel = opsiSisa === 'pulang' ? 'dibawa pulang' : 'ditinggal di kios';

    let msg = `🌸 *LAPORAN TUTUP KIOS - TSAMARA FLORIST*\n`;
    msg += `📅 ${formatDateLong(d)} · 🕐 ${formatTime(d)}\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n\n`;

    // Uang Saku hanya tampil di WA kalau ada isinya
    if (modal > 0) {
      msg += `💼 Uang Saku        : ${formatRp(modal)}\n`;
    }
    msg += `💰 Penghasilan Kios : ${formatRp(penghasilan)} _(${count} transaksi)_\n`;

    if (pengeluaranItems.length > 0) {
      msg += `📦 Pengeluaran      : ${formatRp(pengeluaran)}\n`;
      pengeluaranItems.forEach(p => {
        const nama = p.nama || 'Item';
        msg += `   • ${nama} : ${formatRp(p.nominal || 0)}\n`;
      });
    }

    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `🏦 Sisa Kas         : *${formatRp(sisa)}* _(${opsiLabel})_\n`;
    msg += `\n_Tsamara Florist_ 🌸`;
    return msg;
  }

  function kirimTutupKios() {
    const { count } = getPenghasilanHariIni();
    customConfirm(
      `Kirim laporan tutup kios ke Mama? Semua data hari ini akan direset setelah terkirim.`,
      (confirmed) => {
        if (!confirmed) return;
        const msg = buildTutupKiosMsg();
        const url = `https://wa.me/${MAMA_WA}?text=${encodeURIComponent(msg)}`;
        window.open(url, '_blank');

        // Kirim ke Google Sheets
        kirimKeSheets({
          type: 'tutup_kios',
          date: formatDateLong(getNow()),
          time: formatTime(getNow()),
          penghasilan: getPenghasilanHariIni().total,
          pengeluaran: pengeluaranItems.map(p => ({nama: p.nama || 'Item', nominal: p.nominal || 0})),
          totalPengeluaran: getTotalPengeluaran()
        });

        // Reset semua
        items = [];
        pengeluaranItems = [];
        document.getElementById('customerName').value = '';
        document.getElementById('diskonInput').value = '';
        document.getElementById('modalAwal').value = '';
        renderItems();
        renderPengeluaran();
        localStorage.removeItem(LOG_KEY);
        renderLog();
        updatePenghasilanAuto();
        showToast('✅ Laporan terkirim! Data direset.');
      }
    );
  }

  // ── LOG RIWAYAT ──
  const LOG_KEY = 'tsamara_log';

  function getLog() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
    catch { return []; }
  }

  function saveLog(entry) {
    const log = getLog();
    log.unshift(entry); // newest first
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  }

  function renderLog() {
    const log = getLog();
    const el = document.getElementById('logList');
    if (log.length === 0) {
      el.innerHTML = '<div class="empty-state">Belum ada riwayat tersimpan</div>';
      return;
    }
    el.innerHTML = log.map((entry, i) => {
      // Group items by customer
      const grouped = {};
      entry.items.forEach(it => {
        const cust = it.customer || 'Tanpa Nama';
        if (!grouped[cust]) grouped[cust] = [];
        grouped[cust].push(it);
      });

      let itemLines = '';
      const customerNames = Object.keys(grouped).filter(c => c !== 'Tanpa Nama');
      if (customerNames.length > 0) {
        customerNames.forEach(cust => {
          itemLines += `<b>👤 ${cust}:</b><br>`;
          grouped[cust].forEach(it => {
            itemLines += `${it.name} — ${it.qty} pcs × ${formatRp(it.price)} = <b>${formatRp(it.total)}</b><br>`;
          });
          itemLines += '<br>';
        });
      } else {
        itemLines = entry.items.map(it =>
          `${it.name} — ${it.qty} pcs × ${formatRp(it.price)} = <b>${formatRp(it.total)}</b>`
        ).join('<br>');
      }

      return `
        <div class="log-entry">
          <div class="log-header">
            <div class="log-date">📅 ${entry.date} &nbsp;🕐 ${entry.time}</div>
            <div class="log-total">${formatRp(entry.finalTotal)}</div>
          </div>
          <div class="log-items">${itemLines}</div>
          ${entry.diskon > 0 ? `<div class="log-diskon">✂️ Diskon: − ${formatRp(entry.diskon)} &nbsp;|&nbsp; Subtotal: ${formatRp(entry.subtotal)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function clearLog() {
    customPrompt('Untuk menghapus semua riwayat transaksi, ketik: "Ya, Saya yakin"', 'Ya, Saya yakin', (confirmed) => {
      if (!confirmed) {
        showToast('Penghapusan dibatalkan');
        return;
      }
      localStorage.removeItem(LOG_KEY);
      renderLog();
  renderPengeluaran();
  updatePenghasilanAuto();
      showToast('🗑️ Riwayat dihapus');
    });
  }

  function exportLogXLSX() {
    const log = getLog();
    if (log.length === 0) { showToast('❌ Belum ada riwayat!'); return; }

    const wb = XLSX.utils.book_new();

    // Sheet 1: Semua transaksi flat
    const header = ['Tanggal', 'Jam', 'Pelanggan', 'Nama Barang', 'Jumlah (pcs)', 'Harga/pcs (Rp)', 'Total Item (Rp)', 'Diskon (Rp)', 'Total Bayar (Rp)'];
    const rows = [['Tsamara Florist - Log Riwayat Penjualan'], [], header];

    log.forEach(entry => {
      entry.items.forEach((it, idx) => {
        rows.push([
          entry.date,
          entry.time,
          it.customer || '-',
          it.name,
          it.qty,
          it.price,
          it.total,
          idx === 0 ? entry.diskon : '',
          idx === 0 ? entry.finalTotal : ''
        ]);
      });
    });

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [
      {wch:18},{wch:8},{wch:18},{wch:20},{wch:12},{wch:16},{wch:16},{wch:12},{wch:16}
    ];

    // Style header
    const hRow = 3;
    ['A','B','C','D','E','F','G','H','I'].forEach(col => {
      const cell = ws[col + hRow];
      if (cell) cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '2D6A4F' } },
        alignment: { horizontal: 'center' }
      };
    });

    XLSX.utils.book_append_sheet(wb, ws, 'Log Riwayat');

    // Sheet 2: Ringkasan per hari
    const sumHeader = ['Tanggal', 'Jam', 'Jumlah Item', 'Subtotal (Rp)', 'Diskon (Rp)', 'Total Bayar (Rp)'];
    const sumRows = [['Tsamara Florist - Ringkasan Harian'], [], sumHeader];
    log.forEach(entry => {
      sumRows.push([
        entry.date,
        entry.time,
        entry.items.length,
        entry.subtotal,
        entry.diskon,
        entry.finalTotal
      ]);
    });
    const ws2 = XLSX.utils.aoa_to_sheet(sumRows);
    ws2['!cols'] = [{wch:18},{wch:8},{wch:12},{wch:16},{wch:14},{wch:16}];
    ['A','B','C','D','E','F'].forEach(col => {
      const cell = ws2[col + '3'];
      if (cell) cell.s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '52B788' } },
      };
    });
    XLSX.utils.book_append_sheet(wb, ws2, 'Ringkasan');

    const today = formatDateShort(getNow());
    XLSX.writeFile(wb, `TsamaraFlorist_Riwayat_${today}.xlsx`);
    showToast('📥 Riwayat diunduh!');
  }

  renderLog();
  renderPengeluaran();
  updatePenghasilanAuto();

  document.getElementById('itemPrice').addEventListener('keydown', e => {
    if (e.key === 'Enter') addItem();
  });
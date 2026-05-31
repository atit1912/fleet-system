// ============================================================
// report-bulk.js — Bulk Export (Excel + PDF) สำหรับ report.html
// วิธีใช้: เพิ่ม <script src="report-bulk.js"></script>
//          ก่อน </body> ใน report.html
// ============================================================

(function(){

// ── CSS inject ──
var style = document.createElement('style');
style.textContent = [
  '.vsel-chk{position:absolute;top:6px;left:6px;width:18px;height:18px;cursor:pointer;accent-color:var(--p600);z-index:2;}',
  '.vsel-card{position:relative;}',
  '.vsel-card.checked{border-color:var(--p600) !important;box-shadow:0 0 0 2px var(--p300) !important;}',
  '.bulk-bar{position:sticky;bottom:calc(var(--nav-h,56px) + 8px);z-index:90;background:var(--p600);color:#fff;border-radius:16px;padding:12px 16px;display:flex;align-items:center;gap:10px;box-shadow:0 4px 20px rgba(11,94,215,.4);margin:12px 0;}',
  '.bulk-bar.hidden{display:none;}',
  '.bulk-bar-count{font-size:13px;font-weight:600;flex:1;}',
  '.bulk-bar-btn{background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.4);color:#fff;padding:7px 14px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;}',
  '.bulk-bar-btn:hover{background:rgba(255,255,255,.35);}',
  '.bulk-bar-clear{background:none;border:none;color:rgba(255,255,255,.7);font-size:22px;cursor:pointer;padding:0 4px;line-height:1;}',
  '@media print{.bulk-bar{display:none!important;}}'
].join('\n');
document.head.appendChild(style);

// ── Bulk bar HTML inject (หลัง vsel-wrap) ──
function injectBulkBar() {
  var vselWrap = document.getElementById('vsel-wrap');
  if (!vselWrap || document.getElementById('bulk-bar')) return;
  var bar = document.createElement('div');
  bar.className = 'bulk-bar hidden';
  bar.id = 'bulk-bar';
  bar.innerHTML = '<div class="bulk-bar-count" id="bulk-count">เลือก 0 คัน</div>'
    + '<button class="bulk-bar-btn" onclick="exportAllExcel()">📊 Excel รวม</button>'
    + '<button class="bulk-bar-btn" onclick="exportAllPDF()">📄 PDF ทีละคัน</button>'
    + '<button class="bulk-bar-clear" onclick="clearSelection()" title="ยกเลิก">×</button>';
  vselWrap.parentNode.insertBefore(bar, vselWrap.nextSibling);
}

// ── Patch renderVselGrid หลัง load ──
// ดัก MutationObserver เพื่อเพิ่ม checkbox เมื่อการ์ดรถถูก render
var observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(m) {
    m.addedNodes.forEach(function(node) {
      if (node.nodeType !== 1) return;
      // หา vsel-card ที่ยังไม่มี checkbox
      var cards = node.querySelectorAll ? node.querySelectorAll('.vsel-card') : [];
      if (!cards.length && node.classList && node.classList.contains('vsel-card')) cards = [node];
      cards.forEach(function(card) {
        if (card.querySelector('.vsel-chk')) return; // มีแล้ว
        var idx = card.id ? card.id.replace('vs-','') : null;
        if (idx === null) return;
        var chk = document.createElement('input');
        chk.type = 'checkbox';
        chk.className = 'vsel-chk';
        chk.id = 'chk-' + idx;
        chk.onclick = function(e) { window.toggleCheck(parseInt(idx), e); };
        card.insertBefore(chk, card.firstChild);
      });
    });
  });
  injectBulkBar();
});

document.addEventListener('DOMContentLoaded', function() {
  var wrap = document.getElementById('vsel-wrap');
  if (wrap) observer.observe(wrap, {childList: true, subtree: true});
  injectBulkBar();
});

// ── State ──
var selectedIds = {};

window.toggleCheck = function(idx, e) {
  e.stopPropagation();
  var vehicles = window.allVehicles || [];
  var v = vehicles[idx];
  if (!v) return;
  var card = document.getElementById('vs-' + idx);
  var chk  = document.getElementById('chk-' + idx);
  if (selectedIds[v.id]) {
    delete selectedIds[v.id];
    if (card) card.classList.remove('checked');
    if (chk)  chk.checked = false;
  } else {
    selectedIds[v.id] = v;
    if (card) card.classList.add('checked');
    if (chk)  chk.checked = true;
  }
  updateBulkBar();
};

window.updateBulkBar = function() {
  var count = Object.keys(selectedIds).length;
  var countEl = document.getElementById('bulk-count');
  var bar     = document.getElementById('bulk-bar');
  if (countEl) countEl.textContent = 'เลือก ' + count + ' คัน';
  if (bar) bar.classList[count > 0 ? 'remove' : 'add']('hidden');
};

window.clearSelection = function() {
  selectedIds = {};
  document.querySelectorAll('.vsel-card').forEach(function(c) { c.classList.remove('checked'); });
  document.querySelectorAll('.vsel-chk').forEach(function(c)  { c.checked = false; });
  updateBulkBar();
};

// ── Helpers ──
var MS = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
function tD(s) {
  if (!s) return '—';
  try { var d = new Date(s); return d.getDate() + ' ' + MS[d.getMonth()] + ' ' + (d.getFullYear()+543); }
  catch(e) { return s; }
}
var SL = {OVERDUE:'เกินกำหนด', DUE_SOON:'ใกล้ถึง', APPOINTED:'นัดหมาย', NORMAL:'ปกติ'};
var TL = {
  INITIAL_1000KM:'ตรวจเช็ก 1,000 กม.',
  ROUTINE_10K:'ตรวจเช็กระยะ',
  TIRE_ROTATION:'สลับยาง',
  TIRE_REPLACEMENT:'เปลี่ยนยาง',
  BATTERY_REPLACEMENT:'เปลี่ยนแบตเตอรี่'
};
var TK = ['INITIAL_1000KM','ROUTINE_10K','TIRE_ROTATION','TIRE_REPLACEMENT','BATTERY_REPLACEMENT'];

// ── Export Excel รวม ──
window.exportAllExcel = function() {
  var ids = Object.keys(selectedIds);
  if (!ids.length) { alert('กรุณาเลือกรถก่อน'); return; }
  if (typeof XLSX === 'undefined') { alert('XLSX library ยังไม่โหลด'); return; }

  var wb = XLSX.utils.book_new();

  // Sheet 1: สรุปทุกคัน
  var sRows = [
    ['Intelligent Fleet SHE&En — รายงานสรุปสถานะรถยนต์'],
    ['วันที่: ' + tD(new Date().toISOString())],
    ['จำนวนรถที่เลือก: ' + ids.length + ' คัน'],
    [],
    ['ทะเบียน','ศูนย์วิจัย','เลขไมล์','สถานะรวม','ตรวจ 1,000','ตรวจระยะ','สลับยาง','เปลี่ยนยาง','แบตเตอรี่','บริการล่าสุด']
  ];
  ids.forEach(function(vid) {
    var v = selectedIds[vid];
    var maint = v.maintenance || [];
    var row = [
      v.plate_number,
      v.center_name || '',
      Number(v.current_mileage || 0).toLocaleString() + ' กม.',
      SL[v.worstStatus || 'NORMAL'] || v.worstStatus || '—'
    ];
    TK.forEach(function(type) {
      var m = maint.find(function(x) { return x.type === type; });
      row.push(m ? (SL[m.status] || m.status) : '—');
    });
    // บริการล่าสุด
    var lastSvc = '—';
    if (v.serviceRecords && v.serviceRecords.length) {
      var sr = v.serviceRecords.slice().sort(function(a,b){ return new Date(b.serviced_at)-new Date(a.serviced_at); });
      lastSvc = tD(sr[0].serviced_at);
    }
    row.push(lastSvc);
    sRows.push(row);
  });
  var ws0 = XLSX.utils.aoa_to_sheet(sRows);
  ws0['!cols'] = [{wch:14},{wch:20},{wch:12},{wch:12},{wch:12},{wch:12},{wch:10},{wch:12},{wch:12},{wch:14}];
  ws0['!merges'] = [{s:{r:0,c:0},e:{r:0,c:9}},{s:{r:1,c:0},e:{r:1,c:9}},{s:{r:2,c:0},e:{r:2,c:9}}];
  XLSX.utils.book_append_sheet(wb, ws0, 'สรุปทุกคัน');

  // Sheet รายคัน
  ids.forEach(function(vid) {
    var v = selectedIds[vid];
    var rows = [
      ['รายงาน — ' + v.plate_number],
      [(v.brand||'') + ' ' + (v.model||'') + ' | ' + (v.center_name||'')],
      [],
      ['ประเภท', 'สถานะ', 'กำหนดถัดไป', 'คงเหลือ']
    ];
    (v.maintenance || []).forEach(function(m) {
      rows.push([
        TL[m.type] || m.type,
        SL[m.status] || m.status,
        m.dueDate ? tD(m.dueDate) : (m.dueMileage ? Number(m.dueMileage).toLocaleString()+' กม.' : '—'),
        m.remainingDays != null
          ? (m.remainingDays < 0 ? 'เกิน ' + Math.abs(m.remainingDays) + ' วัน' : 'อีก ' + m.remainingDays + ' วัน')
          : '—'
      ]);
    });
    var ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{wch:28},{wch:14},{wch:16},{wch:14}];
    ws['!merges'] = [{s:{r:0,c:0},e:{r:0,c:3}},{s:{r:1,c:0},e:{r:1,c:3}}];
    var name = v.plate_number.replace(/[\/:?*\[\]\\]/g,'').substring(0,31);
    XLSX.utils.book_append_sheet(wb, ws, name || ('veh'+vid.substring(0,8)));
  });

  XLSX.writeFile(wb, 'fleet_summary_' + new Date().toISOString().split('T')[0] + '.xlsx');
};

// ── Export PDF ทีละคัน ──
window.exportAllPDF = function() {
  var ids = Object.keys(selectedIds);
  if (!ids.length) { alert('กรุณาเลือกรถก่อน'); return; }
  if (!confirm('จะ print ' + ids.length + ' หน้าต่อกัน\nกด OK เพื่อเริ่ม')) return;
  var i = 0;
  var vehicles = window.allVehicles || [];
  function next() {
    if (i >= ids.length) return;
    var v = selectedIds[ids[i]]; i++;
    var idx = vehicles.findIndex(function(x){ return x.id === v.id; });
    if (idx < 0) { next(); return; }
    if (typeof selectVehicle === 'function') selectVehicle(idx);
    setTimeout(function() {
      if (typeof showRptTab === 'function') {
        var tabs = document.querySelectorAll('.rpt-tab');
        if (tabs.length) showRptTab('hist', tabs[0]);
      }
      var t = document.title;
      document.title = 'รายงาน ' + v.plate_number;
      window.print();
      document.title = t;
      setTimeout(next, 1200);
    }, 900);
  }
  next();
};

})();

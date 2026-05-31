// theme.js — Dark mode toggle (include ในทุกหน้า)
(function() {
  // โหลด theme ที่บันทึกไว้ทันที (ก่อน render เพื่อป้องกัน flash)
  var saved = localStorage.getItem('fleet-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  window.Theme = {
    toggle: function() {
      var current = document.documentElement.getAttribute('data-theme');
      var next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('fleet-theme', next);
      // อัปเดต icon ทุก toggle button
      document.querySelectorAll('.theme-toggle').forEach(function(btn) {
        btn.textContent = next === 'dark' ? '☀️' : '🌙';
        btn.title = next === 'dark' ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode';
      });
    },
    init: function() {
      // ตั้ง icon ให้ถูกต้องตาม theme ปัจจุบัน
      var current = document.documentElement.getAttribute('data-theme');
      document.querySelectorAll('.theme-toggle').forEach(function(btn) {
        btn.textContent = current === 'dark' ? '☀️' : '🌙';
        btn.title = current === 'dark' ? 'เปลี่ยนเป็น Light Mode' : 'เปลี่ยนเป็น Dark Mode';
      });
    }
  };

  // รัน init หลัง DOM โหลด
  document.addEventListener('DOMContentLoaded', function() {
    Theme.init();
  });
})();

// auth.js — session management (localStorage)
var Auth = {
  getUser: function() {
    try { return JSON.parse(localStorage.getItem('fleet_user')); } catch(e) { return null; }
  },
  setUser: function(user) { localStorage.setItem('fleet_user', JSON.stringify(user)); },
  logout:  function() { localStorage.removeItem('fleet_user'); window.location.href = 'login.html'; },
  isLoggedIn: function() { return !!this.getUser(); },
  hasRole: function(roles) {
    var user = this.getUser();
    if (!user) return false;
    return roles.indexOf(user.role) > -1;
  },

  // ── Permission helpers ──────────────────────────────────
  // เขียนข้อมูลได้ (CENTER_ADMIN ขึ้นไป)
  canWrite: function() {
    return this.hasRole(['CENTER_ADMIN', 'SUPER_ADMIN']);
  },
  // จัดการ system / user ได้ (SUPER_ADMIN เท่านั้น)
  isSuperAdmin: function() {
    return this.hasRole(['SUPER_ADMIN']);
  },
  // ดูข้อมูลได้ทุกศูนย์ (MANAGER และ SUPER_ADMIN)
  canViewAll: function() {
    return this.hasRole(['SUPER_ADMIN', 'MANAGER']);
  }
};

function requireAuth() {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }
  var user = Auth.getUser();
  var el = document.getElementById('sidebar-user');
  if (el) el.innerHTML = '<strong>' + user.name + '</strong><br>' + roleLabel(user.role);
}

function roleLabel(role) {
  return {
    SUPER_ADMIN:  'Super Admin',
    CENTER_ADMIN: 'Admin ประจำศูนย์',
    DRIVER:       'ผู้ขับขี่',
    MANAGER:      'ผู้บริหาร'
  }[role] || role;
}

// ── Apply permissions to UI ─────────────────────────────
// เรียกหลัง DOMContentLoaded เพื่อซ่อน/แสดง element ตาม role
// ใช้ class "write-only" บนปุ่ม/element ที่เฉพาะ admin เขียนได้
// ใช้ class "superadmin-only" บน element ที่ super admin เท่านั้น
function applyPermissions() {
  var canWrite     = Auth.canWrite();
  var isSuperAdmin = Auth.isSuperAdmin();

  // ซ่อน element ที่ต้องการสิทธิ์เขียน
  document.querySelectorAll('.write-only').forEach(function(el) {
    el.style.display = canWrite ? '' : 'none';
  });

  // ซ่อน element ที่ต้องการสิทธิ์ super admin
  document.querySelectorAll('.superadmin-only').forEach(function(el) {
    el.style.display = isSuperAdmin ? '' : 'none';
  });
}

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
  }
};

function requireAuth() {
  if (!Auth.isLoggedIn()) { window.location.href = 'login.html'; return; }
  var user = Auth.getUser();
  var el = document.getElementById('sidebar-user');
  if (el) el.innerHTML = '<strong>' + user.name + '</strong><br>' + roleLabel(user.role);
}

function roleLabel(role) {
  return { SUPER_ADMIN: 'Super Admin', CENTER_ADMIN: 'Admin ประจำศูนย์', DRIVER: 'ผู้ขับขี่', MANAGER: 'ผู้บริหาร' }[role] || role;
}

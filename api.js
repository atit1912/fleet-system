// api.js — wrapper เรียก GAS endpoint
// GAS Web App ไม่รองรับ POST cross-origin → ใช้ GET ทุก request
var API = {
  call: function(action, params) {
    var url = new URL(GAS_URL);
    url.searchParams.set('action', action);
    if (params) {
      Object.keys(params).forEach(function(k) {
        if (params[k] != null) url.searchParams.set(k, params[k]);
      });
    }
    return fetch(url.toString())
      .then(function(r) { return r.json(); })
      .catch(function(err) {
        console.error('API error:', err);
        return { error: err.message };
      });
  },

  // post() → แปลงเป็น GET โดย flatten body เป็น query params
  // GAS รับได้ทั้งหมดผ่าน e.parameter
  post: function(action, body) {
    var url = new URL(GAS_URL);
    url.searchParams.set('action', action);
    if (body) {
      Object.keys(body).forEach(function(k) {
        if (body[k] != null) url.searchParams.set(k, body[k]);
      });
    }
    return fetch(url.toString())
      .then(function(r) { return r.json(); })
      .catch(function(err) {
        console.error('API error:', err);
        return { error: err.message };
      });
  }
};

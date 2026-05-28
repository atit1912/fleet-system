// api.js — wrapper เรียก GAS endpoint
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
      .catch(function(err) { console.error('API error:', err); return { error: err.message }; });
  },

  post: function(action, body) {
    body.action = action;
    return fetch(GAS_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })
    .then(function(r) { return r.json(); })
    .catch(function(err) { console.error('API error:', err); return { error: err.message }; });
  }
};

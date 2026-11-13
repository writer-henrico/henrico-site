/* Comportamento do site no navegador do leitor. As escolhas ficam salvas só no navegador dele. */
(function () {
  var H = document.documentElement;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var FONTS = {
    "Fraunces": "'Fraunces',Georgia,serif", "Cormorant Garamond": "'Cormorant Garamond',Georgia,serif",
    "Spectral": "'Spectral',Georgia,serif", "Jost": "'Jost',system-ui,sans-serif", "Literata": "'Literata',Georgia,serif", "Figtree": "'Figtree',system-ui,sans-serif"
  };
  function get(k, d) { try { return localStorage.getItem(k) || d; } catch (e) { return d; } }
  function put(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  /* ---- idioma ---- */
  function setLang(l) {
    put("hc-lang", l);
    H.dataset.lang = l;
    H.lang = l === "en" ? "en" : "pt-BR";
    $$(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.l === l)); });
    $$("[data-ph-" + l + "]").forEach(function (i) { i.placeholder = i.getAttribute("data-ph-" + l); });
    var m = $("#msg"); if (m) m.textContent = "";
  }
  $$(".lang button").forEach(function (b) { b.onclick = function () { setLang(b.dataset.l); }; });
  setLang(get("hc-lang", "pt"));

  /* ---- tema da história (só nas páginas de história e leitura) ---- */
  var themed = H.dataset.themed === "1", slug = H.dataset.story, orig = H.getAttribute("style") || "";
  function allOv() { try { return JSON.parse(get("hc-ov", "{}")); } catch (e) { return {}; } }
  function applyOv() {
    if (!themed) return;
    H.setAttribute("style", orig);
    var sz = get("hc-size", ""); if (sz) H.style.setProperty("--rs", sz + "px");
    var o = allOv()[slug] || {};
    if (o.f && FONTS[o.f]) H.style.setProperty("--serif", FONTS[o.f]);
    if (o.b && FONTS[o.b]) H.style.setProperty("--body", FONTS[o.b]);
    ["d", "l"].forEach(function (p) {
      var x = o[p] || {};
      if (x.bg) {
        H.style.setProperty("--" + p + "-bg", x.bg);
        H.style.setProperty("--" + p + "-bg2", "color-mix(in srgb," + x.bg + (p === "l" ? " 90%,#000)" : " 86%,#fff)"));
      }
      if (x.ac) H.style.setProperty("--" + p + "-ac", x.ac);
    });
    if (o.st !== undefined) { H.style.setProperty("--d-st", o.st); H.style.setProperty("--l-st", o.st); }
  }
  function hex(v) {
    var c = document.createElement("canvas").getContext("2d");
    c.fillStyle = "#000000"; c.fillStyle = v;
    return /^#[0-9a-f]{6}$/i.test(c.fillStyle) ? c.fillStyle : "#000000";
  }
  function panel() {
    var box = $("#cust"); if (!box) return;
    box.hidden = false;
    var m = H.dataset.mode === "light" ? "l" : "d", o = allOv()[slug] || {}, cs = getComputedStyle(H);
    var norm = function (t) { return String(t).replace(/["']/g, ""); };
    function current(prop, saved) {
      if (saved) return saved;
      var v = norm(cs.getPropertyValue(prop));
      return Object.keys(FONTS).filter(function (k) { return v.indexOf(norm(FONTS[k].split(",")[0])) > -1; })[0];
    }
    function fill(sel, cur) {
      sel.innerHTML = Object.keys(FONTS).map(function (k) { return '<option value="' + k + '"' + (k === cur ? " selected" : "") + ">" + k + "</option>"; }).join("");
    }
    fill($("#cf"), current("--serif", o.f));
    fill($("#cf2"), current("--body", o.b));
    $("#cb").value = hex(cs.getPropertyValue("--" + m + "-bg").trim());
    $("#ca").value = hex(cs.getPropertyValue("--" + m + "-ac").trim());
    $("#cs").checked = parseFloat(cs.getPropertyValue("--d-st")) > 0;
    function set(fn) { var a = allOv(), x = a[slug] || {}; fn(x); a[slug] = x; put("hc-ov", JSON.stringify(a)); applyOv(); }
    $("#cf").onchange = function () { var v = this.value; set(function (x) { x.f = v; }); };
    $("#cf2").onchange = function () { var v = this.value; set(function (x) { x.b = v; }); };
    $("#cb").oninput = function () { var v = this.value; set(function (x) { x[m] = x[m] || {}; x[m].bg = v; }); };
    $("#ca").oninput = function () { var v = this.value; set(function (x) { x[m] = x[m] || {}; x[m].ac = v; }); };
    $("#cs").onchange = function () { var v = this.checked ? 0.85 : 0; set(function (x) { x.st = v; }); };
    $("#cr").onclick = function () { var a = allOv(); delete a[slug]; put("hc-ov", JSON.stringify(a)); applyOv(); panel(); };
  }

  /* ---- leitor: tamanho do texto e modo claro/escuro ---- */
  $$("[data-act]").forEach(function (b) {
    b.onclick = function () {
      var act = b.dataset.act;
      if (act === "mode") {
        var m = H.dataset.mode === "light" ? "dark" : "light";
        put("hc-mode", m); H.dataset.mode = m; applyOv(); panel();
      } else {
        var n = parseInt(get("hc-size", "20"), 10) + (act === "bigger" ? 2 : -2);
        n = Math.max(16, Math.min(30, n)); put("hc-size", n); H.style.setProperty("--rs", n + "px"); orig = orig.replace(/--rs:[^;]*;?/, "");
      }
    };
  });
  applyOv();
  panel();

  /* ---- newsletter (enquanto não houver serviço ligado) ---- */
  var nf = $("#nf");
  if (nf && !nf.getAttribute("action")) {
    nf.onsubmit = function (e) {
      e.preventDefault();
      $("#msg").textContent = nf.getAttribute("data-soon-" + (H.dataset.lang === "en" ? "en" : "pt"));
    };
  }
})();

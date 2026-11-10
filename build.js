// Gerador do site de Henrico Campos.
// Sem dependências: roda com `node build.js` e escreve tudo na pasta /public.
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "public");
const site = JSON.parse(fs.readFileSync(path.join(ROOT, "site.json"), "utf8"));
const BASE = site.base || "/";
const url = (p = "") => BASE + String(p).replace(/^\//, "");
const abs = (p = "") => site.url.replace(/\/$/, "") + url(p);

/* ---------- utilidades ---------- */
const esc = s => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const read = f => fs.readFileSync(f, "utf8");
const write = (rel, data) => {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
};

/* ---------- leitor de front matter (YAML simples) ---------- */
function scalar(v) {
  v = v.trim();
  if (v === "" || v === "null" || v === "~") return "";
  if (/^".*"$/.test(v)) return v.slice(1, -1).replace(/\\"/g, '"');
  if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^(0|-?[1-9]\d*)(\.\d+)?$/.test(v)) return Number(v);
  if (v[0] === "[" && v.endsWith("]")) return v.slice(1, -1).split(",").map(scalar).filter(x => x !== "");
  return v;
}
function parseYaml(src) {
  const lines = src.replace(/\r/g, "").split("\n").filter(l => l.trim() && !l.trim().startsWith("#"));
  let i = 0;
  const ind = l => l.search(/\S/);
  function block(indent) {
    if (lines[i].trim().startsWith("- ")) {
      const arr = [];
      while (i < lines.length && ind(lines[i]) === indent && lines[i].trim().startsWith("- ")) {
        arr.push(scalar(lines[i].trim().slice(2)));
        i++;
      }
      return arr;
    }
    const obj = {};
    while (i < lines.length) {
      const l = lines[i];
      if (ind(l) < indent) break;
      const m = l.trim().match(/^([^:]+?):(?:\s+(.*))?$/);
      i++;
      if (!m) continue;
      const key = m[1].trim(), val = (m[2] || "").trim();
      if (/^[|>][-+]?$/.test(val)) {
        const parts = [];
        while (i < lines.length && ind(lines[i]) > indent) parts.push(lines[i++].trim());
        obj[key] = parts.join(val[0] === "|" ? "\n" : " ");
      } else if (val === "") {
        if (i < lines.length && ind(lines[i]) > indent) obj[key] = block(ind(lines[i]));
        else if (i < lines.length && ind(lines[i]) === indent && lines[i].trim().startsWith("- ")) obj[key] = block(indent);
        else obj[key] = "";
      } else obj[key] = scalar(val);
    }
    return obj;
  }
  return lines.length ? block(ind(lines[0])) : {};
}
function parseDoc(src) {
  const m = src.replace(/^\uFEFF/, "").match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { data: parseYaml(m[1]), body: m[2] } : { data: {}, body: src };
}

/* ---------- Markdown mínimo (parágrafos, itálico, negrito, quebra de cena) ---------- */
const inline = s => esc(s)
  .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
  .replace(/(^|[^*\w])\*(?!\s)(.+?)(?<!\s)\*(?!\*)/g, "$1<em>$2</em>")
  .replace(/(^|[\s(])_(?!\s)(.+?)(?<!\s)_(?=[\s).,!?:;]|$)/g, "$1<em>$2</em>");
function md(body, ornament) {
  return body.replace(/\r/g, "").split(/\n{2,}/).map(b => b.trim()).filter(Boolean).map(b => {
    if (/^(-{3,}|\*\s?\*\s?\*|[—–-]+\s*❦\s*[—–-]+|~)$/.test(b)) return `<p class="brk">${esc(ornament)}</p>`;
    const h = b.match(/^(#{1,3})\s+(.*)$/);
    if (h) return `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
    return `<p>${inline(b).replace(/\n/g, "<br>")}</p>`;
  }).join("\n");
}
const words = s => (s.match(/\S+/g) || []).length;

/* ---------- textos da interface (PT / EN) ---------- */
const UI = {
  pt: {
    livros: "Livros", oneshots: "One-shots", livro1: "Livro", oneshot1: "One-shot", sobre: "Sobre", last: "Atualizada por último", cont: "Continuar lendo",
    upd: "Atualizações recentes", start: "Por onde começar", read: "Ler agora", explore: "Explorar",
    bkDesc: "Histórias longas, com capítulos.", osDesc: "Histórias curtas, de uma sentada.",
    andamento: "Em andamento", completo: "Completo", begin: "Começar a ler", toc: "Capítulos", chapter: "Capítulo",
    prev: "Anterior", next: "Próximo", back: "Voltar à história", noen: "Este capítulo ainda não tem tradução para o inglês.",
    soonCh: "Capítulos em breve.", warn: "Avisos de conteúdo", newCh: "Novo capítulo", updated: "Atualizada em",
    published: "publicado em", minutes: "leitura de cerca de {n} minutos", nl: "Receba o próximo capítulo.",
    nlp: "Um aviso quando houver história nova. Sem spam.", nlph: "Seu melhor e-mail", nlb: "Quero receber",
    nlsoon: "O cadastro de e-mail ainda não está ligado a um serviço.", lightMode: "Modo claro", darkMode: "Modo escuro",
    pers: "Personalizar", font: "Fonte", bg: "Fundo", accent: "Destaque", stars: "Estrelas", reset: "Restaurar",
    nothing: "Nada por aqui ainda.", notfound: "Página não encontrada.", home: "Voltar ao início"
  },
  en: {
    livros: "Books", oneshots: "One-shots", livro1: "Book", oneshot1: "One-shot", sobre: "About", last: "Last updated", cont: "Keep reading",
    upd: "Recent updates", start: "Where to start", read: "Read now", explore: "Explore",
    bkDesc: "Long stories, told in chapters.", osDesc: "Short stories, read in one sitting.",
    andamento: "In progress", completo: "Complete", begin: "Start reading", toc: "Chapters", chapter: "Chapter",
    prev: "Previous", next: "Next", back: "Back to the story", noen: "This chapter doesn’t have an English translation yet.",
    soonCh: "Chapters coming soon.", warn: "Content warnings", newCh: "New chapter", updated: "Updated on",
    published: "published on", minutes: "about a {n}-minute read", nl: "Get the next chapter.",
    nlp: "A heads-up when there’s a new story. No spam.", nlph: "Your best email", nlb: "Sign me up",
    nlsoon: "The email signup isn’t connected to a service yet.", lightMode: "Light mode", darkMode: "Dark mode",
    pers: "Customize", font: "Font", bg: "Background", accent: "Accent", stars: "Stars", reset: "Reset",
    nothing: "Nothing here yet.", notfound: "Page not found.", home: "Back to home"
  }
};
// bi() gera os dois idiomas; o CSS mostra só o escolhido pelo leitor.
const bi = (pt, en, tag = "span") => (en && en !== pt)
  ? `<${tag} lang="pt">${pt}</${tag}><${tag} lang="en">${en}</${tag}>` : `<${tag}>${pt}</${tag}>`;
const T = key => bi(esc(UI.pt[key]), esc(UI.en[key]));
const fmt = (d, lang) => {
  const dt = new Date(String(d).slice(0, 10) + "T12:00:00");
  return isNaN(dt) ? "" : dt.toLocaleDateString(lang === "pt" ? "pt-BR" : "en-US", { day: "numeric", month: "short", year: "numeric" });
};
const date2 = d => bi(esc(fmt(d, "pt")), esc(fmt(d, "en")));

/* ---------- temas por história ---------- */
const FONTS = {
  "Fraunces": "'Fraunces',Georgia,serif", "Cormorant Garamond": "'Cormorant Garamond',Georgia,serif",
  "Spectral": "'Spectral',Georgia,serif", "Jost": "'Jost',system-ui,sans-serif", "Literata": "'Literata',Georgia,serif"
};
const toRgb = hex => { const n = parseInt(hex.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const darken = (hex, f) => "#" + toRgb(hex).map(v => Math.round(v * f).toString(16).padStart(2, "0")).join("");
const onColor = hex => { const [r, g, b] = toRgb(hex); return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? "#14121f" : "#ffffff"; };
const isHex = v => /^#[0-9a-f]{6}$/i.test(v || "");
function themeVars(s) {
  const t = s.theme || {};
  const acc = isHex(s.color) ? s.color : "#f2b365";
  const D = { bg: "#070b26", ink: "#f2efe9", muted: "#aab0d0", accent: acc, ...(t.dark || {}) };
  const L = { bg: "#f5ecd6", ink: "#1c2252", muted: "#5b6088", accent: darken(acc, 0.72), ...(t.light || {}) };
  const mix = (o, light) => o.bg2 || `color-mix(in srgb,${o.bg} ${light ? 90 : 86}%,${light ? "#000" : "#fff"})`;
  const v = {
    "--d-bg": D.bg, "--d-bg2": mix(D, 0), "--d-ink": D.ink, "--d-mu": D.muted, "--d-ac": D.accent, "--d-on": onColor(D.accent),
    "--d-st": t.stars === false ? 0 : 0.85,
    "--l-bg": L.bg, "--l-bg2": mix(L, 1), "--l-ink": L.ink, "--l-mu": L.muted, "--l-ac": L.accent, "--l-on": onColor(L.accent), "--l-st": 0
  };
  if (FONTS[t.font]) v["--serif"] = FONTS[t.font];
  return Object.entries(v).map(([k, x]) => `${k}:${x}`).join(";");
}

/* ---------- carregar conteúdo ---------- */
function loadStories() {
  const dir = path.join(ROOT, "content/stories");
  const list = fs.readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory() && fs.existsSync(path.join(dir, d.name, "index.md"))).map(d => {
    const sd = path.join(dir, d.name);
    const idx = parseDoc(read(path.join(sd, "index.md")));
    const s = { slug: d.name, ...idx.data, notes: idx.body.trim() };
    const theme = s.theme || {};
    s.ornament = theme.ornament || "❦";
    const groups = {};
    for (const f of fs.readdirSync(sd).filter(f => f.endsWith(".md") && f !== "index.md").sort()) {
      const m = f.match(/^(.+?)(?:\.(en))?\.md$/);
      (groups[m[1]] ||= { key: m[1] })[m[2] || "pt"] = parseDoc(read(path.join(sd, f)));
    }
    s.chapters = Object.values(groups).filter(c => c.pt).sort((a, b) => a.key.localeCompare(b.key)).map((c, i) => ({
      ...c, i, slug: c.key.replace(/^\d+-/, ""), title: c.pt.data.title || `Capítulo ${i + 1}`,
      titleEn: c.en?.data.title || "", number: String(c.pt.data.number ?? i + 1),
      date: String(c.pt.data.date || s.date || "").slice(0, 10), words: words(c.pt.body)
    }));
    s.updated = [s.date, ...s.chapters.map(c => c.date)].map(x => String(x || "").slice(0, 10)).sort().pop() || "";
    s.words = s.chapters.reduce((n, c) => n + c.words, 0);
    s.href = `historias/${s.slug}/`;
    return s;
  });
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

/* ---------- peças de HTML ---------- */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Figtree:wght@400;500&family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500;600&family=Spectral:wght@400;600&family=Literata:opsz,wght@7..72,400;500&display=swap";
const EARLY = `(function(){try{var d=document.documentElement,l=localStorage.getItem("hc-lang")||"pt";d.dataset.lang=l;d.lang=l==="en"?"en":"pt-BR";if(d.dataset.themed==="1"){d.dataset.mode=localStorage.getItem("hc-mode")||"dark"}var s=localStorage.getItem("hc-size");if(s)d.style.setProperty("--rs",s+"px")}catch(e){}})();`;

function cover(s, cls = "") {
  const c = isHex(s.color) ? s.color : "#f2b365";
  if (s.cover) return `<div class="cover ${cls}"><img src="${url(s.cover)}" alt=""></div>`;
  return `<div class="cover ${cls}" style="--c:${c}" aria-hidden="true">${esc(String(s.title).charAt(0))}</div>`;
}
const titleOf = s => bi(esc(s.title), esc(s.title_en));
const genreOf = s => bi(esc(s.genre), esc(s.genre_en));
const synOf = s => bi(esc(s.synopsis), esc(s.synopsis_en));
const kindKey = s => (s.kind === "livro" ? "livros" : "oneshots");
const kindHref = s => (s.kind === "livro" ? "livros/" : "one-shots/");
const statusOf = s => T(s.status === "andamento" ? "andamento" : "completo");
const minutes = s => Math.max(1, Math.round(s.words / 230));

function socials() {
  return (site.socials || []).filter(x => x.url).map(x => `<a href="${esc(x.url)}" target="_blank" rel="noopener me">${esc(x.name)}</a>`).join("");
}

function page({ title, desc, path: p, image, type = "website", body, story = null, nav = "", news = true, themed = false }) {
  const full = title ? `${title} — ${site.name}` : site.name;
  const description = desc || bi_plain(site.tagline);
  const img = image ? abs(image) : (site.ogImage ? abs(site.ogImage) : "");
  const style = story ? themeVars(story) : "";
  const a = k => (nav === k ? ' aria-current="page"' : "");
  const panel = themed ? `
<details id="cust" hidden><summary>${T("pers")}</summary><div class="cp">
<label>${T("font")}<select id="cf"></select></label>
<label>${T("bg")}<input type="color" id="cb"></label>
<label>${T("accent")}<input type="color" id="ca"></label>
<label>${T("stars")}<input type="checkbox" id="cs"></label>
<button id="cr" type="button">${T("reset")}</button></div></details>` : "";
  const newsletter = news ? `
<section class="wrap news" id="newsletter">
  <h2>${T("nl")}</h2><p class="hint">${T("nlp")}</p>
  <form id="nf" ${site.newsletter?.action ? `action="${esc(site.newsletter.action)}" method="post" target="_blank"` : ""} data-soon-pt="${esc(UI.pt.nlsoon)}" data-soon-en="${esc(UI.en.nlsoon)}">
    <input type="email" required name="${esc(site.newsletter?.field || "email")}" data-ph-pt="${esc(UI.pt.nlph)}" data-ph-en="${esc(UI.en.nlph)}" placeholder="${esc(UI.pt.nlph)}" aria-label="Email">
    <button class="btn" type="submit">${T("nlb")}</button>
  </form><p class="msg" id="msg" role="status"></p>
</section>` : "";
  return `<!DOCTYPE html>
<html lang="pt-BR" data-lang="pt" data-mode="dark" data-themed="${themed ? 1 : 0}"${story ? ` data-story="${esc(story.slug)}"` : ""}${style ? ` style="${esc(style)}"` : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${abs(p)}">
<meta property="og:site_name" content="${esc(site.name)}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${abs(p)}">
${img ? `<meta property="og:image" content="${esc(img)}">` : ""}
<meta name="twitter:card" content="${img ? "summary_large_image" : "summary"}">
<link rel="alternate" type="application/rss+xml" title="${esc(site.name)}" href="${url("feed.xml")}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E🌙%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_LINK}" rel="stylesheet">
<link rel="stylesheet" href="${url("style.css")}">
<script>${EARLY}</script>
</head>
<body>
<div class="stars"></div>
<header class="wrap">
  <a class="brand" href="${url()}">${esc(site.name)}</a>
  <nav>
    <a href="${url("livros/")}"${a("livros")}>${T("livros")}</a>
    <a href="${url("one-shots/")}"${a("one-shots")}>${T("oneshots")}</a>
    <a href="${url("sobre/")}"${a("sobre")}>${T("sobre")}</a>
    <div class="lang" role="group" aria-label="Idioma / Language"><button type="button" data-l="pt" aria-label="Português" aria-pressed="true">PT</button><button type="button" data-l="en" aria-label="English" aria-pressed="false">EN</button></div>
  </nav>
</header>
<main class="wrap">
${body}
</main>
${newsletter}
<footer class="wrap"><span>${bi(esc(site.footer.pt), esc(site.footer.en))}</span><div class="soc">${socials()}</div><small>© ${new Date().getFullYear()} ${esc(site.name)}</small></footer>
${panel}
<div id="toast" role="status"></div>
<script src="${url("app.js")}"></script>
</body>
</html>`;
}
const bi_plain = o => o.pt;

/* ---------- páginas ---------- */
function featureCard(s, noteHtml, btnKey, href) {
  return `<div class="feature">${cover(s)}<div>
<h3>${titleOf(s)}</h3><p class="sub">${genreOf(s)}, ${T(s.kind === "livro" ? "livro1" : "oneshot1")}</p><p class="d">${synOf(s)}</p>${noteHtml}
<a class="btn" href="${url(href)}">${T(btnKey)}</a></div></div>`;
}
function homePage(stories) {
  const withDate = stories.some(s => s.chapters.length) ? stories.filter(s => s.chapters.length) : stories.filter(s => s.updated);
  const last = [...withDate].sort((a, b) => b.updated.localeCompare(a.updated))[0] || stories[0];
  const latestCh = s => s.chapters[s.chapters.length - 1];
  const lastNote = (() => {
    const c = last && latestCh(last);
    return c ? `<p class="upnote">${T("newCh")}, ${c.date ? date2(c.date) : ""}</p>` : `<p class="upnote">${T("updated")} ${date2(last.updated)}</p>`;
  })();
  const lastHref = last && (last.chapters.length ? `${last.href}${latestCh(last).slug}/` : last.href);
  const rec = stories.find(s => s.start) || stories.find(s => s.kind === "oneshot" && s.status === "completo") || stories[0];
  const recNote = `<p class="upnote">${bi(esc(UI.pt.minutes.replace("{n}", minutes(rec))), esc(UI.en.minutes.replace("{n}", minutes(rec))))}</p>`;
  const recHref = rec.chapters.length ? `${rec.href}${rec.chapters[0].slug}/` : rec.href;
  const ups = stories.filter(s => s !== last && s.chapters.length).sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 4).map(s => {
    const c = latestCh(s);
    const what = c ? bi(esc(`${UI.pt.newCh}: ${c.title}`), esc(`${UI.en.newCh}: ${c.titleEn || c.title}`)) : T("updated");
    return `<li><a href="${url(s.href)}"><b>${titleOf(s)}</b></a><span class="w">${what}</span><span>${date2(c ? c.date : s.updated)}</span></li>`;
  }).join("");
  const nb = stories.filter(s => s.kind === "livro").length, no = stories.length - nb;
  const body = `
<div class="hero"><h1>${bi(esc(site.tagline.pt), esc(site.tagline.en))}</h1><p>${bi(esc(site.subtitle.pt), esc(site.subtitle.en))}</p></div>
<section><p class="lbl">${T("last")}</p>${featureCard(last, lastNote, "cont", lastHref)}</section>
${ups ? `<section><h2>${T("upd")}</h2><ul class="upd">${ups}</ul></section>` : ""}
<section><p class="lbl">${T("start")}</p>${featureCard(rec, recNote, "read", recHref)}</section>
<section><h2>${T("explore")}</h2><div class="browse">
<a href="${url("livros/")}"><strong>${T("livros")}</strong><span>${T("bkDesc")} (${nb})</span></a>
<a href="${url("one-shots/")}"><strong>${T("oneshots")}</strong><span>${T("osDesc")} (${no})</span></a></div></section>`;
  write("index.html", page({ title: "", path: "", body }));
}
function shelfPage(stories, kind) {
  const isBook = kind === "livro", key = isBook ? "livros" : "oneshots", slug = isBook ? "livros" : "one-shots";
  const items = stories.filter(s => s.kind === kind).sort((a, b) => b.updated.localeCompare(a.updated));
  const rows = items.map(s => {
    const c = s.chapters[s.chapters.length - 1];
    return `<div class="row">${cover(s)}<div>
<h3><a href="${url(s.href)}">${titleOf(s)}</a><span class="badge">${statusOf(s)}</span></h3>
<p class="sub">${genreOf(s)}${s.updated ? `, ${T("updated")} ${date2(s.updated)}` : ""}</p><p>${synOf(s)}</p></div></div>`;
  }).join("");
  const body = `<div class="hero"><h1>${T(key)}</h1><p>${T(isBook ? "bkDesc" : "osDesc")}</p></div><div class="list">${rows || `<p class="hint">${T("nothing")}</p>`}</div>`;
  write(`${slug}/index.html`, page({ title: UI.pt[key], path: `${slug}/`, nav: slug, body }));
}
function storyPages(s) {
  const first = s.chapters[0];
  const list = s.chapters.map(c => `<li><a href="${url(`${s.href}${c.slug}/`)}"><span>${T("chapter")} ${esc(c.number)}</span><b>${bi(esc(c.title), esc(c.titleEn))}</b></a></li>`).join("");
  const warnings = Array.isArray(s.warnings) && s.warnings.length ? `<section><h2>${T("warn")}</h2><p class="hint">${bi(esc(s.warnings.join(", ")), esc((Array.isArray(s.warnings_en) && s.warnings_en.length ? s.warnings_en : s.warnings).join(", ")))}</p></section>` : "";
  const notes = s.notes ? `<section class="notes">${md(s.notes, s.ornament)}</section>` : "";
  const body = `<p class="crumb"><a href="${url(kindHref(s))}">${T(kindKey(s))}</a></p>
<div class="sp">${cover(s)}<div><h1>${titleOf(s)}<span class="badge">${statusOf(s)}</span></h1><p class="sub">${genreOf(s)}</p><p class="d">${synOf(s)}</p>
${first ? `<a class="btn" href="${url(`${s.href}${first.slug}/`)}">${T("begin")}</a>` : `<p class="hint">${T("soonCh")}</p>`}</div></div>
${warnings}${notes}
${first ? `<section><h2>${T("toc")}</h2><ol class="chl">${list}</ol></section>` : ""}`;
  write(`${s.href}index.html`, page({ title: s.title, desc: s.synopsis, path: s.href, image: s.cover, nav: kindHref(s).replace("/", ""), story: s, themed: true, body }));

  s.chapters.forEach((c, j) => {
    const prev = s.chapters[j - 1], next = s.chapters[j + 1];
    const nav = (x, k) => x ? `<a class="btn" href="${url(`${s.href}${x.slug}/`)}">${T(k)}</a>` : "<span></span>";
    const pt = `<div class="txt" lang="pt">${md(c.pt.body, s.ornament)}</div>`;
    const en = c.en ? `<div class="txt" lang="en">${md(c.en.body, s.ornament)}</div>` : `<p class="note" lang="en">${esc(UI.en.noen)}</p>`;
    const caps = (s.theme || {}).caps ? ' class="caps"' : "";
    const html = `<div class="reader"><div class="tools"><a href="${url(s.href)}">${T("back")}</a><span class="ctl">
<button type="button" data-act="smaller" aria-label="A-">A−</button><button type="button" data-act="bigger" aria-label="A+">A+</button>
<button type="button" data-act="mode"><span class="to-light">${T("lightMode")}</span><span class="to-dark">${T("darkMode")}</span></button></span></div>
<p class="kicker">${bi(esc(`${s.title}, capítulo ${c.number}`), esc(`${s.title_en || s.title}, chapter ${c.number}`))}</p>
<h1${caps}>${bi(esc(c.title), esc(c.titleEn))}</h1>
${pt}${en}
<div class="pn">${nav(prev, "prev")}${nav(next, "next")}</div></div>`;
    write(`${s.href}${c.slug}/index.html`, page({
      title: `${c.title}, ${s.title}`, desc: s.synopsis, path: `${s.href}${c.slug}/`, image: s.cover, type: "article",
      story: s, themed: true, news: false, body: html
    }));
  });
}
function aboutPage() {
  const load = f => fs.existsSync(path.join(ROOT, f)) ? parseDoc(read(path.join(ROOT, f))) : null;
  const pt = load("content/sobre.md"), en = load("content/sobre.en.md") || pt;
  if (!pt) return;
  const photo = site.photo ? `<img class="photo" src="${url(site.photo)}" alt="${esc(site.name)}">` : `<div class="photo" role="img" aria-label="${esc(site.name)}">${esc(site.name.split(" ").map(w => w[0]).join("").slice(0, 2))}</div>`;
  const body = `<div class="ab">${photo}<div><h1>${bi(esc(pt.data.title || "Sobre"), esc(en.data.title || pt.data.title))}</h1>
${bi(md(pt.body, "❦"), md(en.body, "❦"), "div")}<p class="soc">${socials()}</p></div></div>`;
  write("sobre/index.html", page({ title: UI.pt.sobre, desc: pt.data.description, path: "sobre/", nav: "sobre", body }));
}

/* ---------- extras: feed, sitemap, robots, 404 ---------- */
function extras(stories) {
  const items = stories.flatMap(s => s.chapters.map(c => ({ s, c }))).sort((a, b) => b.c.date.localeCompare(a.c.date)).slice(0, 30);
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${esc(site.name)}</title><link>${abs()}</link><description>${esc(site.subtitle.pt)}</description>
${items.map(({ s, c }) => `<item><title>${esc(`${s.title}: ${c.title}`)}</title><link>${abs(`${s.href}${c.slug}/`)}</link><guid>${abs(`${s.href}${c.slug}/`)}</guid>${c.date ? `<pubDate>${new Date(c.date + "T12:00:00Z").toUTCString()}</pubDate>` : ""}<description>${esc(s.synopsis || "")}</description></item>`).join("\n")}
</channel></rss>`;
  write("feed.xml", rss);
  const urls = ["", "livros/", "one-shots/", "sobre/", ...stories.flatMap(s => [s.href, ...s.chapters.map(c => `${s.href}${c.slug}/`)])];
  write("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${abs(u)}</loc></url>`).join("\n")}\n</urlset>`);
  write("robots.txt", `User-agent: *\nAllow: /\nSitemap: ${abs("sitemap.xml")}\n`);
  write(".nojekyll", "");
  write("404.html", page({ title: UI.pt.notfound, path: "404.html", news: false, body: `<div class="hero"><h1>${T("notfound")}</h1><p><a class="btn" href="${url()}">${T("home")}</a></p></div>` }));
}

/* ---------- executar ---------- */
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(ROOT, "static"), OUT, { recursive: true });
const stories = loadStories();
homePage(stories);
shelfPage(stories, "livro");
shelfPage(stories, "oneshot");
stories.forEach(storyPages);
aboutPage();
extras(stories);
const pages = stories.reduce((n, s) => n + 1 + s.chapters.length, 0);
console.log(`Site gerado em /public: ${stories.length} histórias, ${pages - stories.length} capítulos.`);

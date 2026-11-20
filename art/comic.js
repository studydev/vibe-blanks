// 웹툰 그리기 — 컷 + 말풍선 + 꼬리 + 에필로그 도식. art/comic.html(미리 보기)과 site/(조립)가 함께 쓴다.
// 필요한 전역: SHOTS(art/shots.data.js), LINES(art/lines.js). 말풍선 모양은 art/bubbles.css, 쪽·도식 모양은 art/comic.css.
//   Comic.pages(ep, {page})   → 그 화의 쪽 HTML (한 쪽 = 컷 4개, 2×2. 좁은 화면에서는 CSS 가 1열로)
//   Comic.layoutAll(root)     → 말풍선 자리와 꼬리를 그린다. 크기가 바뀌면 다시 부른다(이전 꼬리는 지움)
//   Comic.setAsset(fn)        → 그림 경로 바꾸기 ('cut/ep1-01.png' 같은 art/ 기준 경로를 받는다)
(function () {
const TITLE = {1: ['아까 버전이 더 나았는데', '빈칸 1 · 작업 이력 관리'], 2: ['파일은 집에 있다', '빈칸 2 · 개발의 연속성'], 3: ['링크가 안 열려', '빈칸 3 · 공개된 URL 배포'],
  4: ['의견이 쏟아진다', '빈칸 4 · 요구사항 관리'], 5: ['분명 고쳤는데 사라졌다', '빈칸 5 · 작업 공간 분리'], 6: ['여럿에게 나눠 맡기기', '빈칸 6 · 병렬 개발'],
  7: ['여행 전날 밤', '빈칸 7 · 자동 검증'], 8: ['노트북은 집에 있다', '빈칸 8 · 클라우드 개발 환경'], E: ['부산판 v1.0', '버전 릴리스']};
const NAME = {seoyun: '서윤', dohyun: '도현', sua: '수아', junho: '준호'};
const NUM = '①②③④⑤⑥⑦⑧⑨⑩';
const KEY = `<svg viewBox="0 0 24 24"><rect x="2" y="6" width="20" height="12" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><g fill="currentColor"><rect x="5" y="9" width="2" height="2"/><rect x="9" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/><rect x="17" y="9" width="2" height="2"/><rect x="7" y="13" width="10" height="2"/></g></svg>`;
// 그림 경로: 미리 보기(art/)에서는 원본 PNG, 사이트에서는 Comic.asset 을 바꿔 WebP 사본(site/img/)을 쓴다
let asset = p => p;
const file = (id, part = '') => { const [e, k] = id.split('-'); return asset(`cut/ep${e}-${k.padStart(2, '0')}${part}.png`); };
const fmt = t => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');

// ── 도식 컷 (에필로그 ④): 한 바퀴 그림 + 다 채워진 빈칸 여덟 개. 빈칸 이름은 01-brief 표와 같게 ──
const BLANKS = [['작업 이력 관리', 'commit'], ['개발의 연속성', '저장소 · MCP'], ['공개된 URL 배포', 'Pages'], ['요구사항 관리', 'Issues'],
  ['작업 공간 분리', 'Branch · PR'], ['병렬 개발', '여러 AI · Review'], ['자동 검증', 'Actions'], ['클라우드 개발 환경', 'Codespaces']];
const LOOP = [['의견', '단톡방'], ['이슈', '번호표'], ['브랜치 · AI', '나눠 맡김'], ['PR · 검사', '보고 확인'], ['합치기 · 배포', 'main · Pages'], ['쓰는 사람', '친구들 휴대폰']];
const DIAGRAM = {
  'E-4': () => {
    const R = 28, cx = 50, cy = 52;  // 고리: 컷 너비 기준 %
    const nodes = LOOP.map(([a, b], i) => { const t = -Math.PI / 2 + i * Math.PI * 2 / LOOP.length; return [cx + R * Math.cos(t), cy + R * 1.0 * Math.sin(t), a, b, i]; });
    const arrows = nodes.map(([x, y], i) => { const [x2, y2] = nodes[(i + 1) % nodes.length]; const mx = (x + x2) / 2, my = (y + y2) / 2, ox = (mx - cx) * 0.18, oy = (my - cy) * 0.18;
      return `<path d="M${x + (x2 - x) * 0.3} ${y + (y2 - y) * 0.3} Q${mx + ox} ${my + oy} ${x + (x2 - x) * 0.7} ${y + (y2 - y) * 0.7}" />`; }).join('');
    return `<svg class="loop" viewBox="0 0 100 150" preserveAspectRatio="none"><defs><marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0L10 5L0 10z" fill="#2F7BEA"/></marker></defs><g fill="none" stroke="#2F7BEA" stroke-width=".7" marker-end="url(#ah)">${arrows}</g></svg>
      <div class="hub">AI 는 잊어도<br>저장소는 기억한다</div>
      ${nodes.map(([x, y, a, b, i]) => `<div class="node${i === 0 || i === 5 ? ' people' : ''}" style="left:${x}%;top:${y / 1.5}%"><b>${a}</b><small>${b}</small></div>`).join('')}
      <div class="blanks">${BLANKS.map(([n, f], i) => `<div class="blank"><span class="no">${i + 1}</span><span class="nm">${n}</span><span class="fn">${f}</span></div>`).join('')}
        <div class="blank plus"><span class="no">+</span><span class="nm">버전 릴리스</span><span class="fn">Release</span></div></div>`;
  },
};
function panelHtml(s) {
  let inner;
  if (s.kind === 'split') {
    const xs = s.parts.map((_, i) => 'abc'[i]);
    const cls = s.layout === 'diag' ? 'diag' : s.layout === 'bands' ? 'bands' : 'split';
    inner = xs.map((x, i) => `<img${cls === 'diag' ? ` class="${'ab'[i]}"` : ''} src="${file(s.id, x)}" alt="" loading="lazy">`).join('');
    return `<div class="panel ${cls}" data-id="${s.id}">${inner}`;
  }
  if (s.kind === 'diagram') return `<div class="panel dia" data-id="${s.id}">${DIAGRAM[s.id]()}`;
  const src = s.kind === 'screen' ? file(s.id) : file(s.id);
  inner = `<img class="cut" src="${src}" alt="" loading="lazy"${s.kind === 'screen' ? ` onerror="this.onerror=null;this.src='${asset(`ui/shots/${s.screen}.png`)}'"` : ''}>`;
  if (s.labels) inner += s.labels.map(([x, y, txt, r = 0, cls = '']) => `<span class="lbl ${cls}" style="left:${x}%;top:${y}%;--r:${r}deg">${fmt(txt)}</span>`).join('');
  return `<div class="panel" data-id="${s.id}">${inner}`;
}
function bubbleHtml(b, s) {
  const who = b.who, c = who ? `var(--${who})` : '';
  const tag = who ? `<span class="tag${who === 'junho' ? ' dark' : ''}" style="--c:${c}">${NAME[who]}</span>` : '';
  switch (b.k) {
    case 'say': case 'tel': return `<div class="bub ${b.k}">${tag}${fmt(b.t)}</div>`;
    case 'think': return `<div class="bub think">${fmt(b.t)}</div>`;
    case 'nar': return `<div class="bub nar">${fmt(b.t)}</div>`;
    case 'in': return `<div class="bub in" style="--c:${c};color:#1d2433"><span style="color:${c}">${KEY}</span><span>${fmt(b.t)}</span></div>`;
    case 'ai': return `<div class="bub ai"><span class="star">✦</span>${fmt(b.t)}</div>`;
    case 'msg': return `<div class="bub msg">${fmt(b.t)}</div>`;
    case 'scr': return `<div class="bub scr">${fmt(b.t)}</div>`;
    case 'remote': {
      const [rw, n] = (s.remote || `${who}:1`).split(':');
      return `<div class="bub remote tail-bl" style="--c:var(--${rw});--tx:${b.tx || 50}%"><span class="tag${rw === 'junho' ? ' dark' : ''}">${NAME[rw]}</span><img class="face" src="${asset(`ref/face-${rw}-${n}.png`)}" alt=""><span>${fmt(b.t)}</span><span class="tail"><i></i><i></i><i></i></span></div>`;
    }
  }
  return '';
}
// 말풍선 자리: pos 가 있으면 그 자리, 없으면 위에서부터 차례로(내레이션·입력·메시지는 왼쪽, AI·점선은 오른쪽, 대사는 말하는 사람 쪽)
function layout(panel, items) {
  const W = panel.clientWidth, H = panel.clientHeight;
  let y = 0.025 * H;
  const els = [...panel.querySelectorAll('.bub')];
  els.forEach((el, i) => {
    const b = items[i];
    el.style.position = 'absolute';
    if (b.pos) {
      const [px, py] = b.pos;
      el.style.top = (py ? py / 100 * H : y) + 'px';
      if (px === 'r') el.style.right = 0.035 * W + 'px'; else el.style.left = px / 100 * W + 'px';
    } else {
      el.style.top = y + 'px';
      if (['ai', 'remote'].includes(b.k)) el.style.right = 0.035 * W + 'px';
      else if (['say', 'tel', 'think'].includes(b.k) && b.at) {
        const w = el.offsetWidth, cx = b.at[0] / 100 * W;
        el.style.left = Math.max(0.035 * W, Math.min(W - w - 0.035 * W, cx - w / 2)) + 'px';
      } else el.style.left = 0.035 * W + 'px';
    }
    if (!b.pos || !b.pos[1]) y = el.offsetTop + el.offsetHeight + 0.022 * H + (b.k === 'say' || b.k === 'tel' ? 0.02 * H : 0);
  });
  // 꼬리 (대사: 삼각형, 전화: 번개, 속마음: 작은 원)
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'tails'); svg.setAttribute('width', W); svg.setAttribute('height', H);
  els.forEach((el, i) => {
    const b = items[i];
    if (!b.at || !['say', 'tel', 'think'].includes(b.k)) return;
    const r = {l: el.offsetLeft, t: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight};
    const tx = b.at[0] / 100 * W, ty = b.at[1] / 100 * H;
    const below = ty > r.t + r.h;
    const bx = Math.max(r.l + r.w * 0.2, Math.min(r.l + r.w * 0.8, tx)), by = below ? r.t + r.h - 4 : r.t + 4;
    const dx = tx - bx, dy = ty - by, d = Math.hypot(dx, dy);
    if (d < 0.05 * W) return;
    const len = Math.min(d - 0.06 * W, 0.15 * W), ux = dx / d, uy = dy / d, px = bx + ux * len, py = by + uy * len, hw = 0.022 * W;
    let shape;
    if (b.k === 'say') shape = `<path d="M${bx - uy * hw} ${by + ux * hw}L${px} ${py}L${bx + uy * hw} ${by - ux * hw}z" fill="#fff" stroke="#1d2433" stroke-width="${0.0045 * W}" stroke-linejoin="round"/>`;
    else if (b.k === 'tel') {
      const n = 4, pts = [[bx, by]];
      for (let k = 1; k <= n; k++) { const f = k / n, side = k % 2 ? 1 : -1; pts.push([bx + ux * len * f + (k < n ? -uy * hw * side : 0), by + uy * len * f + (k < n ? ux * hw * side : 0)]); }
      shape = `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#1d2433" stroke-width="${0.009 * W}" stroke-linejoin="miter"/><polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="#fff" stroke-width="${0.004 * W}"/>`;
    } else shape = [0.35, 0.65, 0.9].map((f, k) => `<circle cx="${bx + ux * len * f}" cy="${by + uy * len * f}" r="${(0.016 - k * 0.004) * W}" fill="#fff" stroke="#8a94a6" stroke-width="${0.004 * W}"/>`).join('');
    svg.insertAdjacentHTML('beforeend', shape);
  });
  panel.appendChild(svg);
}
// 컷 하나(그림 + 말풍선 + 번호). 사이트의 책장에서는 한 쪽에 컷 하나를 놓는다
function panel(s) {
  const ep = s.id.split('-')[0];
  return panelHtml(s) + (LINES[s.id] || []).map(b => bubbleHtml(b, s)).join('') + `<span class="num">${ep}-${NUM[Number(s.id.split('-')[1]) - 1]}</span></div>`;
}
function pages(ep, opt = {}) {
  const shots = SHOTS.filter(s => s.id.split('-')[0] === ep);
  const out = [];
  for (let p = 0; p * 4 < shots.length; p++) {
    if (opt.page && opt.page !== p + 1) continue;
    out.push(`<div class="page">${shots.slice(p * 4, p * 4 + 4).map(panel).join('')}</div>`);
  }
  return out.join('');
}
function layoutAll(root) {
  for (const panel of root.querySelectorAll('.panel[data-id]')) {
    panel.querySelectorAll('.tails').forEach(t => t.remove());
    panel.querySelectorAll('.bub').forEach(el => { el.style.top = el.style.left = el.style.right = ''; });
    layout(panel, LINES[panel.dataset.id] || []);
  }
}
window.Comic = {TITLE, NAME, NUM, BLANKS, pages, panel, layoutAll, setAsset: fn => { asset = fn; }};
})();

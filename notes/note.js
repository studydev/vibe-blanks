// 도현의 노트 그리기. notes/notes.html(미리 보기)과 site/(조립)가 함께 쓴다. 모양은 notes/notes.css(.v-note 아래).
// 필요한 전역: NOTES·NOTE_META(notes/notes.data.js).
(function () {
let A = p => p;
let labLink = id => `../practice/cards.html?lab=${id}`;
const {LANES, HANDS} = window.NOTE_META;
const NAME = {seoyun: '서윤', dohyun: '도현', sua: '수아', junho: '준호'};
const NUM = '①②③④⑤⑥⑦⑧⑨⑩';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, ' ');
const cut = id => { const [e, k] = id.split('-'); return `${e === 'E' ? '에필로그' : e + '화'} ${NUM[k - 1]}`; };

function note(n) {
  const lanes = Object.entries(LANES).map(([k, label]) => {
    const w = n.where.find(x => x[0] === k);
    return `<div class="lane ${k} ${w ? 'on' : ''}"><b>${esc(w && w[2] || label)}</b>${w ? esc(w[1]) : '—'}</div>`;
  }).join('');
  const asks = n.askSteps.map(s => (s.do ? `<div class="ask" style="border-color:#f2c79b"><small>${esc(s.t)} — 내 손</small>${esc(s.do)}</div>` : '') + s.asks.map(a => `<div class="ask"><small>${esc(s.t)} — AI 에게</small>${esc(a.text)}</div>`).join('')).join('');
  return `<article class="note" id="note-${n.ep}">
    <header><span class="blank"><i>${n.ep === 'E' ? '+' : n.ep}</i>${esc(n.blank.replace(/^(빈칸 \d · |\+ )/, ''))}</span><h2>${esc(n.title)}</h2><div class="terms">${n.term.map(([k, e]) => `<span>${esc(k)}<i>${esc(e)}</i></span>`).join('')}</div></header>
    <div class="grid">
      <figure class="webtoon"><img src="${A(n.scene.img)}" alt="" loading="lazy"><figcaption><span class="cap">웹툰에서는</span>${n.lines.map(b => `<p class="${b.k === 'nar' ? 'nar' : ''}">${b.who ? `<b>${NAME[b.who]}</b> ` : ''}${fmt(b.t)} <span class="cap">${cut(b.id)}</span></p>`).join('')}</figcaption></figure>
      <div>
        <h3>정확히는</h3><p class="what">${esc(n.what)}</p>
        <h3>어디서 일어나나</h3><div class="lanes">${lanes}</div>
        <h3>내가 정할 것</h3><p class="decide">${esc(n.decide)}</p>
        <a class="go" href="${labLink(n.lab)}">직접 해 보기 — 실습 ${n.lab} →</a>
      </div>
    </div>
    <details class="more"><summary>펼쳐서 배우기 — AI 에게 · 손 · 조심 · 더 알아보기</summary>
      <h4>AI 에게 이렇게</h4>${asks}
      <h4>그때 AI 가 쓰는 손</h4><div class="hands">${n.hands.map(([h, w]) => `<span class="hand h-${h}"><b>${HANDS[h]}</b>${esc(w)}</span>`).join('')}</div>
      <h4>이럴 땐 조심</h4><ul>${n.care.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
      ${n.beyond ? `<h4>더 나아가기</h4><ul>${n.beyond.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      <h4>더 알아보기</h4><p class="links">${[...n.cmds.map(c => `<code>${esc(c)}</code>`), ...n.links.map(([l, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(l)}</a>`)].join(' · ')}</p>
    </details>
  </article>`;
}
window.Notes = {note, setAsset: fn => { A = fn; }, setLabLink: fn => { labLink = fn; }};
})();

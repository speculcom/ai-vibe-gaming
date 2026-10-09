#!/usr/bin/env node
/**
 * AI 做游戏（Vibe Gaming）→ vg.specul.com
 *
 * 源仓 ai-vibe-gaming 的构建器。产出到_data/game/site/，推 speculcom/vibe-gaming。
 *
 * 设计约束（来自既有约定，踩过坑才写下来的）：
 *  1)辅助函数声明必须在**文件顶部**、且在任何使用点之前 —— 踩过 TDZ 5 次。
 *  2) 属性位置不能放 bi()（会提前闭合），要么把整个元素交给 bi()，要么用三元。
 *  3) 英文文案含撇号必须用双引号 +弯引号。
 *  4) HTML 里有中文时走 bi()，英文侧不要再 esc（bi 的入参是构建期常量，无注入风险）。
 *  5) 本项目**没有版本控制**，改这个文件前先备份到_tmp/。
 *
 * 阶段：P0 占位页（内容在 P1 立论层、P2 词条、���3 引擎档案里补）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(HERE, '..', 'site');
/* 品牌资产来源（铁律 R3）：优先本仓 brand/ 的 vendored 副本，回退主仓。
 * 原来无条件用 <主仓>/_sites/_template，克隆者必然构建失败。*/
const VENDORED = path.join(HERE, '..', 'brand');
const TEMPLATE = fs.existsSync(path.join(VENDORED, 'shell.mjs'))
  ? VENDORED
  : path.join(ROOT, '_sites', '_template');

/* ⚠ Windows 上 import() 不能用绝对路径（ERR_UNSUPPORTED_ESM_URL_SCHEME）——
 * 必须先过 pathToFileURL()。这个坑在 agent 站的构建器里已处理过。*/
const { shell } = await import(pathToFileURL(path.join(TEMPLATE, 'shell.mjs')).href);

// ── 双语节点（放最顶部：任何使用点都在它之后）──
const bi = (zh, en) => `<span data-zh>${zh}</span><span data-en>${en}</span>`;

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* 行内 markdown → HTML（A6.4.3 补）
 * ⚠ 为什么现在才补：`claims/boundary.json` 的文案里写了 32 处 `**强调**`，
 *   而渲染时只过 `esc()`、不过行内 markdown —— 于是首页上直接显示成裸星号（**我们的判断**）。
 *   与 build-terms.mjs 的同名函数保持**逐条规则一致**（粗体 / 斜体 / 代码 / 外链）。
 *   放在 esc 之后，遵守本文件顶部的顺序约定（TDZ 踩过 5 次）。 */
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  /* ⚠ 粗体用**非贪婪** `.+?` 而不是 `[^*]+`：正文里有
   *   `**Godot's scene tree is *not* AI-friendly**` 这种「粗体里嵌一层斜体」的写法，
   *   `[^*]+` 遇到内部那个单星号就匹配不上，整段原样输出裸星号。 */
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  /* 链接同时认 https（外链，新窗口）与站内相对路径（`./x.html` / `../x.html` / `#锚点`）。
   * 与 build-terms.mjs 的 inline() 规则一致 —— 本仓正文互引一律写构建后的 .html 路径。 */
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => {
    if (/^https?:/.test(href)) return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    if (/^(?:\.{0,2}\/|[^/:]*\.html|#)/.test(href)) return `<a href="${href}">${text}</a>`;
    return m;
  });

// ── 站常量 ──
const SITE_INFO = {
  domain: 'vg.specul.com',
  zh: 'AI 做游戏',
  en: 'Vibe Gaming',
  taglineZh: '跟 AI 聊天把游戏做出来 —— 哪些环节变了，哪些没变',
  taglineEn: 'Make a game by talking to AI — which parts changed, and which did not',
  repo: 'https://github.com/speculcom/ai-vibe-gaming',
  accent: '#f5c542',
};

// ── 立论层（P1）──
/* 数据源claims/boundary.json + claims/engines-verified.json。
 * ⚠ **每个 costChange 都不是实测数据** —— 页面必须显式声明这一点，
 *   否则读者会把「↓ 大幅」当成测量结果（v3 铁律第 4 条）。*/
let CLAIMS = null;
let ENGINES = null;
for (const [key, file] of [['CLAIMS', 'boundary.json'], ['ENGINES', 'engines-verified.json']]) {
  const p = path.join(HERE, '..', 'claims', file);
  if (!fs.existsSync(p)) throw new Error('立论数据读不到：' + p);
  const j = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (key === 'CLAIMS') CLAIMS = j; else ENGINES = j;
}

/** 成本变化 → 视觉标记（↓ 越多越深），并标注这是判断不是数据 */
/* 成本标记的英文侧不用箭头 —— 英文里 down a lot 比 ↓↓ 更自然。*/
const COST_MARKS = {
  '↓ 大幅': ['↓ 大幅', 'down a lot', 'down-heavy'],
  '↓ 部分': ['↓ 部分', 'down partly', 'down-part'],
  '↓ 少': ['↓ 少', 'down little', 'down-little'],
  '↓ 很少': ['↓ 很少', 'down barely', 'down-barely'],
};

function claimsBlock() {
  if (!CLAIMS) return '';
  const t1 = CLAIMS.table1_whatChanged;
  const t2 = CLAIMS.table2_whatDoesNotCarryOver;
  const t3 = CLAIMS.table3_fit;

  const rows1 = t1.rows.map(r => {
    const mark = COST_MARKS[r.costChange] || ['—', ''];
    const conf = r.confidence === 'our-judgement'
      ? bi('我们的判断', 'our judgement')
      : (r.confidence === 'verified'
        ? bi('可回溯官方源', 'traceable to official sources')
        : bi('部分可核验', 'partly verifiable'));
    return `            <tr>
              <td><b>${bi(inline(r.stage), inline(r.stageEn || r.stage))}</b></td>
              <td><span class="cost ${mark[2]}">${bi(inline(mark[0]), inline(mark[1]))}</span></td>
              <td>${bi(inline(r.maturity), inline(EN_MATURITY[r.maturity] || r.maturity))}</td>
              <td>${bi(inline(r.basis), inline(r.basisEn || r.basis))}</td>
              <td class="t-xs">${conf}</td>
            </tr>`;
  }).join('\n');

  const rows2 = t2.rows.map(r => `            <tr>
              <td>${bi(inline(r.premise), inline(r.premiseEn || r.premise))}</td>
              <td>${bi(inline(r.inGame), inline(r.inGameEn || r.inGame))}</td>
              <td>${bi(inline(r.consequence), inline(r.consequenceEn || r.consequence))}</td>
            </tr>`).join('\n');

  const li = (arr) => arr.map(x =>
    `            <li><b>${bi(inline(x.item), inline(x.itemEn || x.item))}</b><span class="t-sm">${bi(inline(x.why), inline(x.whyEn || x.why))}</span></li>`).join('\n');

  return `
        <div class="panel" id="claims">
          <h2>${bi('表 1 · AI 改变了做游戏的哪部分', 'Table 1 · What AI changed about making games')}</h2>
          <p class="t-sm mb-3">${bi(
            inline('⚠ 「成本变化」一列是**我们的判断**，不是实测数据 —— 这个领域没有权威统计。判断依据写在第三列。'),
            inline('⚠ The "cost movement" column is **our judgement, not measured data** — no authoritative statistics exist for this. The reasoning is in the third column.'),
          )}</p>
          <div class="table-wrap">
            <table class="src">
              <thead><tr>
                <th>${bi('环节', 'Stage')}</th>
                <th>${bi('成本变化', 'Cost')}</th>
                <th>${bi('成熟度', 'Maturity')}</th>
                <th>${bi('判断依据', 'Reasoning')}</th>
                <th>${bi('性质', 'Nature')}</th>
              </tr></thead>
              <tbody>
${rows1}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <h2>${bi('表 2 · vibe coding 的哪些前提在游戏里不成立', 'Table 2 · Which premises of vibe coding do not hold for games')}</h2>
          <p class="t-sm mb-3">${bi(inline(t2.intro), inline(t2.introEn || t2.intro))}</p>
          <div class="table-wrap">
            <table class="src">
              <thead><tr>
                <th>${bi('vibe coding 依赖', 'vibe coding assumes')}</th>
                <th>${bi('在游戏开发中', 'In game development')}</th>
                <th>${bi('后果', 'Consequence')}</th>
              </tr></thead>
              <tbody>
${rows2}
              </tbody>
            </table>
          </div>
        </div>

        <div class="panel">
          <h2>${bi('表 3 · 什么适合、什么不适合', 'Table 3 · Where it fits and where it does not')}</h2>
          <p class="t-sm mb-3">${bi(inline(t3.intro), inline(t3.introEn || t3.intro))}</p>
          <div class="two-col">
            <div>
              <h3 class="fit-yes">${bi('适合', 'Fits')}</h3>
              <ul class="fit-list">
${li(t3.fits)}
              </ul>
            </div>
            <div>
              <h3 class="fit-no">${bi('不适合', 'Does not fit')}</h3>
              <ul class="fit-list">
${li(t3.doesNotFit)}
              </ul>
            </div>
          </div>
        </div>

        ${enginesBlock()}`;
}

/* 引擎「类型」的中文标签在英文侧要换说法（不是逐字翻译）。*/
const EN_TIER = {
  '通用 2D/3D': 'general 2D/3D',
  '原生 3D': 'native 3D',
  'Java 跨平台': 'Java cross-platform',
  'Web 2D': 'web 2D',
  'Web 3D': 'web 3D',
  '2D/3D 跨平台': '2D/3D cross-platform',
  '2D 轻量': 'lightweight 2D',
  '2D/3D 轻量': 'lightweight 2D/3D',
};

const EN_MATURITY = {
  '成熟': 'mature', '半成熟': 'half-mature', '不成熟': 'immature',
  '可用': 'usable', '可用（需校对）': 'usable with editing',
};

/** 引擎的可核验事实（GitHub API 快照）—— 与上面三张判断表分开呈现 */
function enginesBlock() {
  if (!ENGINES) return '';
  const list = Object.values(ENGINES);
  const rows = list.map(e => {
    const lic = e.licenseReadable
      ? `<code>${esc(e.license)}</code>`
      : bi(`<code>${esc(e.license)}</code>`, `<code>${esc(e.license)}</code>`);
    return `            <tr>
              <td><a href="${esc(e.repoUrl)}" target="_blank" rel="noopener"><code>${esc(e.repo)}</code></a></td>
              <td>${bi(esc(e.tier), esc(EN_TIER[e.tier] || e.tier))}</td>
              <td><code>${esc(e.scriptLanguage)}</code></td>
              <td>${e.stars.toLocaleString()}</td>
              <td>${lic}</td>
              <td class="t-xs">${e.pushedAt}</td>
            </tr>`;
  }).join('\n');

  const unreadable = list.filter(e => !e.licenseReadable);

  return `
        <div class="panel" id="engines">
          <h2>${bi('附·引擎的可核验事实', 'Appendix · Verifiable engine facts')}</h2>
          <p class="t-sm mt-2"><a href="./engines.html">${bi('→ 按「对 AI 的友好度」看这五个引擎的判断与依据', '→ See the five engines by how AI-friendly they are, with the reasoning')}</a></p>
          <p class="t-sm mb-3">${bi(
            `下面每一条都取自 GitHub 官方 API，快照时间 2026-10-05。上面三张表是判断，这张表是事实 —— 两者不要混读。`,
            `Every row below comes from the official GitHub API, snapshotted 2026-10-05. The three tables above are judgements; this one is fact — do not read them as the same kind of claim.`,
          )}</p>
          <div class="table-wrap">
            <table class="src">
              <thead><tr>
                <th>${bi('仓库', 'Repository')}</th>
                <th>${bi('类型', 'Tier')}</th>
                <th>${bi('脚本语言', 'Scripting')}</th>
                <th>★</th>
                <th>${bi('许可', 'Licence')}</th>
                <th>${bi('最后提交', 'Last push')}</th>
              </tr></thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
          ${unreadable.length ? `<p class="t-sm warn-inline">${bi(
            `⚠ ${unreadable.map(e => e.repo).join(' 与 ')} 的许可在 GitHub 上是 <code>NOASSERTION</code> —— 机器无法判定，须读官方 LICENSE 与官网条款。本站不替它们判断。`,
            `⚠ The GitHub licence field for ${unreadable.map(e => e.repo).join(' and ')} reads <code>NOASSERTION</code> — machine-undeterminable. Read the official LICENSE and the site's terms. This site does not judge for them.`,
          )}</p>` : ''}
        </div>`;
}

function page() {
  return `<div class="container">
        <p class="kicker">${bi(esc(SITE_INFO.zh), esc(SITE_INFO.en))}</p>
        <h1 class="t-hero">${bi('跟 AI 聊天把游戏做出来', 'Make a game by talking to AI')}</h1>
        <p class="lede">${bi(
          '这个站只回答一件事：AI 已经改变了做游戏的哪部分，还没改变哪部分。',
          'This site answers one question: which parts of making a game has AI actually changed, and which have it not.',
        )}</p>

        <div class="panel">
          <h2>${bi('核心判断', 'The core claim')}</h2>
          <p class="t-lead">${bi(
            'AI 让做游戏的成本下降是<strong>不均匀</strong>的：写代码降了 70~80%，做美术 / 配乐 / 关卡几乎没降。',
            'The cost of making a game with AI falls <strong>unevenly</strong>: code drops 70–80%, while art, music and level design barely move.',
          )}</p>
          <p>${bi(
            '于是「一个人做游戏」的瓶颈从「写不出来」变成了「凑不齐」。',
            'So the bottleneck for a solo developer shifts from "cannot write it" to "cannot assemble it".',
          )}</p>
        </div>

        <div class="panel">
          <h2>${bi('本站怎么组织', 'How this site is organised')}</h2>
          <p class="t-sm mb-3">${bi(
            '按做游戏的实际顺序分五阶段，每阶段固定四块：做什么 · 怎么做 · 常见失败 · 我们的口径。',
            'Five stages in the order you actually build a game. Each stage has four fixed parts: what, how, common failures, and our reading.',
          )}</p>
          <ol class="stage-list">
            <li><b><a href="s1-选引擎.html">${bi('选引擎', 'Pick an engine')}</a></b><span class="t-sm">${bi('哪个引擎对 AI 最友好', 'Which engine AI handles best')}</span></li>
            <li><b><a href="s2-核心循环.html">${bi('核心循环', 'The core loop')}</a></b><span class="t-sm">${bi('怎么把玩法变成代码', 'Turning mechanics into code')}</span></li>
            <li><b><a href="s3-手感调参.html">${bi('手感调参', 'Game feel')}</a></b><span class="t-sm">${bi('为什么 AI 给的参数不对', 'Why AI’s parameters feel wrong')}</span></li>
            <li><b><a href="s4-资产合规.html">${bi('资产合规', 'Asset licensing')}</a></b><span class="t-sm">${bi('美术 / 音频从哪来，哪些能商用', 'Where assets come from and what is usable')}</span></li>
            <li><b><a href="s5-导出发布.html">${bi('导出发布', 'Ship it')}</a></b><span class="t-sm">${bi('怎么让人玩到', 'Getting it in front of players')}</span></li>
          </ol>
          <p class="t-sm mt-2"><a href="learn.html">${bi('→ 进入学习路径（含完整教学与常见失败）', '→ Enter the learning path (full walkthrough and common failures)')}</a></p>
          <p class="t-sm mt-2"><a href="method.html">${bi('→ 实战流程（五步串成一条线，专讲交接处的失败）', '→ The build order (five steps as one line, focused on handoff failures)')}</a></p>
          <p class="t-sm"><a href="demos.html">${bi('→ 最小可玩原型代码清单（五个引擎各一份可抄的骨架）', '→ Minimal prototype code list (one copyable skeleton per engine)')}</a></p>
        </div>

        ${claimsBlock()}

        <div class="panel">
          <h2>${bi('相关站点', 'Related')}</h2>
          <p class="t-sm">${bi(
            '想看别人已经做出的东西 →',
            'Want to see what others have already built →',
          )} <a href="https://specul.com/">${bi('Specul 站群首页', 'the Specul hub')}</a></p>
          <p class="t-xs muted">${bi(
            inline('⚠ 作品库（demos.specul.com）在 2026-10-09 定案**暂不做** —— 先把「怎么做」写透，再谈「别人做了什么」。原先这里的链接指向一个不存在的站点，已撤掉。'),
            inline('⚠ The works gallery (demos.specul.com) was decided **not to be built** on 2026-10-09 — get "how to do it" right first, then cover "what others built". The link that used to sit here pointed at a site that does not exist.'),
          )}</p>
        </div>

        <div class="panel is-slim">
          <h2>${bi('我们不说的', 'What we do not claim')}</h2>
          <ul class="t-sm">
            <li>${bi('本站不跑benchmark，不给质量与速度结论', 'We do not run benchmarks and draw no quality or speed conclusions')}</li>
            <li>${bi('不做引擎排名，不做作品排名', 'No engine rankings, no work rankings')}</li>
            <li>${bi('成本变化幅度是我们的判断，不是数据', 'Cost movement figures are our judgement, not measured data')}</li>
          </ul>
        </div>
      </div>`;
}

// ── 样式：从 _template/site.css 复制（与图谱站一致）──
function writeCss() {
  const src = path.join(TEMPLATE, 'site.css');
  let css = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(path.join(SITE, 'site.css'), css, 'utf8');
  return css;
}

// ── 构建 ──
fs.mkdirSync(SITE, { recursive: true });

const css = writeCss();
// 追加本站专属样式（阶段列表）
fs.appendFileSync(path.join(SITE, 'site.css'), `
/* ── B6（2026-10-09）· 亮色主题的品牌色 ──
   vg 原先**没有**亮色覆盖，于是深色主题的金色 #f5c542 直接用在白底上当文字色，
   实测 1.62:1（引擎表里的引擎名就是这条）。这里按共享约定补一个压深档
   （#906807：白底 5.06 / 各自柔和底 4.54，色相不变）。 */
/* ⚠ 用 html[data-theme="light"]（特异性 0,1,1）而不是 [data-theme="light"]（0,1,0）：
   页头用内联 <style>:root{--accent:…}</style> 设了本站强调色，同特异性下**看源码顺序**，
   会把覆盖顶掉。提高一级就稳。另外要连 --accent 一起覆盖 ——
   引擎表里的引擎名用的是 var(--accent)，不是 var(--brand)（第一次只改了 --brand，白改）。 */
html[data-theme="light"] {
  --accent: #906807;
  --brand: #906807;
  --brand-on: #ffffff;
  --brand-soft: rgba(144, 104, 7, .10);
  --brand-line: rgba(144, 104, 7, .30);
}
/* ── B4（2026-10-09）· 引擎决策树 ──
   字号用整数 px（设计系统的硬规则，_design-audit 守着）。 */
.etree{margin:1.2rem 0 0}
.etree-row{display:flex;flex-wrap:wrap;gap:.8rem;align-items:flex-end}
.etree-f{display:flex;flex-direction:column;gap:.25rem;min-width:12rem;flex:1 1 12rem}
.etree-h{font-size:11px;letter-spacing:.06em;text-transform:uppercase;opacity:.6}
.etree select{font:inherit;font-size:14px;padding:.35rem .5rem;border:1px solid var(--border);border-radius:var(--r-sm,8px);background:transparent;color:inherit}
.etree-out{margin-top:1rem}
.etree-card{border:1px solid var(--border);border-radius:var(--r-sm,8px);padding:.8rem 1rem;margin:.5rem 0}
.etree-card.is-alt{opacity:.85}
.etree-tag{font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.55}
.etree-name{font-size:18px;margin:.15rem 0 .3rem}
.etree-why{font-size:13px;opacity:.8;line-height:1.6}
.etree-caveat{font-size:13px;opacity:.7;line-height:1.6;margin-top:.35rem}
.etree-note{font-size:13px;opacity:.6;line-height:1.6;margin-top:.6rem}
.etree-none{font-size:14px;opacity:.8}
@media(max-width:560px){.etree-f{min-width:100%}}
/* ── AI 做游戏站专属 ── */
.stage-list{list-style:none;padding:0;margin:0}
.stage-list li{display:flex;gap:.6em;align-items:baseline;padding:.45em 0;border-top:1px solid var(--border)}
.stage-list li:first-child{border-top:0}
.stage-list b{flex:0 0auto;font-weight:500}
.stage-list .t-sm{color:var(--text-dim)}
.t-lead{font-size:15px;line-height:1.7}

/* ── 立论层（P1）── */
.table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch}
table.src td{vertical-align:top}
table.src td b{font-weight:500}
.cost{font-weight:500;white-space:nowrap}
.cost.down-heavy{color:var(--vio)}
.cost.down-part{color:var(--vio);opacity:.8}
.cost.down-little{color:var(--text-dim)}
.cost.down-barely{color:var(--text-dim);opacity:.7}
.t-xs{font-size:12px;line-height:1.6;color:var(--text-dim)}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:1.2em}
@media (max-width:640px){.two-col{grid-template-columns:1fr;gap:1em}}
.fit-yes{color:var(--cyan);font-size:14px;margin:0 0 .4em}
.fit-no{color:var(--text-dim);font-size:14px;margin:0 0 .4em}
.fit-list{list-style:none;padding:0;margin:0}
.fit-list li{padding:.4em 0;border-top:1px solid var(--border);font-size:13px;line-height:1.6}
.fit-list li:first-child{border-top:0}
.fit-list b{display:block;font-weight:500}
.fit-list .t-sm{color:var(--text-dim)}
.warn-inline{color:var(--gold)}

/* ── 词条页（P2）── */
.stage-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:.7em;margin:0}
.stage-card{display:grid;grid-template-columns:auto 1fr;gap:.3em .6em;align-items:baseline;
  padding:.8em .9em;border:1px solid var(--border);border-radius:var(--r-sm);
  text-decoration:none;transition:border-color .15s}
.stage-card:hover{border-color:var(--vio)}
.stage-card .stage-n{grid-row:span 2;min-width:1.5em;height:1.5em;display:grid;place-items:center;
  font-size:12px;background:var(--vio);color:#fff;border-radius:var(--r-sm)}
.stage-card b{font-weight:500;color:var(--text)}
.stage-card .t-sm{grid-column:2;color:var(--text-dim);font-size:12px;line-height:1.55}
.kw-list{list-style:none;padding:0;margin:0}
.kw-list li{padding:.5em 0;border-top:1px solid var(--border);display:grid;grid-template-columns:auto 1fr;gap:.2em .8em;align-items:baseline}
.kw-list li:first-child{border-top:0}
.kw-list b{font-weight:500}
.kw-list .t-sm{grid-column:2;font-size:12px;color:var(--text-dim);line-height:1.55}
.term-meta{border-left:2px solid var(--vio)}
.term-body h2{margin:1.4em 0 .5em;font-size:15px;font-weight:500}
.term-body h3{margin:1.1em 0 .4em;font-size:14px;font-weight:500}
.term-body p{margin:.6em 0;line-height:1.75}
.term-body blockquote{margin:.8em 0;padding:.6em .9em;border-left:2px solid var(--gold);
  background:var(--bg-soft);border-radius:0 var(--r-sm) var(--r-sm) 0}
.term-body blockquote p{margin:.3em 0}
.term-body ul{margin:.6em 0;padding-left:1.2em}
.term-body li{margin:.3em 0;line-height:1.7}
.term-body hr{border:0;border-top:1px solid var(--border);margin:1.4em 0}
ul.checklist{list-style:none;padding-left:0}
ul.checklist li::before{content:"□ ";color:var(--text-dim)}
.kicker a{color:inherit;text-decoration:none}
.kicker a:hover{color:var(--vio)}

/* ── 引擎档案（P3）── */
.eng-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:.7em}
.eng-card{display:grid;gap:.3em;padding:.85em .95em;border:1px solid var(--border);
  border-radius:var(--r-sm);text-decoration:none;transition:border-color .15s}
.eng-card:hover{border-color:var(--vio)}
.eng-head{display:flex;align-items:baseline;gap:.5em;flex-wrap:wrap}
.eng-head b{font-weight:500;color:var(--text)}
.ai-badge{font-size:11px;padding:.1em .45em;border-radius:3px;white-space:nowrap}
/* B5（2026-10-09）：徽标字色改为**分主题两套**。
 * 原先#0F6E56/#854F0B/#A32D2D 是浅色主题用的深色字，直接用在深色卡片上只有 1.9–2.4:1
 * （实测 _audit/a11y-contrast.mjs 报 15 处，全部集中在这几个徽标）。
 * 深色主题的新值是**算出来的最小提亮量**（保证 ≥4.5:1），
 * 浅色主题保留原来的深色值，用 [data-theme="light"] 覆盖。 */
.ai-badge.high{background:rgba(29,158,117,.16);color:#599b8a}
.ai-badge.medium{background:rgba(245,197,66,.16);color:#b5946a}
.ai-badge.low{background:rgba(226,75,74,.14);color:#cf8a8a}
[data-theme="light"] .ai-badge.high{color:#0F6E56}
[data-theme="light"] .ai-badge.medium{color:#854F0B}
[data-theme="light"] .ai-badge.low{color:#A32D2D}
.eng-card .t-sm{font-size:12px;line-height:1.55;color:var(--text-dim)}
.eng-meta{font-size:11px;color:var(--text-dim);opacity:.8}
.eng-meta code{font-size:11px}
/* 上手难度徽标（A6.4.3）——与 ai-badge 同形但不同轴：
 * ai-badge 问「AI 写代码有多容易出错」，diff-badge 问「人装起来跑起来有多费事」。 */
.diff-badge{font-size:11px;padding:.1em .45em;border-radius:3px;white-space:nowrap;background:var(--bg-soft);color:var(--text-dim)}
.diff-badge.low{background:rgba(29,158,117,.16);color:#599b8a}
.diff-badge.medium{background:rgba(245,197,66,.16);color:#b5946a}
.diff-badge.high{background:rgba(226,75,74,.14);color:#cf8a8a}
[data-theme="light"] .diff-badge.low{color:#0F6E56}
[data-theme="light"] .diff-badge.medium{color:#854F0B}
[data-theme="light"] .diff-badge.high{color:#A32D2D}
.mt-2{margin-top:.6em}
/* ── 双语正文（P5i18n）── */
.bi-block{margin:0}
.bi-block > span{display:block}

/* ── 代码块（A6.4 补）──
 * 本仓 5 个词条里本来就有代码围栏，但渲染器不认它 —— 页面上显示成字面反引号。
 * 用「代码块自己的横向滚动容器」，不让页面整体横滚：全站硬约束是无横向滚动条。
 * ⚠ 这段是 JS 模板字符串，注释里**不能出现反引号**，否则模板提前闭合（已踩一次）。 */
pre.code{margin:.8em 0;padding:.85em 1em;background:var(--bg-inset);border:1px solid var(--border);
  border-radius:var(--r-sm);overflow-x:auto;-webkit-overflow-scrolling:touch}
pre.code code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace;
  font-size:12.5px;line-height:1.65;white-space:pre;color:var(--text)}

/* ── 词条页的「上一篇 / 下一篇」（A6.4.4）──
 * 17 个词条串成一条有序路径（顺序由 build-terms.mjs 的 sort 决定，与 learn.html 一致）。
 * ⚠ grid item 必须显式 min-width:0 且长词条名要 anywhere 换行 ——
 *   全站硬约束「无横向滚动条」，词条名里最长的是「上下文窗口与 AI 写游戏」。*/
.term-nav{display:grid;grid-template-columns:1fr 1fr;gap:.6em;margin:.55em 0 0}
.term-nav a{display:grid;gap:.15em;min-width:0;padding:.6em .8em;border:1px solid var(--border);
  border-radius:var(--r-sm);text-decoration:none;transition:border-color .15s}
.term-nav a:hover{border-color:var(--vio)}
.term-nav .tn-dir{font-size:11px;color:var(--text-dim)}
.term-nav b{font-weight:500;font-size:13px;line-height:1.5;color:var(--text);overflow-wrap:anywhere}
.term-nav .tn-next{text-align:right;justify-items:end}
.term-nav .is-empty{border:0;padding:0}
@media (max-width:640px){.term-nav{grid-template-columns:1fr}}
`, 'utf8');

const html = shell({
  current: 'vg',
  title: `${SITE_INFO.zh} · ${SITE_INFO.en}`,
  desc: (SITE_INFO.taglineZh + '按做游戏的实际顺序分五阶段，讲清 AI 改变了哪些环节、哪些没变；判断依据与失败点都写在档案里。').slice(0, 150),
  canonical: `https://${SITE_INFO.domain}/`,
  /* B5：首页的结构性数据。 */
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${SITE_INFO.zh} · ${SITE_INFO.en}`,
    url: `https://${SITE_INFO.domain}/`,
    description: SITE_INFO.taglineZh,
    inLanguage: 'zh-Hans',
    isPartOf: { '@type': 'WebSite', name: 'Specul · 投机取巧', url: 'https://specul.com/' },
  },
  accent: SITE_INFO.accent,
  body: page(),
  repo: SITE_INFO.repo,
  repoLabel: 'GitHub',
  // ⚠ assetPrefix 留空：产物直接输出到 site/ 根（index.html 与 brand.css 同级）。
  //   之前传 '../' 导致 href="../brand.css" → 404 → **语言切换 CSS 没加载**
  //   → 英文态下data-zh 节点没被隐藏 → 探针报「英文态有中文」。
  //   症状与「漏译」一模一样，根因却是资源路径 —— 排查时先看控制台 404。
});

fs.writeFileSync(path.join(SITE, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(SITE, 'CNAME'), SITE_INFO.domain + '\n', 'utf8');
fs.writeFileSync(path.join(SITE, '.nojekyll'), '', 'utf8');
fs.writeFileSync(path.join(SITE, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: https://${SITE_INFO.domain}/sitemap.xml\n`, 'utf8');

// 品牌文件：从 www.specul 复制（sync-brand.mjs 也会做，这里保证构建产物自足）
for (const f of ['brand.css', 'brand.js']) {
  const src = path.join(ROOT, 'www.specul', f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(SITE, f));
}

// 词条层（P2）：生成 learn.html + 每个词条的详情页
{
  const mod = await import(pathToFileURL(path.join(HERE, 'build-terms.mjs')).href);
}

/* sitemap 必须写在最后 —— 词条页与引擎页都是上面那两个模块产出的，
 * 在它们之前写就只会有首页一条（2026-10-08 修：原先 sitemap 里只有 /，
 * 25 个页面一个都没提交上去）。文件名含中文，loc 要 percent-encode。 */
{
  const pages = fs.readdirSync(SITE).filter(f => f.endsWith('.html')).sort();
  const loc = f => `https://${SITE_INFO.domain}/${f === 'index.html' ? '' : encodeURI(f)}`;
  const urls = pages.map(f => {
    const p = f === 'index.html' ? '1.0' : (f === 'learn.html' || f === 'engines.html' ? '0.8' : '0.6');
    return `  <url><loc>${loc(f)}</loc><changefreq>weekly</changefreq><priority>${p}</priority></url>`;
  });
  fs.writeFileSync(path.join(SITE, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
    'utf8');
  console.log(`  · sitemap：${pages.length} 条 URL`);
}

console.log('\n═══ AI 做游戏站已生成 ═══');
console.log(`  输出目录 ${SITE}`);
console.log(`  index.html ${Math.round(html.length / 1024)} KB`);
console.log(`  域名 ${SITE_INFO.domain}`);
console.log('');
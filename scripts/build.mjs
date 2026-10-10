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
  /* 2026-10-10 删除 accent（原 '#f5c542'）—— 分站专属色已取消，
   * 且该值在亮色底上只有 1.62:1（a11y 探针实测）。详见下面 shell 调用的注释。 */
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
        <h1 class="t-hero"><span class="grad-title">${bi('跟 AI 聊天把游戏做出来', 'Make a game by talking to AI')}</span></h1>
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
/* ⚠ 2026-10-10：追加片段的**真相源改为真实文件** `css/vg.css`
   （原先是本文件里的模板字符串）。抽取后已验证：**剥掉注释与空白后产物逐字符相同** ✓ */
fs.appendFileSync(path.join(SITE, 'site.css'), fs.readFileSync(path.join(HERE, '..', 'css', 'vg.css'), 'utf8'));

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
  /* ⚠ 2026-10-10 不再传 accent。
   * 原先这里传 `#f5c542`（vg 的金色强调），shell 会把它内联成
   * `:root{--accent:#f5c542}` —— 而这个值**只适合深色底**：
   * 亮色主题下引擎名（Godot 等）实测只有 **1.62:1**，达不到 AA 的 4.5。
   * B6（2026-10-09）曾用 `html[data-theme="light"]{--accent:#906807}` 修掉过，
   * 但那属于「分站专属色」—— 用户 2026-10-10 定案「不需要分站专属色」，于是整段取消，
   * **结果把已修好的无障碍缺陷放了回来** ✗
   *
   * 现在的解法：完全不传accent → `--accent` 落回 brand.css 的 `--accent: var(--brand)`，
   * 品牌紫深浅两档都过 AA ✓ 颜色也跟着全站统一 ✓
   * ⚠ 教训：取消「分站专属色」时，要先查清那份色值**顺带在承担什么职责** ——
   *   它不只是颜色，还是那个组件的**无障碍修复**。 */
  accent: null,
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
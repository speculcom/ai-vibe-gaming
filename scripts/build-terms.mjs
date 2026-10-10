// 词条层（P2）：读 terms/*.md，生成 learn.html 索引 + <slug>.html 详情页。
// 词条的 markdown 里有**中文为主**的表格与散文—— 页面按 zh 呈现，
// 关键字段（what / decision）走双语。这样与 learn 站的处理一致。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..', '..');
const TERMS = path.join(HERE, '..', 'terms');
const ENG_DIR = path.join(TERMS, 'engines');
const SITE = path.join(HERE, '..', 'site');

/* B5（2026-10-09）：meta description 组合器。
 * 词条页原先只取 frontmatter 的 `what`，实测大量短于 50 字符 → 搜索结果里等于没写。
 * 现在 what → decision 依次拼到够长为止（两段都是词条自己的内容，不堆关键词）。
 * ⚠ 按**转义之后**的长度收敛：`&` → `&amp;` 会变长（agent 那边因此从 150 变 170）。 */
function metaDesc(...parts) {
  let out = '';
  for (const p of parts) {
    const s = String(p == null ? '' : p).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (!s) continue;
    out = out ? out + ' ' + s : s;
    if (esc(out).length >= 70) break;
  }
  if (esc(out).length < 50) out = (out + ' —— AI 做游戏：判断依据、失败点与我们的口径都在档案里。').trim();
  let n = out.length;
  while (n > 0 && esc(out.slice(0, n) + '…').length > 158) n -= Math.max(1, esc(out.slice(0, n) + '…').length - 158);
  return n < out.length ? out.slice(0, n).replace(/[\s,，、;；:：\-—]+$/, '') + '…' : out;
}

/* 见 build.mjs 同名注释：优先本仓 brand/ 的 vendored 副本，回退主仓（铁律 R3）。*/
const VENDORED = path.join(HERE, '..', 'brand');
const TEMPLATE = fs.existsSync(path.join(VENDORED, 'shell.mjs'))
  ? VENDORED
  : path.join(ROOT, '_sites', '_template');

const { shell } = await import(pathToFileURL(path.join(TEMPLATE, 'shell.mjs')).href);
const { splitBilingual, renderBilingual } = await import(
  pathToFileURL(path.join(HERE, 'i18n-body.mjs')).href);

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/* ── 双语与标签（必须在所有使用点之前）── */
const bi = (zh, en) => `<span data-zh>${zh}</span><span data-en>${en}</span>`;

const CONF_LABEL = {
  'our-judgement': '本站的判断，未经实测',
  'partial': '部分可核验',
  'verified': '可回溯官方源',
};
const CONF_EN = {
  'our-judgement': "the site's judgement, not measured",
  'partial': 'partly verifiable',
  'verified': 'traceable to official sources',
};

/* ── 极简 frontmatter 解析（本项目的 YAML 子集：只认key: "value" 与数字）── */
function parseFm(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { body: raw, fm: {} };
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1);
    else if (/^-?\d+$/.test(v)) v = Number(v);
    fm[kv[1]] = v;
  }
  return { fm, body: raw.slice(m[0].length) };
}

/** 文件名 → slug（用作 URL）*/
function slugOf(file) {
  return file.replace(/\.md$/, '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '')
    // 去掉 S1- 这类前缀的连字符影响，保持可读
    .replace(/^s(\d)-/, 's$1-');
}

const files = fs.readdirSync(TERMS).filter(f => f.endsWith('.md'));
const terms = files.map(f => {
  const raw = fs.readFileSync(path.join(TERMS, f), 'utf8');
  const { fm, body } = parseFm(raw);
  return { file: f, slug: slugOf(f), fm, body };
});

/* slug 冲突守卫：slug 既是 URL 又是产物文件名，两个词条撞 slug 会**静默覆盖**其中一个页面
 * （文件名含中文时尤其容易撞：去空格 + 去标点后可能归一）。
 * ⚠ `scripts/validate.mjs` **有意不复制** slug 规则 —— 真相源在这里，守卫也放在这里。 */
{
  const seen = new Map();
  const dup = [];
  for (const t of terms) {
    if (seen.has(t.slug)) dup.push(`${t.slug} ← ${seen.get(t.slug)} 与 ${t.file}`);
    else seen.set(t.slug, t.file);
  }
  if (dup.length) {
    console.error(`slug 冲突，未出站（两个词条会互相覆盖页面）：\n  ${dup.join('\n  ')}`);
    process.exit(1);
  }
}

/* 排序 = 全站唯一的「有序路径」顺序（A6.4.4 的「上一篇 / 下一篇」直接复用它，不另造一套）：
 *   1) 有 stage 的排前面，按 stage 升序（阶段 1 → 5）；
 *   2) 同 stage 内按 ord 升序 —— 该阶段的补充词条排在阶段主条目之后
 *      （ord 用 stage*10+n 编码：S1=1，Web 导出可行性=11；S2=2，提示词的结构=21 …）；
 *   3) 无 stage 的（跨阶段关键词）排最后，按 ord 升序。
 *
 * ⚠ 原实现有两个毛病，A6.4.4 顺手修掉：
 *   · **同 stage 内没有次序** —— 靠 readdir 的偶然顺序，换机器/换文件系统就可能变；
 *     「下一篇」要一条确定的路径，不能建立在偶然上。
 *   · **`a.fm.ord || 999` 把 `ord: 0` 当成缺省值** —— Vibe Gaming 写的 `ord: 0`（本意排最前）
 *     被 `0 || 999` 判成 999 排到最后。改用 `??` 保留 0 的语义。 */
const hasStage = (t) => t.fm.stage !== undefined && t.fm.stage !== '';
terms.sort((a, b) => {
  const ka = hasStage(a) ? a.fm.stage : 99;
  const kb = hasStage(b) ? b.fm.stage : 99;
  return ka - kb || (a.fm.ord ?? 999) - (b.fm.ord ?? 999);
});

/* 引擎档案的 slug：引擎名小写连字符形式（godot/three.js/pixi…）*/
function engSlug(file) {
  return 'engine-' + file.replace(/\.md$/, '')
    .toLowerCase().replace(/\.js/g, '-js').replace(/[\s]+/g, '-');
}

/* ── 行内 markdown → HTML ──
 * ⚠ A6.4.3 提到模块作用域：原来它只在 md() 内部，于是**所有 meta 面板的标签都漏了渲染** ——
 *   `bi('**对 AI 的友好度**', …)` 直接把两个星号输出到页面上（engine-godot.html 一张页面上 18 处裸 `**`）。
 *   现在 meta 面板也走同一个 inline()，粗体/代码/链接的行为与正文完全一致。 */
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    /* ⚠ 粗体用**非贪婪** `.+?` 而不是 `[^*]+`：正文里有
     *   `**Godot's scene tree is *not* AI-friendly**` 这种「粗体里嵌一层斜体」的写法，
     *   `[^*]+` 遇到内部那个单星号就匹配不上，整段原样输出裸星号（engine-godot 实测 2 处）。
     *   斜体规则放在粗体**之后**，否则会把 `**` 拆成两个 `*`。 */
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
    /* ⚠ 链接要认**站内相对路径**，不能只认 https：本仓正文的互引写法是
     *   `[Vibe Gaming 词条](../vibe-gaming.html)`（站点路径，不是仓内 .md 路径）。
     *   原实现只转 https，于是 4 张页面上 8 处互引**原样显示成 markdown 文本**。
     *   仓内 `.md` 相对链接**有意不转** —— 没有重写规则时转出来就是死链，
     *   保留原样至少能在页面上看见（本仓约定：正文互引用构建后的 .html 路径）。 */
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => {
      if (/^https?:/.test(href)) return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
      if (/^(?:\.{0,2}\/|[^/:]*\.html|#)/.test(href)) return `<a href="${href}">${text}</a>`;
      return m;
    });
}

/* ── markdown → HTML（够用即可：标题/表格/列表/粗体/链接/代码/引用）── */
function md(src) {
  const lines = src.split('\n');
  const out = [];
  let inTable = false, inList = false, inQuote = false;
  /* 代码围栏状态（A6.4 补）。
   * ⚠ 为什么必须补：本仓已有 5 个词条写了 ``` 代码块，而渲染器**从来不认围栏** ——
   *   那 5 张页面上代码块原样显示成字面反引号（全站 24 处），等于内容没排版。
   *   围栏内**不做任何行内 markdown**（只转义），否则代码里的 `*`、`_`、`[]()` 会被改写。 */
  let inCode = false, codeLang = '', codeBuf = [];
  const flushCode = () => {
    out.push(`<pre class="code"><code${codeLang ? ` class="lang-${esc(codeLang)}"` : ''}>${esc(codeBuf.join('\n'))}</code></pre>`);
    inCode = false; codeLang = ''; codeBuf = [];
  };

  const closeBlocks = () => {
    if (inTable) { out.push('</tbody></table></div>'); inTable = false; }
    if (inList) { out.push('</ul>'); inList = false; }
    if (inQuote) { out.push('</blockquote>'); inQuote = false; }
  };

  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    const t = ln.trim();

    /* 代码围栏必须在其它判断**之前** —— 代码里可能出现 `- `、`|`、`> `、`#` 开头，
     * 先走别的分支就会被当成列表/表格/标题解析掉。 */
    if (t.startsWith('```')) {
      if (inCode) flushCode();
      else { closeBlocks(); inCode = true; codeLang = t.slice(3).trim(); }
      continue;
    }
    if (inCode) { codeBuf.push(ln); continue; }

    if (!t) { closeBlocks(); continue; }
    // 跳过 HTML 注释行
    if (t.startsWith('<!--')) continue;
    if (t.startsWith('- [ ]')) {
      if (!inList) { closeBlocks(); out.push('<ul class="checklist">'); inList = true; }
      out.push(`<li>${inline(t.slice(5)).replace(/^/, '')}</li>`);
      continue;
    }
    if (t.startsWith('- ')) {
      if (!inList) { closeBlocks(); out.push('<ul>'); inList = true; }
      out.push(`<li>${inline(t.slice(2))}</li>`);
      continue;
    }
    if (t.startsWith('> ')) {
      if (!inQuote) { closeBlocks(); out.push('<blockquote>'); inQuote = true; }
      out.push(`<p>${inline(t.slice(2))}</p>`);
      continue;
    }
    // 表格：| a | b |  /  | --- | --- |
    if (t.startsWith('|')) {
      const cells = t.slice(1, t.endsWith('|') ? -1 : undefined).split('|').map(c => c.trim());
      const isSep = cells.every(c => /^:?-{2,}:?$/.test(c));
      if (isSep) continue;
      if (!inTable) {
        closeBlocks();
        out.push('<div class="table-wrap"><table class="src"><thead><tr>' +
          cells.map(c => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>');
        inTable = true;
      } else {
        out.push(`<tr>${cells.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`);
      }
      continue;
    }
    // 标题
    const h = t.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      closeBlocks();
      const lv = h[1].length;
      out.push(`<h${lv}>${inline(h[2])}</h${lv}>`);
      continue;
    }
    // 横线
    if (t === '---') { closeBlocks(); out.push('<hr>'); continue; }
    // 段落
    closeBlocks();
    out.push(`<p>${inline(t)}</p>`);
  }
  /* 围栏没闭合也要把已收集的代码输出 —— 本仓最忌讳「静默丢内容」。 */
  if (inCode) {
    console.warn('  ! 代码围栏未闭合，已按到文末处理（请检查源 md 的 ``` 是否配对）');
    flushCode();
  }
  closeBlocks();
  return out.join('\n');
}

// 去掉正文里的第一个 h1（页面已有 h1）
function stripFirstH1(body) {
  return body.replace(/^\s*#\s+[^\n]+\n+/, '');
}

/* 词条正文渲染：按 `<!-- EN -->` + `> 引用块` 切成双语。
 * ⚠ 词条里没有 EN 标记时，只渲染中文（与之前行为一致，不报错）。*/
function renderBiBody(body) {
  const clean = stripFirstH1(body);
  if (!/<!--\s*EN\s*-->/.test(clean)) return md(clean);
  const chunks = splitBilingual(clean);
  return renderBilingual(chunks, md);
}


const SITE_INFO = {
  zh: 'AI 做游戏', en: 'Vibe Gaming', domain: 'vg.specul.com',
  repo: 'https://github.com/speculcom/ai-vibe-gaming',
  /* ⚠ 2026-10-10 删除 accent（原 '#f5c542'）。原因有二，缺一不可：
   *   1. 用户定案「不需要分站专属色，整体与首页一致」；
   *   2. 更要紧的是 —— 这个金色在**亮色底上只有 1.62:1**（引擎表里的引擎名
   *      Godot / Pixi / Three.js 等 5 处），达不到 WCAG AA 的 4.5。
   *   不传 accent 时 --accent 落回 brand.css 的 var(--brand)，深浅两主题都达标。
   *
   * ⚠ 本文件是 build.mjs 第 387 行**动态 import** 进来的词条/引擎页生成器 ——
   *   只改 build.mjs 是改不掉的（我先前就漏了它，产物里金色原封不动，
   *   a11y 探针又报了一遍同一个 1.62:1 才暴露出来）。
   *   教训：找「真相源」不能只看入口文件，动态 import 的模块同样是源。 */
};

/* ── learn.html：五阶段 + 关键词的索引页 ── */
const stageTerms = terms.filter(t => t.fm.stage);
const keywords = terms.filter(t => !t.fm.stage);

const stageCard = (t) => `      <a class="stage-card" href="${esc(t.slug)}.html">
        <span class="stage-n">${t.fm.stage}</span>
        <b>${esc(t.fm.zh)}</b>
        <span class="t-sm">${esc(t.fm.what)}</span>
      </a>`;

const kwItem = (t) => `        <li><a href="${esc(t.slug)}.html"><b>${esc(t.fm.zh)}</b></a>
          <span class="t-sm">${esc(t.fm.what)}</span></li>`;

/* ── 引擎档案页（P3）── */
const engFiles = fs.existsSync(ENG_DIR) ? fs.readdirSync(ENG_DIR).filter(f => f.endsWith('.md')) : [];
const engines = engFiles.map(f => {
  const raw = fs.readFileSync(path.join(ENG_DIR, f), 'utf8');
  const { fm, body } = parseFm(raw);
  return { file: f, slug: engSlug(f), fm, body };
});
// 按 AI 友好度降序（分数高的排前面）——⚠ 这是本站的判断，不是官方排名
engines.sort((a, b) => (b.fm.aiScore || 0) - (a.fm.aiScore || 0) || a.fm.zh.localeCompare(b.fm.zh));

const AI_LABEL = { high: ['友好', 'friendly'], medium: ['一般', 'mixed'], low: ['不友好', 'unfriendly'] };
const AI_EN = { high: 'friendly', medium: 'mixed', low: 'unfriendly' };
/* 上手难度 = **人从零到一个能跑的画面有多费事**（只算环境与起步，不算做完一个游戏）。
 * ⚠ 与 aiFriendly 是两条不同的轴，别合并：
 *   aiFriendly 问「AI 写这个引擎的代码有多容易出错」，difficulty 问「人装起来、跑起来有多费事」。 */
const DIFF_LABEL = { low: ['低', 'low'], medium: ['中', 'medium'], high: ['高', 'high'] };
const DIFF_ORDER = { low: 0, medium: 1, high: 2 };

/* 「安装与上手难度」面板（A6.4.3）：安装步骤 + 官方来源 + 难度（本站判断）+ 依据 */
function installPanel(e) {
  if (!e.fm.install && !e.fm.difficulty) return '';
  const d = DIFF_LABEL[e.fm.difficulty] || ['—', '—'];
  return `        <div class="panel">
          <h2>${bi('安装与上手难度', 'Install and onboarding')}</h2>
          ${e.fm.install ? `<p class="t-sm">${bi(inline('**安装步骤**'), inline('**Install**'))}${bi('：' + inline(e.fm.install), ': ' + inline(e.fm.installEn || e.fm.install))}</p>` : ''}
          ${e.fm.installSrc ? `<p class="t-xs">${bi('安装事实来源', 'Install source')}：<a href="${esc(e.fm.installSrc)}" target="_blank" rel="noopener">${esc(e.fm.installSrc)}</a>${e.fm.installVerified ? ' · ' + bi('核验日', 'verified') + ' ' + esc(e.fm.installVerified) : ''}</p>` : ''}
          ${e.fm.difficulty ? `<p class="t-sm mt-2">${bi(inline('**上手难度**'), inline('**Onboarding**'))}${bi('：' + d[0], ': ' + d[1])} <span class="t-xs muted">${bi('（本站判断，未经实测）', '(the site’s judgement, not measured)')}</span></p>` : ''}
          ${e.fm.difficultyWhy ? `<p class="t-sm">${bi(inline(e.fm.difficultyWhy), inline(e.fm.difficultyWhyEn || e.fm.difficultyWhy))}</p>` : ''}
        </div>`;
}

/* 引擎卡片：首页与 learn 页都用它 */
function engineCards(compact) {
  return engines.map(e => {
    const lab = AI_LABEL[e.fm.aiFriendly] || ['—', '—'];
    const stars = '★'.repeat(e.fm.aiScore || 0) + '☆'.repeat(4 - (e.fm.aiScore || 0));
    return `      <a class="eng-card" href="${e.slug}.html">
        <div class="eng-head"><b>${esc(e.fm.zh)}</b><span class="ai-badge ${e.fm.aiFriendly}">${bi(lab[0], lab[1])}</span></div>
        <span class="t-sm">${esc(e.fm.what)}</span>
        ${compact ? '' : `<span class="eng-meta"><code>${esc(e.fm.script || '')}</code> · ${stars}</span>`}
      </a>`;
  }).join('\n');
}

/* 引擎详情页 */
for (const e of engines) {
  const lab = AI_LABEL[e.fm.aiFriendly] || ['—', '—'];
  const stars = '★'.repeat(e.fm.aiScore || 0) + '☆'.repeat(4 - (e.fm.aiScore || 0));
  const html = shell({
    current: 'vg',
    title: `${e.fm.zh} · 引擎档案 · AI 做游戏`,
    desc: metaDesc(e.fm.what, e.fm.decision, e.fm.bestFor),
    canonical: `https://${SITE_INFO.domain}/${e.slug}.html`,
    /* B5：引擎档案的结构性数据。用 Article（它是一份带判断的档案，不是产品页）。 */
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: `${e.fm.zh} · 引擎档案`,
      url: `https://${SITE_INFO.domain}/${e.slug}.html`,
      description: metaDesc(e.fm.what, e.fm.decision),
      inLanguage: 'zh-Hans',
      isPartOf: { '@type': 'WebSite', name: 'AI 做游戏', url: `https://${SITE_INFO.domain}/` },
      about: { '@type': 'SoftwareApplication', name: e.fm.engine || e.fm.zh, applicationCategory: 'GameEngine' },
    },
    accent: null,   /* 2026-10-10：取消分站专属色，见上方 SITE_INFO.accent 的删除说明 */
    body: `<div class="container">
        <p class="kicker"><a href="./learn.html">${bi('引擎档案', 'Engine profiles')}</a></p>
        <h1 class="t-hero">${esc(e.fm.zh)}</h1>
        <p class="lede">${bi(e.fm.script || '', e.fm.scriptEn || e.fm.script || '')} · ${esc(e.fm.tier || '')}</p>

        <div class="panel term-meta">
          <p class="t-lead">${bi(inline('**对 AI 的友好度**'), inline('**How AI-friendly it is**'))}${bi('：' + stars + '（' + lab[0] + '）', ': ' + stars + ' (' + AI_EN[e.fm.aiFriendly] + ')')}</p>
          ${e.fm.what ? `<p class="t-sm">${bi(inline('**一句话**'), inline('**In one line**'))}${bi('：' + e.fm.what, ': ' + (e.fm.whatEn || e.fm.what))}</p>` : ''}
          ${e.fm.decision ? `<p class="t-sm">${bi(inline('**本站的判断**'), inline('**Our judgement**'))}${bi('：' + e.fm.decision, ': ' + (e.fm.decisionEn || e.fm.decision))}</p>` : ''}
          ${e.fm.bestFor ? `<p class="t-sm">${bi(inline('**适合**'), inline('**Best for**'))}${bi('：' + e.fm.bestFor, ': ' + (e.fm.bestForEn || e.fm.bestFor))}</p>` : ''}
          <p class="t-xs muted">${bi('性质：' + CONF_LABEL[e.fm.confidence], 'Nature: ' + CONF_EN[e.fm.confidence])} · ${bi('事实核验：' + (e.fm.verified || '—'), 'Facts verified: ' + (e.fm.verifiedEn || e.fm.verified || '—'))}</p>
        </div>

${installPanel(e)}

        <div class="term-body">
${renderBiBody(e.body)}
        </div>

        <div class="panel is-slim">
          <p><a href="./learn.html">${bi('← 返回学习路径', '← Back to the learning path')}</a> · <a href="./">${bi('首页', 'Home')}</a></p>
        </div>
      </div>`,
    repo: SITE_INFO.repo, repoLabel: 'GitHub',
  });
  fs.writeFileSync(path.join(SITE, e.slug + '.html'), html, 'utf8');
}

// 引擎对比页
if (engines.length) {
  /* B4（2026-10-09）：引擎决策树。
   * 规则的**依据全部来自引擎档案自己的字段**（tier / aiFriendly / difficulty / script），
   * 构建期拼成文案内嵌进页面 —— 不手写「XX 更好用」这类没有出处的判断。
   * 三个问题：平台 / 是否需要 3D / 团队里有没有人写过系统语言。
   * ⚠ 这不是排名：同一组条件给出「建议 + 备选」，并如实标出备选的代价。 */
  const bySlug = Object.fromEntries(engines.map((e) => [e.slug, e]));
  const AI_ZH = { high: 'AI 出错率低', medium: 'AI 出错率中等', low: 'AI 出错率高' };
  const DIFF_ZH = { low: '上手成本低', medium: '上手成本中等', high: '上手成本高' };
  const factsOf = (slug) => {
    const e = bySlug[slug];
    if (!e) return { slug, name: slug, why: '（档案缺失）', whyEn: '(profile missing)' };
    const f = e.fm;
    return {
      slug: e.slug,
      name: f.zh,
      why: `${f.tier} · ${AI_ZH[f.aiFriendly] || f.aiFriendly} · ${DIFF_ZH[f.difficulty] || f.difficulty} · 脚本 ${f.script}`,
      whyEn: `${f.tierEn || f.tier} · AI error rate ${f.aiFriendly} · onboarding ${f.difficulty} · ${f.script}`,
      /* 机器可读的**原始字段值**（不是中文标签）：给探针核对用。
       * 没有它，探针只能去比对中文标签 —— 那等于在探针里重抄一份标签映射（两份口径，必然漂）。 */
      raw: { tier: f.tier, ai: f.aiFriendly, diff: f.difficulty, script: f.script },
    };
  };
  const TREE_RULES = [
    { when: { p: 'web', d: 'yes', s: 'no' }, pick: 'engine-three-js', alt: null,
      caveatZh: 'three.js 是库不是引擎：循环与状态要自己写（见引擎档案与 demos 页）', caveatEn: 'three.js is a library, not an engine: you write the loop and state yourself' },
    { when: { p: 'web', d: 'yes', s: 'yes' }, pick: 'engine-three-js', alt: null,
      caveatZh: '会系统语言不改变 web 3D 的选择：另外四个里没有浏览器 3D 档', caveatEn: 'Systems-language experience does not change web 3D: none of the others offer a browser 3D tier' },
    { when: { p: 'web', d: 'no', s: 'no' }, pick: 'engine-pixi', alt: null,
      caveatZh: '只做 2D；要 3D 得换 three.js', caveatEn: '2D only; for 3D switch to three.js' },
    { when: { p: 'web', d: 'no', s: 'yes' }, pick: 'engine-pixi', alt: null,
      caveatZh: '同上：web 2D 只有这一个档', caveatEn: 'Same: web 2D has exactly one entry here' },
    { when: { p: 'desktop', d: 'yes', s: 'no' }, pick: 'engine-godot', alt: 'engine-bevy',
      caveatZh: 'Bevy 是 Rust 生态，官方文档与社区示例相对少；Godot 的 GDScript 更容易让 AI 一次写对', caveatEn: 'Bevy is Rust-first with fewer official examples; Godot GDScript is easier for an AI to get right first try' },
    { when: { p: 'desktop', d: 'yes', s: 'yes' }, pick: 'engine-godot', alt: 'engine-bevy',
      caveatZh: '你们会 Rust 的话 Bevy 可行，但要接受它的 AI 出错率偏高（见档案的判断依据）', caveatEn: 'If the team writes Rust, Bevy is viable — but accept its higher AI error rate (see the profile)' },
    { when: { p: 'desktop', d: 'no', s: 'yes' }, pick: 'engine-libgdx', alt: 'engine-godot',
      caveatZh: 'libGDX 要自己搭轮子（上手成本高），换来的是 Java/Kotlin 生态与跨平台', caveatEn: 'libGDX means building more yourself (high onboarding cost) in exchange for the Java/Kotlin ecosystem' },
    { when: { p: 'desktop', d: 'no', s: 'no' }, pick: 'engine-godot', alt: 'engine-pixi',
      caveatZh: 'Pixi 只能跑在浏览器里，做桌面发行要另外套壳', caveatEn: 'Pixi runs in the browser only; shipping desktop needs another wrapper' },
    { when: { p: 'mobile', d: 'yes', s: 'yes' }, pick: 'engine-godot', alt: 'engine-libgdx',
      caveatZh: 'libGDX 的 Android 路线最直（Java/Kotlin 原生），代价是上手成本高', caveatEn: 'libGDX has the most direct Android route (native Java/Kotlin) at a high onboarding cost' },
    { when: { p: 'mobile', d: 'yes', s: 'no' }, pick: 'engine-godot', alt: null,
      caveatZh: '导出到移动端要额外处理性能与触控，档案里未实测', caveatEn: 'Mobile export needs extra work on performance and touch; not measured here' },
    { when: { p: 'mobile', d: 'no', s: 'yes' }, pick: 'engine-libgdx', alt: 'engine-godot',
      caveatZh: '同上：Java/Kotlin 路线最直', caveatEn: 'Same: the Java/Kotlin route is the most direct' },
    { when: { p: 'mobile', d: 'no', s: 'no' }, pick: 'engine-godot', alt: null,
      caveatZh: 'GDScript 上手成本低，移动导出是内置功能', caveatEn: 'GDScript has a low onboarding cost and mobile export is built in' },
  ];
  const treeData = TREE_RULES.map((r) => {
    const p = factsOf(r.pick), a = r.alt ? factsOf(r.alt) : null;
    return {
      when: r.when,
      pick: p, pickEn: p, alt: a, altEn: a,
      caveat: r.caveatZh, caveatEn: r.caveatEn,
    };
  });
  /* 数据里带 pick/alt 的原始对象（含 slug/name/why），文案字段是 why（中文）与 whyEn。
   * 前端按语言取 why / whyEn —— 所以在内嵌 JSON 里两个都要留。 */
  const treeJson = treeData.map((t) => ({
    when: t.when,
    pick: { ...t.pick }, alt: t.alt ? { ...t.alt } : null,
    caveat: t.caveat, caveatEn: t.caveatEn,
  }));
  // 把 whyEn 并进 pick/alt（前端读 e.why / e.whyEn）
  for (const t of treeJson) {
    const src = treeData.find((x) => x.when === t.when);
    t.pick.whyEn = src.pick.whyEn;
    if (t.alt) t.alt.whyEn = src.alt.whyEn;
  }
  const ENGINE_TREE_JS = fs.readFileSync(path.join(HERE, 'engine-tree.js'), 'utf8');

  const engineTreePanel = () => `        <div class="panel">
          <h2>${bi('决策树：三个问题选引擎', 'Decision tree: three questions')}</h2>
          <p class="t-sm">${bi('这不是排名。每个结果都指向对应的<b>引擎档案</b>，而档案里写了判断依据；本站不做实测。', 'This is not a ranking. Every result links to the matching <b>engine profile</b>, where the reasoning lives. This site runs no measurements.')}</p>
          <div class="etree">
            <div class="etree-row">
              <label class="etree-f"><span class="etree-h">${bi('目标平台', 'Target platform')}</span>
                <select class="etree-p">
                  <option value="">${bi('选择…', 'Choose…')}</option>
                  <option value="web">${bi('网页（浏览器里直接玩）', 'Web (in the browser)')}</option>
                  <option value="desktop">${bi('桌面 / 主机', 'Desktop / console')}</option>
                  <option value="mobile">${bi('手机原生', 'Native mobile')}</option>
                </select></label>
              <label class="etree-f"><span class="etree-h">${bi('需要 3D 吗', 'Need 3D?')}</span>
                <select class="etree-d">
                  <option value="">${bi('选择…', 'Choose…')}</option>
                  <option value="yes">${bi('需要', 'Yes')}</option>
                  <option value="no">${bi('不需要，2D 够用', 'No, 2D is enough')}</option>
                </select></label>
              <label class="etree-f"><span class="etree-h">${bi('团队有人写过 Rust / Java / Kotlin 吗', 'Does anyone write Rust / Java / Kotlin?')}</span>
                <select class="etree-s">
                  <option value="">${bi('选择…', 'Choose…')}</option>
                  <option value="yes">${bi('有', 'Yes')}</option>
                  <option value="no">${bi('没有，都是脚本语言', 'No, script languages only')}</option>
                </select></label>
            </div>
            <div class="etree-out" aria-live="polite"></div>
            <script type="application/json" class="etree-data">${JSON.stringify(treeJson)}</script>
          </div>
          <script>${ENGINE_TREE_JS}</script>
        </div>

`;

  const rows = engines.map(e => {
    const lab = AI_LABEL[e.fm.aiFriendly] || ['—', '—'];
    const d = DIFF_LABEL[e.fm.difficulty] || ['—', '—'];
    return `            <tr>
              <td><a href="${e.slug}.html"><b>${esc(e.fm.zh)}</b></a></td>
              <td><span class="ai-badge ${e.fm.aiFriendly}">${bi(lab[0], lab[1])}</span></td>
              <td><span class="diff-badge ${e.fm.difficulty || ''}">${bi(d[0], d[1])}</span></td>
              <td><code>${esc(e.fm.script || '')}</code></td>
              <td>${bi(esc(e.fm.tier || ''), esc(e.fm.tierEn || e.fm.tier || ''))}</td>
            </tr>`;
  }).join('\n');

  const cmpHtml = shell({    current: 'vg',
    title: `引擎档案 · AI 做游戏`,
    desc: metaDesc('五个引擎对 AI 的友好度对比', '本站判断，不是官方排名；上手难度是另一条独立的轴，每个判断的依据都写在对应档案里。'),
    canonical: `https://${SITE_INFO.domain}/engines.html`,
    /* B5：引擎对比页的结构性数据。 */
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: '引擎档案 · AI 做游戏',
      url: `https://${SITE_INFO.domain}/engines.html`,
      description: metaDesc('五个引擎对 AI 的友好度对比', '本站判断，不是官方排名。'),
      inLanguage: 'zh-Hans',
      isPartOf: { '@type': 'WebSite', name: 'AI 做游戏', url: `https://${SITE_INFO.domain}/` },
    },
    accent: null,   /* 2026-10-10：取消分站专属色，见上方 SITE_INFO.accent 的删除说明 */
    body: `<div class="container">
        <p class="kicker">${bi('选工具', 'Picking a tool')}</p>
        <h1 class="t-hero">${bi('引擎对 AI 有多友好', 'How AI-friendly each engine is')}</h1>
        <p class="lede">${bi(
          inline('本页的「友好度」是**本站的判断**，不是官方评级，也不是实测数据。判断依据写在每个档案里。'),
          inline('The friendliness ratings here are **the site\'s judgement**, not an official rating and not measured data. The reasoning is in each profile.'),
        )}</p>

        <div class="panel">
          <div class="table-wrap">
            <table class="src">
              <thead><tr>
                <th>${bi('引擎', 'Engine')}</th>
                <th>${bi('AI 友好度', 'AI-friendly')}</th>
                <th>${bi('上手难度', 'Onboarding')}</th>
                <th>${bi('脚本语言', 'Scripting')}</th>
                <th>${bi('类型', 'Tier')}</th>
              </tr></thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
          ${bi('', '') && ''}
          <p class="t-sm mt-2">${bi(
            inline('⚠ 排序按友好度降序 —— **这是本站的判断，不是质量排名**。「上手难度」是另一条轴：**人从零到一个能跑的画面有多费事**（同样未经实测）。星数、许可、最后提交日等**可核验事实**见'),
            inline('⚠ Ordered by friendliness — **this is the site\'s judgement, not a quality ranking**. Onboarding is a separate axis: **how much work it takes a human to get from nothing to a running scene** (also not measured). Verifiable facts (stars, licence, last push) are on'),
          )} <a href="./">${bi('首页的引擎事实表', 'the home page')}</a>。</p>
        </div>

        <div class="panel">
          <h2>${bi('各引擎档案', 'The profiles')}</h2>
          <div class="eng-grid">
${engineCards(true)}
          </div>
        </div>
${engineTreePanel()}

        <div class="panel is-slim">
          <p><a href="./learn.html">${bi('← 返回学习路径', '← Back to the learning path')}</a> · <a href="./">${bi('首页', 'Home')}</a></p>
        </div>
      </div>`,
    repo: SITE_INFO.repo, repoLabel: 'GitHub',
  });
  fs.writeFileSync(path.join(SITE, 'engines.html'), cmpHtml, 'utf8');
}

const learnHtml = shell({
  current: 'vg',
  title: `${SITE_INFO.zh} · 学习路径 · ${SITE_INFO.en}`,
  desc: metaDesc('按做游戏的实际顺序分五个阶段', '每阶段说明做什么、怎么做、常见失败与我们的判断；阶段之间交接处的失败点另有专页。'),
  canonical: `https://${SITE_INFO.domain}/learn.html`,
  /* B5：学习路径页的结构性数据。 */
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '学习路径 · AI 做游戏',
    url: `https://${SITE_INFO.domain}/learn.html`,
    description: metaDesc('按做游戏的实际顺序分五个阶段', '每阶段说明做什么、怎么做、常见失败与我们的判断。'),
    inLanguage: 'zh-Hans',
    isPartOf: { '@type': 'WebSite', name: 'AI 做游戏', url: `https://${SITE_INFO.domain}/` },
  },
  accent: null,   /* 2026-10-10：取消分站专属色，见上方 SITE_INFO.accent 的删除说明 */
  body: `<div class="container">
        <p class="kicker">${esc(SITE_INFO.zh)}</p>
        <h1 class="t-hero">${bi('学习路径', 'Learning path')}</h1>
        <p class="lede">${bi(
          '按做游戏的实际顺序分五阶段，不按工具组织。每阶段四件事：做什么 · 怎么做 · 常见失败 · 我们的判断。',
          'Five stages in the order you actually build a game, not organised by tool. Each covers four things: what, how, common failures, and our judgement.',
        )}</p>

        <div class="panel">
          <h2>${bi('五个阶段', 'The five stages')}</h2>
          <div class="stage-grid">
${stageTerms.map(stageCard).join('\n')}
          </div>
        </div>

        <div class="panel">
          <h2>${bi('关键词', 'Keywords')}</h2>
          <p class="t-sm mb-3">${bi('不属于单一阶段的概念。', 'Concepts that do not belong to a single stage.')}</p>
          <ul class="kw-list">
${keywords.map(kwItem).join('\n')}
          </ul>
        </div>

        ${engines.length ? `<div class="panel">
          <h2>${bi('引擎档案', 'Engine profiles')}</h2>
          <p class="t-sm mb-3">${bi(
            inline('五个引擎对 AI 的友好度。⚠ **这是本站的判断**，不是官方评级 —— 依据写在每个档案里。'),
            inline('Five engines by how AI-friendly they are. ⚠ **This is the site\'s judgement**, not an official rating — the reasoning is in each profile.'),
          )}</p>
          <div class="eng-grid">
${engineCards(true)}
          </div>
          <p class="t-sm mt-2"><a href="./engines.html">${bi('→ 看对比表', '→ See the comparison table')}</a></p>
        </div>` : ''}

        <div class="panel">
          <h2>${bi('贯穿流程', 'Across the stages')}</h2>
          <p class="t-sm mb-3">${bi(
            inline('上面按阶段拆开讲；这两页把它们缝起来 —— 一页讲**交接处的失败**，一页给**可抄的骨架**。'),
            inline('The stages above are split apart; these two pages stitch them together — one on **failures at the handoff**, one with **skeletons you can copy**.'),
          )}</p>
          <ul class="kw-list">
            <li><a href="./method.html"><b>${bi('实战流程', 'The build order')}</b></a>
              <span class="t-sm">${bi('五步串成一条线，专讲阶段之间的失败点', 'The five steps as one line, focused on failures between stages')}</span></li>
            <li><a href="./demos.html"><b>${bi('最小可玩原型代码清单', 'Minimal prototype code list')}</b></a>
              <span class="t-sm">${bi('五个引擎各一份「能操作 / 有目标 / 有反馈」的骨架', 'One operable / goal-directed / responsive skeleton per engine')}</span></li>
          </ul>
        </div>

        <div class="panel is-slim">
          <p><a href="./">${bi('← 回到首页（先看三张判定表）', '← Back to the home page (start with the three tables)')}</a></p>
        </div>
      </div>`,
  repo: SITE_INFO.repo, repoLabel: 'GitHub',
});

// ── 每个词条一个详情页 ──
/* 「有序路径」的游标：17 个词条（12 个带 stage + 5 个关键词）按上面的 sort 串成一条线。
 * 位置数字由数据算出（R4：不手写），改动词条数时页面自动跟着变。 */
function pathNav(t) {
  const i = terms.indexOf(t);
  const prev = i > 0 ? terms[i - 1] : null;
  const next = i < terms.length - 1 ? terms[i + 1] : null;
  const cell = (x, cls, label) => (x
    ? `<a class="${cls}" href="${esc(x.slug)}.html"><span class="tn-dir">${label}</span><b>${esc(x.fm.zh)}</b></a>`
    : `<span class="${cls} is-empty" aria-hidden="true"></span>`);
  return `        <div class="panel is-slim">
          <p class="t-xs">${bi(`有序路径 · 第 ${i + 1} / ${terms.length} 篇`, `Ordered path · item ${i + 1} of ${terms.length}`)}</p>
          <nav class="term-nav" aria-label="上一篇 / 下一篇">
            ${cell(prev, 'tn-prev', bi('← 上一篇', '← Previous'))}
            ${cell(next, 'tn-next', bi('下一篇 →', 'Next →'))}
          </nav>
          <p class="mt-2"><a href="./learn.html">${bi('← 返回学习路径', '← Back to the learning path')}</a> · <a href="./">${bi('首页', 'Home')}</a></p>
        </div>`;
}

for (const t of terms) {
  const isStage = !!t.fm.stage;
  const html = shell({
    current: 'vg',
    title: `${t.fm.zh} · ${SITE_INFO.zh}`,
    desc: metaDesc(t.fm.what, t.fm.decision),
    canonical: `https://${SITE_INFO.domain}/${t.slug}.html`,
    /* B5：阶段词条 / 关键词词条的结构性数据。 */
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: t.fm.zh,
      url: `https://${SITE_INFO.domain}/${t.slug}.html`,
      description: metaDesc(t.fm.what, t.fm.decision),
      inLanguage: 'zh-Hans',
      isPartOf: { '@type': 'WebSite', name: 'AI 做游戏', url: `https://${SITE_INFO.domain}/` },
    },
    accent: null,   /* 2026-10-10：取消分站专属色，见上方 SITE_INFO.accent 的删除说明 */
    body: `<div class="container">
        <p class="kicker"><a href="./learn.html">${bi('学习路径', 'Learning path')}</a>${isStage ? ` · ${bi('第 ' + t.fm.stage + ' 阶段', 'Stage ' + t.fm.stage)}` : ` · ${bi('关键词', 'Keyword')}`}</p>
        <h1 class="t-hero">${esc(t.fm.zh)}</h1>
        ${t.fm.en ? `<p class="lede">${esc(t.fm.en)}</p>` : ''}

        <div class="panel term-meta">
          ${t.fm.what ? `<p class="t-lead">${bi(inline('**这一步决定什么**'), inline('**What this stage decides**'))}${bi('：' + t.fm.what, ': ' + (t.fm.whatEn || t.fm.what))}</p>` : ''}
          ${t.fm.decision ? `<p class="t-sm">${bi(inline('**本站的判断**'), inline('**Our judgement**'))}${bi('：' + t.fm.decision, ': ' + (t.fm.decisionEn || t.fm.decision))}</p>` : ''}
          ${t.fm.confidence ? `<p class="t-xs muted">${bi('性质：' + CONF_LABEL[t.fm.confidence], 'Nature: ' + CONF_EN[t.fm.confidence])}</p>` : ''}
        </div>

        <div class="term-body">
${renderBiBody(t.body)}
        </div>

${pathNav(t)}
      </div>`,
    repo: SITE_INFO.repo, repoLabel: 'GitHub',
  });
  fs.writeFileSync(path.join(SITE, t.slug + '.html'), html, 'utf8');
}

fs.writeFileSync(path.join(SITE, 'learn.html'), learnHtml, 'utf8');

/* ── 贯穿页（A6.4.1 `/method.html` · A6.4.2 `/demos.html`）──
 * 源在 `pages/`，**不走 terms/** —— 它们不是词条：不进那条 17 篇的有序路径，
 * 也不参与 stage/ord 排序。渲染复用同一条管线（renderBiBody + shell），
 * 所以双语规则、markdown 支持、排版类名与词条页完全一致。 */
const PAGES_DIR = path.join(HERE, '..', 'pages');
let pageCount = 0;
if (fs.existsSync(PAGES_DIR)) {
  for (const f of fs.readdirSync(PAGES_DIR).filter(x => x.endsWith('.md')).sort()) {
    const raw = fs.readFileSync(path.join(PAGES_DIR, f), 'utf8');
    const { fm, body } = parseFm(raw);
    const slug = f.replace(/\.md$/, '');
    if (!fm.zh) { console.warn(`  ! pages/${f} 缺 frontmatter zh，跳过`); continue; }
    const html = shell({
      current: 'vg',
      title: `${fm.zh} · ${SITE_INFO.zh}`,
      desc: metaDesc(fm.what, fm.decision),
      canonical: `https://${SITE_INFO.domain}/${slug}.html`,
      /* B5：贯穿页（method / demos）的结构性数据。 */
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: fm.zh,
        url: `https://${SITE_INFO.domain}/${slug}.html`,
        description: metaDesc(fm.what, fm.decision),
        inLanguage: 'zh-Hans',
        isPartOf: { '@type': 'WebSite', name: 'AI 做游戏', url: `https://${SITE_INFO.domain}/` },
      },
      accent: null,   /* 2026-10-10：取消分站专属色，见上方 SITE_INFO.accent 的删除说明 */
      body: `<div class="container">
        <p class="kicker"><a href="./learn.html">${bi('学习路径', 'Learning path')}</a> · ${bi('贯穿流程', 'Across the stages')}</p>
        <h1 class="t-hero">${esc(fm.zh)}</h1>
        ${fm.en ? `<p class="lede">${esc(fm.en)}</p>` : ''}

        <div class="panel term-meta">
          ${fm.what ? `<p class="t-lead">${bi(inline('**这一页解决什么**'), inline('**What this page solves**'))}${bi('：' + fm.what, ': ' + (fm.whatEn || fm.what))}</p>` : ''}
          ${fm.decision ? `<p class="t-sm">${bi(inline('**本站的判断**'), inline('**Our judgement**'))}${bi('：' + fm.decision, ': ' + (fm.decisionEn || fm.decision))}</p>` : ''}
          ${fm.confidence ? `<p class="t-xs muted">${bi('性质：' + CONF_LABEL[fm.confidence], 'Nature: ' + CONF_EN[fm.confidence])}</p>` : ''}
        </div>

        <div class="term-body">
${renderBiBody(body)}
        </div>

        <div class="panel is-slim">
          <p><a href="./learn.html">${bi('← 返回学习路径', '← Back to the learning path')}</a> · <a href="./">${bi('首页', 'Home')}</a></p>
        </div>
      </div>`,
      repo: SITE_INFO.repo, repoLabel: 'GitHub',
    });
    fs.writeFileSync(path.join(SITE, slug + '.html'), html, 'utf8');
    pageCount++;
    console.log(`  · 贯穿页 ${slug}.html`);
  }
}
console.log(`  · 贯穿页 ${pageCount} 个（pages/*.md）`);

console.log(`\n  · 词条页 ${terms.length} 个（阶段 ${stageTerms.length} · 关键词 ${keywords.length}）`);
console.log(`  · learn.html 索引页`);

export { terms, stageTerms, keywords };

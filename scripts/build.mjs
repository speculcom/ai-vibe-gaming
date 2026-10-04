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
const TEMPLATE = path.join(ROOT, '_sites', '_template');

/* ⚠ Windows 上 import() 不能用绝对路径（ERR_UNSUPPORTED_ESM_URL_SCHEME）——
 * 必须先过 pathToFileURL()。这个坑在 agent 站的构建器里已处理过。*/
const { shell } = await import(pathToFileURL(path.join(TEMPLATE, 'shell.mjs')).href);

// ── 双语节点（放最顶部：任何使用点都在它之后）──
const bi = (zh, en) => `<span data-zh>${zh}</span><span data-en>${en}</span>`;

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

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

// ── 立论层的核心判断（P1 会用 boundary.json 替换这段占位）──
const CLAIMS_PLACEHOLDER = true;

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
            <li><b>${bi('选引擎', 'Pick an engine')}</b><span class="t-sm">${bi('哪个引擎对 AI 最友好', 'Which engine AI handles best')}</span></li>
            <li><b>${bi('核心循环', 'The core loop')}</b><span class="t-sm">${bi('怎么把玩法变成代码', 'Turning mechanics into code')}</span></li>
            <li><b>${bi('手感调参', 'Game feel')}</b><span class="t-sm">${bi('为什么 AI 给的参数不对', 'Why AI’s parameters feel wrong')}</span></li>
            <li><b>${bi('资产合规', 'Asset licensing')}</b><span class="t-sm">${bi('美术 / 音频从哪来，哪些能商用', 'Where assets come from and what is usable')}</span></li>
            <li><b>${bi('导出发布', 'Ship it')}</b><span class="t-sm">${bi('怎么让人玩到', 'Getting it in front of players')}</span></li>
          </ol>
        </div>

        ${CLAIMS_PLACEHOLDER ? `<div class="panel is-slim">
          <p class="t-sm muted">${bi(
            '⚠ 站内内容还在建设中。以下是计划中的三张判定表，尚未成稿：',
            '⚠ This site is still being built. The three tables below are planned but not yet written:',
          )}</p>
          <ul class="t-sm">
            <li>${bi('AI 改变了什么 —— 各环节的成本变化幅度', 'What AI changed — cost movement per stage')}</li>
            <li>${bi('vibe coding 搬不到游戏的地方 —— 为什么做游戏比做软件难', 'What does not carry over from vibe coding')}</li>
            <li>${bi('适合与不适合 —— 什么品类现在做得动', 'Where it fits and where it does not')}</li>
          </ul>
        </div>` : ''}

        <div class="panel">
          <h2>${bi('相关站点', 'Related')}</h2>
          <p class="t-sm">${bi(
            '想看别人已经做出的东西 →',
            'Want to see what others have already built →',
          )} <a href="https://demos.specul.com/">${bi('作品库 Demos', 'Demos')}</a></p>
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
/* ── AI 做游戏站专属 ── */
.stage-list{list-style:none;padding:0;margin:0}
.stage-list li{display:flex;gap:.6em;align-items:baseline;padding:.45em 0;border-top:1px solid var(--border)}
.stage-list li:first-child{border-top:0}
.stage-list b{flex:0 0auto;font-weight:500}
.stage-list .t-sm{color:var(--text-dim)}
.t-lead{font-size:15px;line-height:1.7}
`, 'utf8');

const html = shell({
  current: 'vg',
  title: `${SITE_INFO.zh} · ${SITE_INFO.en}`,
  desc: SITE_INFO.taglineZh,
  canonical: `https://${SITE_INFO.domain}/`,
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
  'User-agent: *\nAllow: /\n', 'utf8');
fs.writeFileSync(path.join(SITE, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>https://${SITE_INFO.domain}/</loc></url>\n</urlset>\n`,
  'utf8');

// 品牌文件：从 www.specul 复制（sync-brand.mjs 也会做，这里保证构建产物自足）
for (const f of ['brand.css', 'brand.js']) {
  const src = path.join(ROOT, 'www.specul', f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(SITE, f));
}

console.log('\n═══ AI 做游戏站已生成 ═══');
console.log(`  输出目录 ${SITE}`);
console.log(`  index.html ${Math.round(html.length / 1024)} KB`);
console.log(`  域名 ${SITE_INFO.domain}`);
console.log('');
#!/usr/bin/env node
/**
 * 连续项目层（P4）：把 projects/three-stars/ 的源文件接进 vg 产物。
 *
 * 产出（全部是构建产物，不要手改）：
 *   site/three-stars.html                          项目页（六阶段教学 + 可玩游戏本体）
 *   site/three-stars/game.js · game.css            源文件原样进产物（页面真的引用它们）
 *   site/three-stars/three-stars.zip               离线可玩的成品包（包内 index.html 只存在于包里）
 *   site/three-stars/manifest.json                 包内逐文件字节数与 SHA-256
 *   site/three-stars/asset-ledger.json             素材与许可台账（机读版，与页面表格同源）
 *   site/three-stars/README.txt · NOTICE.txt       包内说明与许可文字（线上同一份字节）
 *
 * 机制与 build-terms.mjs 一致：本文件由 build.mjs 在**写 sitemap 之前**动态 import，
 * 新页面因此自然进 sitemap（sitemap 按 site/ 实际顶层 .html 枚举）—— 不另造一套构建。
 *
 * ⚠ 双语与顺序约定（照 build.mjs 顶部那五条踩过坑的规则）：
 *   · 辅助函数一律在本文件顶部、所有使用点之前；
 *   · 属性位置不能放 bi() —— 下拉框用 shell 的 nativeOption()，静态 aria-label 用
 *     data-ui-aria-label-zh/-en（brand.js 切换），运行期 aria-label 由 game.js 自己写；
 *   · 正文走 inline()（内部已 esc 一次），代码片段走 esc()（project.json 的 code 里有 `->` 与 `=>`）；
 *   · 数字不用 toLocaleString()（它会跟着机器 locale 变，产物字节就不稳）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..', '..');
const SITE = path.join(HERE, '..', 'site');
/* 品牌资产来源（铁律 R3）：优先本仓 brand/ 的 vendored 副本，回退主仓。*/
const VENDORED = path.join(HERE, '..', 'brand');
const TEMPLATE = fs.existsSync(path.join(VENDORED, 'shell.mjs')) ? VENDORED : path.join(ROOT, '_sites', '_template');

/* ⚠ Windows 上 import() 必须先过 pathToFileURL()（同 build.mjs）。*/
const { shell, nativeOption } = await import(pathToFileURL(path.join(TEMPLATE, 'shell.mjs')).href);

const NAME = 'three-stars';
const SRC = path.join(HERE, '..', 'projects', NAME);
const OUT = path.join(SITE, NAME);
const DOMAIN = 'vg.specul.com';
const PAGE = NAME + '.html';
const ZIP_NAME = NAME + '.zip';
const REPO = 'https://github.com/speculcom/ai-vibe-gaming';
/* 包内日期写死：zip.mjs 的 DOS 时间戳同样是常量 —— 两者一起保证
 * 「同一份源码 → 同一份包字节」，页面公布的哈希才不会每次构建都漂。改版号时手动改这里。*/
const RELEASED = '2026-11-06';

// ── 双语节点、转义与格式化（必须全部在使用点之前）──
const bi = (zh, en) => `<span data-zh>${zh}</span><span data-en>${en}</span>`;
const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');
/* 行内 markdown → HTML：与 build.mjs / build-terms.mjs 的同名函数**逐条规则一致**
 * （粗体用非贪婪、斜体排在粗体之后、代码、站内相对路径与 https 链接）。*/
const inline = (s) => esc(s)
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, text, href) => {
    if (/^https?:/.test(href)) return `<a href="${href}" target="_blank" rel="noopener">${text}</a>`;
    if (/^(?:\.{0,2}\/|[^/:]*\.html|#)/.test(href)) return `<a href="${href}">${text}</a>`;
    return m;
  });
/** [中文, 英文] → 双节点（正文一律走 inline，保证只 esc 一次且能吃 markdown）*/
const bp = (pair) => bi(inline(pair[0]), inline(pair[1]));
/** 千分位（固定写法，不受 locale 影响）*/
const num = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
/* meta description：与 build-terms.mjs 的 metaDesc 同一口径（50–160，按转义后长度收敛）。*/
function metaDesc(...parts) {
  let out = '';
  for (const p of parts) {
    const s = String(p == null ? '' : p).replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (!s) continue;
    out = out ? out + ' ' + s : s;
    if (esc(out).length >= 70) break;
  }
  if (esc(out).length < 50) out = (out + ' —— 本站编写的浏览器样例，六个阶段逐步加入暂停、存档、触屏、适配与发布检查。').trim();
  let n = out.length;
  while (n > 0 && esc(out.slice(0, n) + '…').length > 158) n -= Math.max(1, esc(out.slice(0, n) + '…').length - 158);
  return n < out.length ? out.slice(0, n).replace(/[\s,，、;；:：\-—]+$/, '') + '…' : out;
}
/** 按行软换行：只拆超过 width 的行，保留缩进与空行（README/NOTICE 是纯文本，不能靠正则把 \\n 吃掉）*/
function wrapText(s, width = 76) {
  return String(s).replace(/\r\n/g, '\n').split('\n').map((line) => {
    if (line.length <= width) return line.replace(/[ \t]+$/, '');
    const indent = (line.match(/^[ \t]*/) || [''])[0];
    const words = line.trim().split(/[ \t]+/);
    const out = [];
    let cur = indent + words[0];
    for (const w of words.slice(1)) {
      if ((cur + ' ' + w).length > width) { out.push(cur); cur = indent + w; }
      else cur += ' ' + w;
    }
    return out.concat(cur).join('\n');
  }).join('\n').replace(/^\n+/, '').replace(/\n+$/, '') + '\n';
}

// ── 源文件 ──
const proj = JSON.parse(fs.readFileSync(path.join(SRC, 'project.json'), 'utf8'));
const ledger = JSON.parse(fs.readFileSync(path.join(SRC, 'assets.json'), 'utf8'));
const GAME_JS = fs.readFileSync(path.join(SRC, 'game.js'), 'utf8');
const GAME_CSS = fs.readFileSync(path.join(SRC, 'game.css'), 'utf8');
const { makeZip, sha256 } = await import(pathToFileURL(path.join(SRC, 'zip.mjs')).href);
const STAGES = proj.stages;
if (!Array.isArray(STAGES) || !STAGES.length) throw new Error('project.json 里没有 stages');

/* ── 链接与资产前缀：线上页与包内页只差这两处 ──
 * 线上：three-stars.html 在 site/ 根，资产在同名子目录；
 * 包内：index.html 与资产同级（zip.mjs 只认扁平文件名）。
 * 包内没有站内其它页面，所以那些链接指回线上原件（离线时读者仍能看到出处）。*/
const ctxOf = (mode) => ({
  mode,
  asset: (f) => mode === 'package' ? './' + f : './' + NAME + '/' + f,
  site: (f) => mode === 'package' ? `https://${DOMAIN}/${f}` : './' + f,
});

// ── 游戏工作台：DOM 契约来自 game.js（#three-stars + #game-* + [data-move]）──
function workbench(c) {
  const stageOptions = STAGES
    .map((s) => nativeOption(String(s.id), `阶段 ${s.id} · ${s.title[0]}`, `Stage ${s.id} · ${s.title[1]}`))
    .join('\n                ');
  return `        <section class="star-workbench" id="three-stars">
          <h2 id="workbench-title">${bi('游戏本体：7×5 棋盘，三颗星，一扇门', 'The game itself: a 7×5 board, three stars, one door')}</h2>
          <p class="t-sm">${bi('方向键或 WASD 移动；踩到 ★ 收星，收齐三颗之后走到 E 才算完成。下面的「阶段」选择器决定哪些控件出现 —— 那些控件正是这六个阶段要讲的东西。', 'Arrows or WASD move. Step on ★ to collect a star; reaching E only completes the round after all three. The stage selector below decides which controls appear — those controls are the six lessons.')}</p>
          <div class="star-tools">
            <label>${bi('阶段（决定可见控件）', 'Stage (decides which controls show)')}
              <select id="game-stage" aria-label="教学阶段" data-ui-aria-label-zh="教学阶段" data-ui-aria-label-en="Teaching stage">
                ${stageOptions}
              </select>
            </label>
            <button type="button" id="game-pause" hidden>${bi('暂停', 'Pause')}</button>
            <button type="button" id="game-restart">${bi('重新开始', 'Restart')}</button>
          </div>
          <div class="star-tools" id="game-viewport-controls" hidden>
            <label>${bi('棋盘宽度（显示练习，不改存档坐标）', 'Board width (a display exercise; saved coordinates stay grid coordinates)')}
              <select id="game-viewport" aria-label="棋盘宽度" data-ui-aria-label-zh="棋盘宽度" data-ui-aria-label-en="Board width">
                ${nativeOption('default', '默认宽度', 'Default width')}
                ${nativeOption('narrow', '窄棋盘', 'Narrow board')}
              </select>
            </label>
          </div>
          <div class="star-grid" id="game-board" role="grid" tabindex="0"
               aria-label="三颗星棋盘：方向键或 WASD 移动"
               data-ui-aria-label-zh="三颗星棋盘：方向键或 WASD 移动"
               data-ui-aria-label-en="Three-star board: use arrows or WASD to move"></div>
          <p class="t-sm" id="game-status" role="status" aria-live="polite">${bi('位置 1,1 · 星星 0/3 · 步数 0。收集三颗星，再到 E 出口。', 'Position 1,1 · Stars 0/3 · Moves 0. Collect three stars, then reach E.')}</p>
          <div class="star-touch" id="game-touch" hidden>
            <button type="button" data-move="up" aria-label="向上移动" data-ui-aria-label-zh="向上移动" data-ui-aria-label-en="Move up">▲</button>
            <button type="button" data-move="left" aria-label="向左移动" data-ui-aria-label-zh="向左移动" data-ui-aria-label-en="Move left">◀</button>
            <button type="button" data-move="down" aria-label="向下移动" data-ui-aria-label-zh="向下移动" data-ui-aria-label-en="Move down">▼</button>
            <button type="button" data-move="right" aria-label="向右移动" data-ui-aria-label-zh="向右移动" data-ui-aria-label-en="Move right">▶</button>
          </div>
          <div id="game-save-controls" hidden>
            <div class="star-tools">
              <button type="button" id="game-save">${bi('保存到浏览器', 'Save in this browser')}</button>
              <button type="button" id="game-load">${bi('载入浏览器存档', 'Load browser save')}</button>
              <button type="button" id="game-delete-save">${bi('删除本项目存档', 'Delete this project’s save')}</button>
              <button type="button" id="game-export">${bi('下载存档文件', 'Download save file')}</button>
              <label>${bi('读入存档文件', 'Import save file')}
                <input type="file" id="game-import" accept=".json,application/json">
              </label>
            </div>
            <p class="t-xs" id="game-storage">${bi('还没有此项目存档。保存仅在当前浏览器与当前站点；不上传。', 'No project save yet. Saving stays in this browser and origin; it is not uploaded.')}</p>
          </div>
          <div class="star-publish" id="game-publish-checks" hidden>
            <h3>${bi('阶段 6 · 发布前自己勾一遍', 'Stage 6 · tick these before you ship')}</h3>
            <label><input type="checkbox"><span>${bi(inline('在**别人的机器**上解包并打开过，不是只在自己开发机跑过'), inline('Unpacked and opened on **someone else’s machine**, not only your own'))}</span></label>
            <label><input type="checkbox"><span>${bi('用解包后的文件实际玩过：移动、暂停、存档、导入与导出', 'Played the extracted files: movement, pause, saves, import and export')}</span></label>
            <label><input type="checkbox"><span>${bi('台账里每条素材的来源与再分发权利都能当场指出', 'Every ledger row’s origin and redistribution right can be named on the spot')}</span></label>
            <label><input type="checkbox"><span>${bi('路径大小写与相对路径检查过（本地能跑不等于服务器能跑）', 'Path case and relative paths checked (works locally does not mean works served)')}</span></label>
            <label><input type="checkbox"><span>${bi('目标浏览器、窄屏与实际协议下的存储行为确认过', 'Target browsers, a narrow screen and storage behaviour under the protocol you ship were confirmed')}</span></label>
          </div>
          <p class="t-xs">${bi(`棋盘由构建时复制过来的 <code>${c.asset('game.js')}</code> 画，样式是同目录的 <code>game.css</code>；两者都不是手写进页面的。`, `The board is drawn by <code>${c.asset('game.js')}</code>, copied at build time; its styles are the sibling <code>game.css</code>. Neither is hand-written into the page.`)}</p>
        </section>`;
}

// ── 六阶段正文（构建期写进 HTML：关掉脚本也要读得清）──
/* 外层用 `.panel.game-stages`：game.css 的 `.game-stages > section`（分隔线与
 * scroll-margin-top）与 `.game-stages pre`（代码块底色）都靠这个父级才生效。*/
function stageSections() {
  const item = (arr) => arr.map((x) => `            <li>${bi(inline(x[0]), inline(x[1]))}</li>`);
  const sections = STAGES.map((s) => {
    const next = s.next ? STAGES.find((x) => x.id === s.next) : null;
    return `        <section id="stage-${s.id}">
          <h3>${bi('阶段 ' + s.id + ' · ' + s.title[0], 'Stage ' + s.id + ' · ' + s.title[1])}</h3>
          <p class="t-sm">${bi(inline('**这一步改什么**'), inline('**What changes here**'))}${bi('：', ': ')}${bp(s.change)}</p>
          <p class="t-sm">${bi(inline('**代码在哪一层**'), inline('**Where the code sits**'))}</p>
          <pre class="code"><code>${esc(s.code)}</code></pre>
          <p class="t-sm">${bi(inline('**怎么检查它真的成立**'), inline('**How to check it actually holds**'))}</p>
          <ul>
${item(s.check).join('\n')}
          </ul>
          <p class="t-sm">${bi(inline('**不成立时先看哪里**'), inline('**Where to look when it does not**'))}</p>
          <ul>
${item(s.failure).join('\n')}
          </ul>
          <p class="t-sm">${next
    ? `<a href="#stage-${next.id}">${bi('→ 下一阶段：' + next.title[0], '→ Next stage: ' + next.title[1])}</a>`
    : bi('这是最后一个阶段。勾一遍上面工作台里「发布前自己勾一遍」那几条，再按下一节的清单核对包内文件。', 'This is the last stage. Tick the release list in the workbench above, then check the package files against the next section.')}</p>
        </section>`;
  }).join('\n');
  return `        <div class="panel game-stages">
${sections}
        </div>`;
}

// ── 素材与许可台账 ──
function ledgerBlock() {
  const rows = ledger.items.map((it) => `              <tr>
                <td><b>${bp(it.file)}</b></td>
                <td>${bp(it.origin)}</td>
                <td>${bp(it.role)}</td>
                <td>${bp(it.licence)}</td>
                <td>${bp(it.rights)}</td>
              </tr>`).join('\n');
  return `        <div class="panel" id="ledger">
          <h2>${bi('素材与许可台账', 'Asset and licensing ledger')}</h2>
          <p class="t-sm">${bp(ledger.scope)}</p>
          <p class="t-sm">${bp(ledger.terms)} <a href="https://specul.com/legal.html#s1" target="_blank" rel="noopener">${bi('法律页第 1 节', 'section 1 of the legal page')}</a> · <a href="https://specul.com/legal.html#s8" target="_blank" rel="noopener">${bi('第 8 节（隐私与本地存储）', 'section 8 on privacy and local storage')}</a></p>
          <div class="table-wrap">
            <table class="src">
              <thead><tr>
                <th>${bi('条目', 'Item')}</th>
                <th>${bi('来源', 'Origin')}</th>
                <th>${bi('用途', 'Role')}</th>
                <th>${bi('许可', 'Licence')}</th>
                <th>${bi('再分发权利', 'Redistribution')}</th>
              </tr></thead>
              <tbody>
${rows}
              </tbody>
            </table>
          </div>
          <p class="t-xs">${bi('性质：本站按文件与行为逐条核对，核验日 ' + ledger.verified + '。这不是法律意见，也不代替你去读上游条款原文。', 'Nature: checked row by row against the files and their behaviour on ' + ledger.verified + '. This is not legal advice and does not replace reading the upstream terms.')}</p>
        </div>`;
}

// ── 下载面板（线上页有包大小与逐文件哈希；包内页只列文件名 —— 清单要含 index.html 自己的哈希，
//    而哈希不能写回它自己，所以包内页把数字交给 manifest.json，避免自指）──
function downloadBlock(c, pkg) {
  const site = c.mode === 'site';
  const table = site
    ? `          <div class="table-wrap">
            <table class="src">
              <thead><tr>
                <th>${bi('包内文件', 'File')}</th>
                <th>${bi('字节', 'Bytes')}</th>
                <th>${bi('SHA-256', 'SHA-256')}</th>
              </tr></thead>
              <tbody>
${pkg.manifest.files.map((f) => `                <tr><td><code>${esc(f.path)}</code></td><td>${num(f.bytes)}</td><td class="t-xs"><code>${f.sha256}</code></td></tr>`).join('\n')}
              </tbody>
            </table>
          </div>`
    : `          <ul class="t-sm">
${pkg.names.map((n) => `              <li><code>${esc(n)}</code></li>`).join('\n')}
          </ul>`;
  const zipLine = site
    ? `          <p class="t-sm"><a href="${c.asset(ZIP_NAME)}" download>${bi('→ 下载成品包 three-stars.zip', '→ Download the package three-stars.zip')}</a> · ${num(pkg.bytes)} B · <span class="t-xs">${bi('整包 SHA-256', 'archive SHA-256')}</span> <code>${pkg.sha256}</code></p>`
    : `          <p class="t-sm">${bi('你现在打开的就是解压出来的这一份。成品包本体在站点上：', 'You are looking at the unpacked copy. The archive itself lives on the site:')} <a href="https://${DOMAIN}/${NAME}/${ZIP_NAME}" target="_blank" rel="noopener"><code>${ZIP_NAME}</code></a> · <a href="https://${DOMAIN}/${PAGE}" target="_blank" rel="noopener">${bi('线上页面', 'the online page')}</a> · <a href="./manifest.json">${bi('逐文件哈希', 'per-file hashes')}</a></p>`;
  return `        <div class="panel" id="package">
          <h2>${bi('可下载成品包', 'The downloadable package')}</h2>
${zipLine}
          <p class="t-sm">${site
    ? bi('包内逐文件的字节数与哈希（同一份清单也放在包里，你可以解压后逐条比对）：', 'Per-file bytes and hashes inside the package (the same list ships inside the archive, so you can compare entry by entry after extracting):')
    : bi('这个包里应该有这些文件（逐文件的字节数与 SHA-256 在 <code>manifest.json</code> 里）：', 'These are the files this package should contain (per-file bytes and SHA-256 are in <code>manifest.json</code>):')}</p>
${table}
          <p class="t-sm">${bi('打开方式：解压后直接双击 <code>index.html</code> 就能玩 —— 样式、脚本与品牌资源都在包内，不发请求。要做完整检查时再起一个本地静态服务打开一次：<code>file://</code> 下的 localStorage 与站点来源的策略不同，这一项要按你实际发布的协议另测。', 'How to open: extract and double-click <code>index.html</code> and it plays — styles, scripts and brand assets are inside and nothing is requested. For a full check, also serve the folder over a local static server: localStorage under <code>file://</code> is not governed like a site origin, so that item has to be re-tested under the protocol you actually ship on.')}</p>
          <p class="t-sm">${bi('独立核对：本站用独立解压工具与 zip 校验各跑过一遍（CRC、逐文件字节比对、离线打开）。结论与局限写在下一节。', 'Independent checks: this site extracted and verified the archive with separate tooling (CRC, byte-for-byte file comparison, opening it offline). The conclusions and their limits are in the next section.')}</p>
          <p class="t-xs">${bi(`机读版台账：<a href="${c.asset('asset-ledger.json')}">asset-ledger.json</a> · 哈希清单：<a href="${c.asset('manifest.json')}">manifest.json</a> · 包内说明：<a href="${c.asset('README.txt')}">README.txt</a> · 许可文字：<a href="${c.asset('NOTICE.txt')}">NOTICE.txt</a>`, `Machine-readable ledger: <a href="${c.asset('asset-ledger.json')}">asset-ledger.json</a> · hash manifest: <a href="${c.asset('manifest.json')}">manifest.json</a> · package notes: <a href="${c.asset('README.txt')}">README.txt</a> · licence text: <a href="${c.asset('NOTICE.txt')}">NOTICE.txt</a>`)}</p>
        </div>`;
}

/* ── 本站对这个样例做过什么 ──
 * ⚠ 这里每一条都要对得上 _audit/tmp/three-stars/verification.md 的实测行；
 *   没跑过的不写，跑失败的先修好再写。 */
function checkedBlock() {
  const rows = [
    ['从起点收齐三颗星并走到出口，位置、星星数、步数与完成判定一致；撞墙不增加步数。', 'Collected all three stars from the start and reached the exit with matching position, star count, moves and completion; a wall move adds none.'],
    ['无效导入被拒绝：错误版本号、墙内坐标、重复星星与超大文件都不改变当前盘面。', 'Invalid imports rejected: a wrong schema version, a wall coordinate, duplicate stars and an oversized file each leave the board unchanged.'],
    ['存储受限（localStorage 被拒）时仍可完整游玩，并给出下载/读入文件的替代路径。', 'Play stays complete when browser storage is denied, with the download/import route offered instead.'],
    ['键盘与屏幕按钮走同一条移动逻辑；暂停时两者都不生效；Tab 能进出棋盘与控件。', 'Keyboard and on-screen buttons share one move path; neither moves while paused; Tab enters and leaves the board and the controls.'],
    ['320px 窄屏、触屏点按、明暗两主题、中英切换都过；改窗口尺寸与换棋盘宽度不丢状态。', 'A 320px narrow screen, taps, both themes and both languages pass; resizing the window or switching board width keeps the state.'],
    ['关掉脚本后六个阶段仍读得完整 —— 教学文案是构建期内嵌的静态 HTML，不靠 JS 注入。', 'With scripting off the six stages stay fully readable — the teaching text is static HTML inlined at build time, not injected by JS.'],
    ['下载包：独立工具解压、逐文件与源字节比对、CRC 校验、离线直接打开可玩。', 'The package: extracted with an independent tool, compared byte-for-byte against its sources, CRC-checked, and opened offline without a server.'],
  ];
  return `        <div class="panel" id="checked">
          <h2>${bi('本站检查过什么 · 没检查什么', 'What this site checked · and did not')}</h2>
          <p class="t-sm mb-3">${bi(`核验日 ${RELEASED}，范围只有这一份样例与这一个包；下面每一条都在浏览器里实际跑过，不是代码意图。`, `Verified on ${RELEASED}, scoped to this sample and this package only; every line below was run in a browser, not merely read off the code.`)}</p>
          <ul class="t-sm">
${rows.map((r) => `            <li>${bi(r[0], r[1])}</li>`).join('\n')}
          </ul>
          <p class="t-sm">${bi('这些结论不覆盖：其它浏览器与真机设备、其它站点协议下的存储策略、长时间游玩的手感，以及任何引擎或 AI 产品的能力评价。本站不跑分，也不给通过率或正确率。', 'Not covered: other browsers and real devices, storage policy on other origins or protocols, how the feel holds up over a long session, and any judgement of an engine or an AI product. This site runs no benchmarks and publishes no pass rate or accuracy figure.')}</p>
        </div>`;
}

// ── 正文 ──
function bodyHtml(c, pkg) {
  const toc = STAGES.map((s) => `            <li><a href="#stage-${s.id}">${bi(s.id + ' · ' + s.title[0], s.id + ' · ' + s.title[1])}</a></li>`).join('\n');
  return `<div class="container game-project">
        <p class="kicker"><a href="${c.site('learn.html')}">${bi('学习路径', 'Learning path')}</a> · ${bi('连续项目', 'Worked project')}</p>
        <h1 class="t-hero">${bp(proj.title)}</h1>
        <p class="lede">${bp(proj.intro)}</p>

        <div class="panel term-meta">
          <p class="t-lead">${bi(inline('**这是什么**'), inline('**What this is**'))}${bi('：', ': ')}${bi('本站编写的浏览器小游戏，配一段六阶段的连续教学。同一个样例逐步加入暂停、版本化存档、触屏、尺寸适配与发布检查，代码和说明一起改。', 'a browser game written for this site with a six-stage teaching sequence. The same sample gains pause, versioned saves, touch controls, resizing and release checks — the code and the prose change together.')}</p>
          <p class="t-sm">${bi(inline('**检查范围**'), inline('**Scope of the checks**'))}${bi('：', ': ')}${bi('下方「本站检查过什么」只针对这一份样例与这一个下载包。它不是引擎评测，也不是 AI 产品评测，不构成任何通过率或正确率结论。', 'the section "What this site checked" covers this sample and this package only. It is not an engine evaluation and not an AI-product evaluation, and it supports no pass-rate or accuracy claim.')}</p>
          <p class="t-sm">${bi(inline('**数据流向**'), inline('**Where the data goes**'))}${bi('：', ': ')}${bi('无账号、无后端、无网络请求。存档只写在你自己的浏览器里（键名 <code>specul-three-stars-v1</code>），导出的 JSON 也在本机。本页出现的示例数值均为虚构。', 'no account, no backend, no network call. Saves go only to your own browser (key <code>specul-three-stars-v1</code>) and the exported JSON stays on your machine. Every example value on this page is fictional.')}</p>
          <p class="t-xs muted">${bi('相关页面：', 'Related pages: ')}<a href="${c.site('s2-核心循环.html')}">${bi('核心循环', 'the core loop')}</a> · <a href="${c.site('存档与离线行为.html')}">${bi('存档与离线行为', 'saves and offline behaviour')}</a> · <a href="${c.site('s5-导出发布.html')}">${bi('导出发布', 'export and ship')}</a> · <a href="${c.site('ai-资产台账.html')}">${bi('AI 资产台账', 'the AI asset ledger')}</a></p>
        </div>

        <div class="panel">
          <h2 id="stages">${bi('六个阶段', 'The six stages')}</h2>
          <p class="t-sm mb-3">${bi('下面六节是完整教学内容，构建时就写进 HTML —— 脚本关掉也照样能读。想边读边试，用工作台的阶段选择器切换控件。', 'The six sections below are the full teaching text, written into the HTML at build time — they read fine with scripting off. Use the workbench’s stage selector to try each one.')}</p>
          <ol class="stage-list">
${toc}
          </ol>
        </div>

${workbench(c)}

        <noscript>
          <div class="panel is-slim">
            <p class="t-sm">${bi('脚本未启用：上面的棋盘是空的，方向按钮也不会动 —— 棋盘要脚本才画得出来。六个阶段的说明、代码片段、检查项、素材台账与下载说明都在正文里，不依赖脚本。要玩这一局，请到 <a href="https://' + DOMAIN + '/' + PAGE + '">线上页面</a> 并允许脚本。', 'Scripting is off: the board above stays empty and the buttons do nothing — the grid needs scripting to be drawn. The six stages, their code, the checks, the asset ledger and the package notes are in the page text and need no script. To play this round, open the <a href="https://' + DOMAIN + '/' + PAGE + '">online page</a> and allow scripting.')}</p>
          </div>
        </noscript>

${stageSections()}
${ledgerBlock()}
${downloadBlock(c, pkg)}
${checkedBlock()}

        <div class="panel is-slim">
          <h2>${bi('这个样例不说的', 'What this sample does not claim')}</h2>
          <ul class="t-sm">
            <li>${bi('不证明任何引擎或 AI 产品的好坏，只说明这份 7×5 样例自己的代码行为', 'It proves nothing about an engine or an AI product; it describes this 7×5 sample’s own code behaviour')}</li>
            <li>${bi('不给通过率、正确率或「一次就写对」的数字', 'No pass rate, accuracy or first-try figure')}</li>
            <li>${bi('下载包不另行授予复制、改编、再分发或商业使用许可（见上面台账与法律页第 1 节）', 'The download grants no separate licence to copy, adapt, redistribute or use commercially (see the ledger above and section 1 of the legal page)')}</li>
          </ul>
          <p><a href="${c.site('learn.html')}">${bi('← 返回学习路径', '← Back to the learning path')}</a> · <a href="${c.site('demos.html')}">${bi('作品库', 'the showcase')}</a> · <a href="${c.site('method.html')}">${bi('实战流程', 'the build order')}</a> · <a href="${c.site('index.html')}">${bi('首页', 'Home')}</a></p>
        </div>
      </div>
      <script src="${c.asset('game.js')}"></script>`;
}

/* ── game.css 的 head link ──
 * ⚠ 为什么构建期补一次：shell() 的 headExtra 只在传了 accent 时才输出，而 vg 已定案
 *   不传分站专属色（accent 必须是 null），否则会重新引入亮色底 1.62:1 那个缺陷。
 *   这里只在**本页产物**的 site.css 之后插一条 link，不改共享外壳、不内联 --accent。*/
function withGameCss(html, c) {
  const tag = `  <link rel="stylesheet" href="${c.asset('game.css')}" />`;
  if (html.includes(tag)) return html;
  const anchor = '  <link rel="stylesheet" href="site.css" />';
  if (!html.includes(anchor)) throw new Error('shell 产物里找不到 site.css 的 link —— 外壳改了，本页的 game.css 会被静默丢掉');
  return html.replace(anchor, anchor + '\n' + tag);
}

// ── 台账 / 包内文本（构建期一次生成，线上副本与包内副本同一份字节）──
const ledgerJson = JSON.stringify({
  schema: ledger.schema,
  released: RELEASED,
  verified: ledger.verified,
  scope: ledger.scope,
  terms: ledger.terms,
  licenceTerms: 'https://specul.com/legal.html#s1',
  privacy: 'https://specul.com/legal.html#s8',
  note: ['本页所有条目由本站创作或来自本仓真相源；AI 参与不改变授权范围，实测没有任何条目自动套用 CC BY 或 MIT。',
    'Every row is site-authored or taken from a truth source in this repository; AI involvement does not change the scope of rights, and no row was auto-labelled CC BY or MIT.'],
  items: ledger.items.map((it) => ({
    file: it.file[0], fileEn: it.file[1], origin: it.origin, role: it.role,
    licence: it.licence, redistribution: it.rights,
  })),
}, null, 2) + '\n';

const readmeTxt = wrapText(`
three-stars —— 三颗星，一扇门 / Three stars, one door
Released ${RELEASED} · Specul · https://vg.specul.com/${PAGE}

WHAT THIS IS / 这是什么
本站编写的浏览器小游戏与六阶段连续教学样例：收齐三颗星后走到 E。
A browser game and a six-stage teaching sample written for this site: collect the three stars, then reach E.
无引擎、无账号、无后端、无网络请求；页面里出现的示例数值均为虚构。
No engine, account, backend or network call; every example value shown is fictional.

HOW TO OPEN / 怎么打开
1) 解压到一个文件夹。 / Extract the archive into one folder.
2) 双击 index.html 就能玩：样式、脚本与品牌资源都在包内，不发请求。
   Double-click index.html and it plays: styles, scripts and brand assets are inside; nothing is requested.
3) 完整检查时再用本地静态服务打开一次。file:// 下的 localStorage 与站点来源的策略不同。
   For a full check, also serve the folder over http://localhost. localStorage under file:// is not governed
   like a site origin.

CONTROLS / 操作
方向键或 WASD 移动；P 暂停（阶段 2 起）；屏幕方向按钮（阶段 4 起）；窄棋盘开关（阶段 5 起）；
Arrows or WASD move; P pauses (from stage 2); on-screen direction buttons appear from stage 4;
the narrow-board switch appears from stage 5; the save, load, delete, download and import controls appear
保存到浏览器 / 载入 / 删除 / 下载 / 读入 在阶段 3 起出现。
from stage 3.
页面里的「阶段」选择器决定哪些控件可见 —— 那些控件就是这六个阶段的教学内容。
The stage selector decides which controls are visible; those controls are the teaching content.

FILES / 文件
index.html            页面本体。六阶段说明是构建期内嵌的静态 HTML，关掉脚本也读得完整。
                      The page itself. The six stages are static HTML inlined at build time,
                      readable with scripting off.
game.js · game.css    游戏逻辑与样式，构建时从源仓原样复制。
                      Game logic and styles, copied verbatim from the source repository at build time.
brand.css · brand.js  站群共享外壳与明暗、语言切换（真相源 www.specul/）。
                      Shared shell plus theme and language switching (truth source: www.specul/).
site.css              内容层排版（_sites/_template/site.css 与 _data/game/css/vg.css 拼接）。
                      Content-layer typography, assembled from _sites/_template/site.css and vg.css.
asset-ledger.json     素材与许可台账，机读版。 / The machine-readable asset and licence ledger.
manifest.json         包内逐文件字节数与 SHA-256（清单不记录自己的哈希）。
                      Per-file bytes and SHA-256 (the manifest does not hash itself).
NOTICE.txt            许可与署名口径。 / Licence and attribution terms.

DATA / 数据
浏览器存档键名 specul-three-stars-v1，只写在本机；下载的 JSON 也在本机；不上传任何数据。
The browser save key is specul-three-stars-v1 and stays on your machine; downloaded JSON stays too;
nothing is uploaded.
存档格式：schema 1、关卡 three-stars-1、坐标、步数、已收集星星。读入时校验字段、位置与关卡；
Save format: schema 1, level three-stars-1, coordinates, moves and collected stars. On load the fields,
完成状态由位置与星星推出，不信任文件里的完成标记。本例只接受版本 1，不做版本迁移。
position and level are validated, and completion is derived rather than trusted from a flag in the file.
Version 1 only; no migration is attempted.

LIMITS / 边界
本站在 ${RELEASED} 对这一份样例与这一个包做过清单式检查（通关、无效导入、存储受限、键盘与触屏、
320px 窄屏、明暗两主题、中英切换、无脚本可读、离线打开）。不覆盖其它浏览器、真机设备与其它来源
协议；不评价任何引擎或 AI 产品；不给通过率或正确率。玩法好不好玩，本包不作结论。
This site ran a checklist over this sample and this package on ${RELEASED} (completing the round, rejecting
invalid imports, blocked storage, keyboard and touch, a 320px screen, both themes, both languages, reading
it without scripting, and opening the extracted files offline). Other browsers, real devices and other
origins are not covered; no engine or AI product is evaluated; no pass rate or accuracy figure is published.
Whether the loop is fun is outside the scope of this package.

许可文字见 NOTICE.txt；台账见 asset-ledger.json；条款原文 https://specul.com/legal.html#s1
Licence text: NOTICE.txt. Ledger: asset-ledger.json. Terms: https://specul.com/legal.html#s1
`);

const noticeTxt = wrapText(`
NOTICE — three-stars teaching package / 三颗星教学包
Copyright © 2026 Specul（投机取巧）. All rights reserved, unless noted otherwise.

1. 许可口径 / Licence terms
   本包内由本站创作的文案、代码与样式（index.html 的正文、game.js、game.css、
   asset-ledger.json、manifest.json、README.txt、NOTICE.txt）适用 Specul 站点条款：
   本站未对其单独授予复制、改编、再分发或商业使用许可。正常链接与单句引用欢迎，引用请注明
   「specul.com」并附法律页链接；整篇转载或商业使用请先联系本站。
   The site-authored text, code and styles in this package are released under the Specul site terms:
   no separate licence is granted for copying, adapting, redistributing or commercial use. Links and
   single-sentence quotation are welcome with credit to "specul.com" and a link to the legal page;
   full republication or commercial use needs contact first.
   条款原文 / Terms: https://specul.com/legal.html#s1

2. AI 参与不改变授权范围 / AI involvement does not change the scope of rights
   本包的文件由 AI 起草、由本站按文件与实际行为逐项核对后收录。本站没有因为「由 AI 生成」
   就给任何条目套用 CC BY 4.0 或 MIT；台账的许可列与上面第 1 条一致，另附机读版
   asset-ledger.json。
   Files here were drafted by AI and included after this site checked them against the files and
   their behaviour. Nothing was re-labelled CC BY 4.0 or MIT merely because a model produced it;
   the ledger's licence column matches section 1 above (machine-readable: asset-ledger.json).

3. 第三方素材 / Third-party material
   无。本包不含图片、音频、3D 模型、字体文件或第三方运行时代码，因此没有第三方许可或署名义务。
   页面使用的 ★ ● · E 是文本字符，由读者系统里已有的字体渲染，本包不复制、也不嵌入字体。
   None. The package ships no images, audio, 3D models, font files or third-party runtime code, so
   there are no third-party licence or attribution obligations. The glyphs ★ ● · E are text characters
   rendered by fonts already on the reader's system; no font is copied or embedded.

4. 品牌资产 / Brand assets
   brand.css、brand.js 与其中的名称、图标归 Specul 所有，随包复制只为让样例离线也能打开。
   这不构成再分发许可，也不授予任何商标权（商标条款见法律页第 9 节）。
   brand.css, brand.js and the names and marks inside them belong to Specul. They are copied in only
   so the sample opens offline; that grants no redistribution licence and no trademark rights
   (trademark terms: section 9 of the legal page).

5. 隐私 / Privacy
   游戏不发出网络请求，不上传数据。浏览器存档与下载的 JSON 都留在读者本机；包内文件不含
   账号、标识或个人数据。隐私与本地存储口径见法律页第 8 节。
   The game makes no network request and uploads nothing. Browser saves and downloaded JSON stay on
   the reader's machine; no file in the package carries an account, identifier or personal data.
   Privacy and local storage: https://specul.com/legal.html#s8

6. 免责 / Disclaimer
   样例按「现状」提供，用于教学演示，不担保适用于任何项目；本包不是引擎或 AI 产品的评测结果，
   也不代表任何通过率（免责条款：法律页第 6 节）。
   The sample is provided as is for teaching demonstration, with no warranty that it suits any project.
   It is not an evaluation of an engine or an AI product and implies no pass rate (disclaimer: section 6).

7. 核验范围 / Scope of checks
   ${RELEASED} · 本站对这一份样例与这一个包完成清单式检查；范围与局限公布在
   https://vg.specul.com/${PAGE} 的「本站检查过什么」一节。
   ${RELEASED} - this site ran a checklist over this sample and this package; the scope and its limits
   are published in the "What this site checked" section of https://vg.specul.com/${PAGE}.
`);

// ── 打包：先定稿包内页（它的文案不提自己的哈希），再算清单，最后把包哈希写进线上页 ──
const pkgCtx = ctxOf('package');
const siteCtx = ctxOf('site');
/* 包内文件清单（扁平名 —— zip.mjs 只认 /^[\w.-]+$/，这也是包能直接双击 index.html 的原因）*/
const PACKAGE_NAMES = ['index.html', 'game.js', 'game.css', 'brand.css', 'brand.js', 'site.css',
  'asset-ledger.json', 'README.txt', 'NOTICE.txt', 'manifest.json'];
const packageHtml = withGameCss(shell({
  current: 'vg',
  title: `${proj.title[0]} · 连续项目 · AI 做游戏`,
  desc: metaDesc(proj.intro[0]),
  canonical: `https://${DOMAIN}/${PAGE}`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: proj.title[0],
    url: `https://${DOMAIN}/${PAGE}`,
    description: metaDesc(proj.intro[0]),
    inLanguage: 'zh-Hans',
    isPartOf: { '@type': 'WebSite', name: 'AI 做游戏', url: `https://${DOMAIN}/` },
    mainEntity: { '@type': 'Game', name: proj.title[0], description: proj.intro[1] },
  },
  accent: null,   /* 与全站一致：不传分站专属色（见 build.mjs 的 accent 注释）*/
  body: bodyHtml(pkgCtx, { names: PACKAGE_NAMES }),
  repo: REPO,
}), pkgCtx);

const brandCss = fs.readFileSync(path.join(SITE, 'brand.css'), 'utf8');
const brandJs = fs.readFileSync(path.join(SITE, 'brand.js'), 'utf8');
const siteCssProduct = fs.readFileSync(path.join(SITE, 'site.css'), 'utf8');

const packageFiles = [
  ['index.html', packageHtml],
  ['game.js', GAME_JS],
  ['game.css', GAME_CSS],
  ['brand.css', brandCss],
  ['brand.js', brandJs],
  ['site.css', siteCssProduct],
  ['asset-ledger.json', ledgerJson],
  ['README.txt', readmeTxt],
  ['NOTICE.txt', noticeTxt],
];
const manifest = {
  schema: 1,
  package: ZIP_NAME,
  released: RELEASED,
  scope: ledger.scope,
  note: [
    '清单不记录自己的哈希；成品包 three-stars.zip 的整包 SHA-256 公布在 https://vg.specul.com/' + PAGE + ' 上。',
    'The manifest does not hash itself; the SHA-256 of three-stars.zip is published on https://vg.specul.com/' + PAGE + '.',
  ],
  files: packageFiles.map(([name, text]) => ({
    path: name, bytes: Buffer.byteLength(text), sha256: sha256(Buffer.from(text)),
  })),
};
const manifestJson = JSON.stringify(manifest, null, 2) + '\n';

const zipEntries = [...packageFiles, ['manifest.json', manifestJson]];
const zipBuf = makeZip(Object.fromEntries(zipEntries));
const zipSha = sha256(zipBuf);

// ── 写产物（UTF-8 + LF）──
const LF = (s) => s.replace(/\r\n/g, '\n');
fs.mkdirSync(OUT, { recursive: true });
for (const [name, text] of [['game.js', GAME_JS], ['game.css', GAME_CSS], ['asset-ledger.json', ledgerJson],
  ['manifest.json', manifestJson], ['README.txt', readmeTxt], ['NOTICE.txt', noticeTxt]]) {
  fs.writeFileSync(path.join(OUT, name), LF(text), 'utf8');
}
fs.writeFileSync(path.join(OUT, ZIP_NAME), zipBuf);

const html = withGameCss(shell({
  current: 'vg',
  title: `${proj.title[0]} · 连续项目 · AI 做游戏`,
  desc: metaDesc(proj.intro[0]),
  canonical: `https://${DOMAIN}/${PAGE}`,
  jsonLd: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: proj.title[0],
    url: `https://${DOMAIN}/${PAGE}`,
    description: metaDesc(proj.intro[0]),
    inLanguage: 'zh-Hans',
    isPartOf: { '@type': 'WebSite', name: 'AI 做游戏', url: `https://${DOMAIN}/` },
    mainEntity: { '@type': 'Game', name: proj.title[0], description: proj.intro[1] },
  },
  accent: null,
  body: bodyHtml(siteCtx, { manifest, bytes: zipBuf.length, sha256: zipSha }),
  repo: REPO,
}), siteCtx);
fs.writeFileSync(path.join(SITE, PAGE), LF(html), 'utf8');

console.log(`  · 项目页 ${PAGE}（${Math.round(html.length / 1024)} KB）· 静态资产 ${zipEntries.length - 1} 个文件 + ${NAME}/${ZIP_NAME}`);
console.log(`  · 下载包 ${NAME}/${ZIP_NAME} · ${num(zipBuf.length)} B · 整包 SHA-256 ${zipSha}`);

export { PAGE, ZIP_NAME, zipSha, manifest, packageHtml };

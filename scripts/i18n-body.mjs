import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const HERE = path.dirname(fileURLToPath(import.meta.url));
// 双语正文支持：给build-terms.mjs 加「英文正文」机制。
//
// 机制设计（照 learn 站的做法）：
//   词条 .md 里用 `> ` 引用块承载**英文正文**，
//   中文是默认内容，引用块是它对应的英文。
//   渲染时把引用块转成 <span data-en> 里的内容。
//
// 为什么用引用块而不是另一个文件：
//   **中英对照必须能一起 review** —— 分两个文件会让人译到一半不知道对应哪段。
//   而 learn 站的词条正文已经是这个结构（`> ...`）。
//
// 用法（在 build.mjs 里调用）：
//   const page = renderBody(body);   // 返回 {zh, en}


const R = path.resolve(HERE, '..', 'terms');

/* 把词条的 body 按「引用块 = 英文」拆成两段。
 * 规则：
 *   - 引用块（`> ` 开头）里的连续内容 → 英文片段
 *   - 其余内容 → 中文片段
 *   - 中文片段里的 `<!-- EN:xxx -->` 标记之后是该片段对应的英文
 */
export function splitBilingual(body) {
  const NL = String.fromCharCode(10);
  const lines = body.split(/\r?\n/);

  // 方案：按 `<!-- EN -->` 标记配对。
  // 结构：
  //   <中文片段A>
  //   <!-- EN -->
  //   > <英文片段A>
  //   <中文片段B>
  //   <!-- EN -->
  //   > <英文片段B>
  const chunks = [];      // {zh: [...lines], en: [...]}
  let cur = { zh: [], en: null };

  for (const ln of lines) {
    if (/^\s*<!--\s*EN\s*-->/.test(ln)) {
      // 上一段收尾，开始收集英文
      cur.en = [];
      continue;
    }
    if (cur.en !== null) {
      if (/^\s*>\s?/.test(ln)) {
        cur.en.push(ln.replace(/^\s*>\s?/, ''));
      } else if (ln.trim() === '') {
        cur.en.push('');
      } else {
        // 英文块结束（遇到非引用非空行）
        chunks.push(cur);
        cur = { zh: [], en: null };
        cur.zh.push(ln);
      }
      continue;
    }
    cur.zh.push(ln);
  }
  chunks.push(cur);

  // 去掉 HTML 注释行（层注释不属于任何语言）
  const clean = (arr) => (arr || []).filter(l => !/^\s*<!--[\s\S]*?-->\s*$/.test(l));

  return chunks.map(c => ({
    zh: clean(c.zh).join('\n').trim(),
    en: c.en ? clean(c.en).join('\n').trim() : '',
  })).filter(c => c.zh || c.en);
}

/* 渲染：把 chunk 数组变成 HTML —— 有英文的用 bi() 包起来，没有的只有中文。
 * md() 由调用方传入（它是 build-terms.mjs 里的内部函数）。 */
export function renderBilingual(chunks, md) {
  if (!chunks.length) return '';
  return chunks.map(c => {
    const zhHtml = c.zh ? md(c.zh) : '';
    if (!c.en) return zhHtml;
    const enHtml = md(c.en);
    return `<div class="bi-block">`
      + `<span data-zh>${zhHtml}</span>`
      + `<span data-en>${enHtml}</span>`
      + `</div>`;
  }).join('\n');
}

/* 统计（给审计脚本用） */
export function i18nStats(chunks) {
  const withEn = chunks.filter(c => c.en).length;
  const zhChars = chunks.reduce((n, c) => n + (c.zh.match(/[\u4e00-\u9fff]/g) || []).length, 0);
  const enWords = chunks.reduce((n, c) => n + (c.en.match(/[A-Za-z][A-Za-z'’-]{2,}/g) || []).length, 0);
  return { chunks: chunks.length, withEn, zhChars, enWords };
}

if (process.argv[2] === '--selftest') {
  const demo = `中文第一段。

<!-- EN -->
> The first paragraph in English.

中文第二段。
`;
  const cs = splitBilingual(demo);
  console.log('切分结果：', JSON.stringify(cs, null, 2));
  console.log('统计：', i18nStats(cs));
}
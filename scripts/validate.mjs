#!/usr/bin/env node
/**
 * validate.mjs —— ai-vibe-gaming 内容仓的必填字段校验器
 *
 * 定位：**本仓自足**（R3）—— 只读本仓文件，不依赖 specul 工作区的其他目录。
 * 用途：任何人不合规范地提交内容都会被拦住；也是 A6.4.3「引擎档案字段齐」的持久守卫。
 *
 * 口径（与 `_data/agent-guide/scripts/validate.mjs` 同风格：错误必须为 0，警告可存在）
 *   错误 = 结构缺失 / 枚举非法 / 引用死链 / 编号重复
 *   警告 = 格式可疑但页面仍可用（例如核验日不是 YYYY-MM-DD）
 *
 * ⚠ 有意**不在此处**校验的东西：
 *   · slug 冲突 —— slug 规则是 `scripts/build-terms.mjs` 的真相源，重复在该脚本构建期硬失败，
 *     不在这里复制一份（复制就会有两个真相源，早晚分叉）。
 *   · 文案质量与事实真伪 —— 那是人工核验的事，机器只守结构与格式。
 *
 * 用法：node scripts/validate.mjs
 * 退出码：0 = 通过（可能有警告） · 1 = 有错误
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const TERMS = path.join(ROOT, 'terms');
const ENGINES = path.join(TERMS, 'engines');

const errors = [];
const warnings = [];
const stats = { terms: 0, keywords: 0, stages: 0, engines: 0, pages: 0 };

/* ── frontmatter 子集解析（与 build-terms.mjs 的 parseFm 同规则）── */
function parseFm(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if (/^".*"$/.test(v)) v = v.slice(1, -1);
    else if (/^-?\d+$/.test(v)) v = Number(v);
    fm[kv[1]] = v;
  }
  return { fm, body: text.slice(m[0].length) };
}

/* ── 仓内互链死链检查（本仓铁律：不托管二进制、只索引；正文互引必须真实存在）──
 * ⚠ 只查**相对路径的 .md 引用**。站内 .html 链接由构建器改写，不在这里判。 */
function checkLocalLinks(rel, body) {
  for (const m of body.matchAll(/\]\(([^)]+\.md)\)/g)) {
    const href = m[1];
    if (/^https?:/.test(href)) continue;
    const target = path.resolve(path.dirname(path.join(ROOT, rel)), href.split('#')[0]);
    if (!fs.existsSync(target)) errors.push(`${rel} · 正文死链（仓内没有这个文件）: ${href}`);
  }
}

/* ── 通用必填 ── */
const COMMON = ['zh', 'en', 'what', 'whatEn', 'decision', 'decisionEn', 'confidence'];
const CONFIDENCE = ['our-judgement', 'partial', 'verified'];

function checkCommon(rel, fm, body) {
  for (const k of COMMON) {
    if (fm[k] === undefined || fm[k] === '') errors.push(`${rel} · 缺必填字段 ${k}`);
  }
  if (fm.confidence !== undefined && !CONFIDENCE.includes(fm.confidence)) {
    errors.push(`${rel} · confidence 枚举非法: ${fm.confidence}（允许 ${CONFIDENCE.join(' / ')}）`);
  }
  // R2 中英同步：正文必须带英文块
  if (!/<!--\s*EN\s*-->/.test(body)) errors.push(`${rel} · 正文没有 <!-- EN --> 英文块（违反 R2 中英同步）`);
  if (!/^#\s+\S/m.test(body)) errors.push(`${rel} · 正文缺一级标题`);
  checkLocalLinks(rel, body);
}

/* ── 词条 ── */
const ordSeen = new Map();
for (const f of fs.readdirSync(TERMS).filter((x) => x.endsWith('.md')).sort()) {
  const rel = `terms/${f}`;
  const parsed = parseFm(fs.readFileSync(path.join(TERMS, f), 'utf8'));
  if (!parsed) { errors.push(`${rel} · 缺少 frontmatter`); continue; }
  const { fm, body } = parsed;
  stats.terms++;
  checkCommon(rel, fm, body);

  // ord 是「有序路径」的排序依据（A6.4.4 的上一篇/下一篇就按它），必须齐全且唯一
  if (!Number.isInteger(fm.ord)) errors.push(`${rel} · ord 必须是整数（有序路径依赖它）`);
  else if (ordSeen.has(fm.ord)) errors.push(`${rel} · ord=${fm.ord} 与 ${ordSeen.get(fm.ord)} 重复`);
  else ordSeen.set(fm.ord, rel);

  const hasStage = fm.stage !== undefined && fm.stage !== '';
  const hasKind = fm.kind !== undefined && fm.kind !== '';
  if (!hasStage && !hasKind) errors.push(`${rel} · 必须二选一：stage（1-5）或 kind: "keyword"`);
  if (hasStage && hasKind) errors.push(`${rel} · stage 与 kind 不能同时存在`);
  if (hasStage) {
    stats.stages++;
    if (!Number.isInteger(fm.stage) || fm.stage < 1 || fm.stage > 5) {
      errors.push(`${rel} · stage 必须是 1-5 的整数，现为 ${fm.stage}`);
    }
  }
  if (hasKind) {
    stats.keywords++;
    if (fm.kind !== 'keyword') errors.push(`${rel} · kind 只允许 "keyword"，现为 ${fm.kind}`);
  }
}

/* ── 引擎档案 ── */
const ENGINE_FIELDS = ['engine', 'script', 'scriptEn', 'tier', 'tierEn', 'aiFriendly', 'aiScore',
  'bestFor', 'bestForEn', 'verified',
  /* A6.4.3 新增：安装步骤 + 上手难度（两条轴：aiFriendly 问 AI 出错率，difficulty 问人的起步成本）*/
  'install', 'installEn', 'installSrc', 'installVerified', 'difficulty', 'difficultyWhy', 'difficultyWhyEn'];
const AI_LEVELS = ['high', 'medium', 'low'];
const DIFF_LEVELS = ['low', 'medium', 'high'];

for (const f of fs.readdirSync(ENGINES).filter((x) => x.endsWith('.md')).sort()) {
  const rel = `terms/engines/${f}`;
  const parsed = parseFm(fs.readFileSync(path.join(ENGINES, f), 'utf8'));
  if (!parsed) { errors.push(`${rel} · 缺少 frontmatter`); continue; }
  const { fm, body } = parsed;
  stats.engines++;
  checkCommon(rel, fm, body);

  for (const k of ENGINE_FIELDS) {
    if (fm[k] === undefined || fm[k] === '') errors.push(`${rel} · 引擎档案缺必填字段 ${k}`);
  }
  if (fm.aiFriendly !== undefined && !AI_LEVELS.includes(fm.aiFriendly)) {
    errors.push(`${rel} · aiFriendly 枚举非法: ${fm.aiFriendly}`);
  }
  if (fm.difficulty !== undefined && !DIFF_LEVELS.includes(fm.difficulty)) {
    errors.push(`${rel} · difficulty 枚举非法: ${fm.difficulty}（允许 ${DIFF_LEVELS.join(' / ')}）`);
  }
  if (fm.aiScore !== undefined && (!Number.isInteger(fm.aiScore) || fm.aiScore < 0 || fm.aiScore > 4)) {
    errors.push(`${rel} · aiScore 必须是 0-4 的整数，现为 ${fm.aiScore}`);
  }
  if (fm.installSrc !== undefined && !/^https:\/\//.test(String(fm.installSrc))) {
    errors.push(`${rel} · installSrc 必须是 https 官方文档地址，现为 ${fm.installSrc}`);
  }
  if (fm.installVerified !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(fm.installVerified))) {
    warnings.push(`${rel} · installVerified 不是 YYYY-MM-DD: ${fm.installVerified}`);
  }
  // 两条轴不该完全同向：若完全相同，说明有人把 difficulty 直接抄了 aiFriendly（弱提醒）
  const flipped = { high: 'low', medium: 'medium', low: 'high' };
  if (fm.aiFriendly in flipped && fm.difficulty !== flipped[fm.aiFriendly]) {
    // 不同向是正常的（两条轴本来独立）—— 只在两者**完全相同**时提醒
    if (fm.aiFriendly === fm.difficulty) {
      warnings.push(`${rel} · aiFriendly 与 difficulty 取值相同（${fm.aiFriendly}）—— 确认这是分别判断的，不是照抄`);
    }
  }
}

/* ── 贯穿页（A6.4.1/A6.4.2：pages/*.md → site/<slug>.html）──
 * 与词条用同一套通用必填规则（含决策句与英文块）——**不给新页开小门**，
 * 否则新页迟早变成没人看守的角落。它们不进有序路径，所以不要求 ord/stage/kind。 */
const PAGES = path.join(ROOT, 'pages');
if (fs.existsSync(PAGES)) {
  for (const f of fs.readdirSync(PAGES).filter((x) => x.endsWith('.md')).sort()) {
    const rel = `pages/${f}`;
    const parsed = parseFm(fs.readFileSync(path.join(PAGES, f), 'utf8'));
    if (!parsed) { errors.push(`${rel} · 缺少 frontmatter`); continue; }
    stats.pages++;
    checkCommon(rel, parsed.fm, parsed.body);
  }
}

/* ── 输出 ── */
console.log(`\n词条 ${stats.terms}（阶段 ${stats.stages} · 关键词 ${stats.keywords}） · 引擎 ${stats.engines} · 贯穿页 ${stats.pages}`);
if (errors.length) {
  console.log(`\n错误 ${errors.length} 项：`);
  errors.forEach((e) => console.log('  ✗ ' + e));
}
if (warnings.length) {
  console.log(`\n警告 ${warnings.length} 项：`);
  warnings.forEach((w) => console.log('  ! ' + w));
}
console.log(`\n错误: ${errors.length}  警告: ${warnings.length}`);
console.log(errors.length ? '结果: ❌ 未通过\n' : '结果: ✅ 通过\n');
process.exit(errors.length ? 1 : 0);

#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/**
 * 引擎官方事实核验（2026-10-05）
 *
 * 为 P1 判定表提供**可回溯官方源**的事实底座。
 *
 * ⚠ v3 铁律：只采「能从官方仓库读到的事实」，读不到就记 null，不猜。
 *
 *⚠ 实现说明：**node 直连 api.github.com 在本沙箱有证书问题**
 *   （unable to verify the first certificate），
 *   所以改为**调用 gh.exe**（它能通）—— 每条事实仍来自官方 API。
 */

const GH = process.env.GH_BIN || 'gh';

function gh(args) {
  const out = execFileSync(GH, args, { encoding: 'utf8', maxBuffer: 4 << 20 });
  return JSON.parse(out);
}

/* 首批引擎 —— 覆盖 2D / 3D / 原生 / Web / 轻量 五类。
 * ⚠ 只收**官方组织**下的仓库，避免镜像或 fork。 */
const ENGINES = [
  { key: 'godot',  repo: 'godotengine/godot',   tier: '通用 2D/3D',  script: 'GDScript / C#' },
  { key: 'bevy',   repo: 'bevyengine/bevy',     tier: '原生 3D',     script: 'Rust' },
  { key: 'libgdx', repo: 'libgdx/libgdx',       tier: 'Java 跨平台', script: 'Java / Kotlin' },
  { key: 'pixi',   repo: 'pixijs/pixijs',       tier: 'Web 2D',      script: 'TypeScript' },
  { key: 'three',  repo: 'mrdoob/three.js',     tier: 'Web 3D',      script: 'JavaScript', note: '底层库，不是完整引擎' },
  { key: 'cocos',  repo: 'cocos/cocos-engine',  tier: '2D/3D 跨平台', script: 'TypeScript + C++' },
  { key: 'love',   repo: 'love2d/love',         tier: '2D 轻量',     script: 'Lua / C++ / Fennel' },
  { key: 'raylib', repo: 'raysan5/raylib',      tier: '2D/3D 轻量',  script: 'C' },
];

console.log('\n══════ 引擎官方事实核验（GitHub API via gh.exe，2026-10-05）══════\n');

const out = {};
for (const e of ENGINES) {
  try {
    const d = gh(['api', `repos/${e.repo}`]);
    const rec = {
      key: e.key,
      repo: d.full_name,
      repoUrl: d.html_url,
      stars: d.stargazers_count,
      language: d.language,
      license: (d.license && d.license.spdx_id) || null,
      pushedAt: (d.pushed_at || '').slice(0, 10),
      archived: !!d.archived,
      description: d.description,
      tier: e.tier,
      script: e.script,
      note: e.note || null,
      verifiedAt: '2026-10-05',
      source: `https://api.github.com/repos/${e.repo}`,
    };
    out[e.key] = rec;
    console.log(`  ✓ ${d.full_name}`);
    console.log(`      ★${rec.stars}  ${rec.language}  ${rec.license}  pushed ${rec.pushedAt}${rec.archived ? '  ⚠ARCHIVED' : ''}`);
    console.log(`      ${(rec.description || '').slice(0, 74)}`);
  } catch (err) {
    const msg = String(err.stderr || err.message).split('\n')[0].slice(0, 70);
    console.log(`  ✗ ${e.repo}  —— ${msg}`);
    out[e.key] = { key: e.key, repo: e.repo, error: msg, verifiedAt: '2026-10-05' };
  }
}

const ok = Object.values(out).filter(r => !r.error);
const stars = ok.map(r => r.stars);
console.log(`\n成功 ${ok.length}/${ENGINES.length}` +
  (stars.length ? ` · ★ 区间 ${Math.min(...stars).toLocaleString()} ~ ${Math.max(...stars).toLocaleString()}` : ''));
console.log(`${ENGINES.length - ok} 个读不到 → **不写进判定表**（v3 铁律：未知就说未知）\n`);

/* 产物写回**本仓**的 claims/（铁律 R3：不依赖仓外目录）。 */
const dest = path.join(HERE, '..', 'claims', 'engines-verified.json');
fs.writeFileSync(dest, JSON.stringify(out, null, 2), 'utf8');
console.log(`已写 ${dest}\n`);
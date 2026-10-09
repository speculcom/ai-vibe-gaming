# ai-vibe-gaming

> English version: [README.en.md](./README.en.md)

「AI 做游戏」（Vibe Gaming）的**源仓** —— 唯一真相源。

> 站点：<https://vg.specul.com>
> ⚠ **本仓不发Pages**，产物在 [`speculcom/vibe-gaming`](https://github.com/speculcom/vibe-gaming)

## 这个站要回答什么

**AI 已经改变了做游戏的哪部分，还没改变哪部分。**

核心判断（立论层，见 `claims/`）：

> AI 让做游戏的成本下降是**不均匀**的 —— 写代码降 70~80%，
> 做美术 / 配乐 / 关卡几乎没降。于是「一个人做游戏」的瓶颈
> 从「写不出来」变成了「凑不齐」。

## 内容结构

| 路径 | 内容 | 状态 |
|---|---|---|
| `claims/` | **立论层**（三张判定表）| ✅ 已完成 |
| `terms/` | 五阶段教学词条（Markdown + frontmatter）| ✅ 已完成 |
| `terms/engines/` | 引擎档案（Godot · three.js · Pixi · libGDX · Bevy）| ✅ 已完成 |
| `basement/` | 自研基座占位 | ⏸ 暂缓（用户定案）|
| `site/` | **产物**（推 `vibe-gaming` 仓）| 自动生成 |

> **数量不写在这里** —— 本文末尾「实测规模」由 `_audit/gen-repo-docs.mjs` 从数据算出。
> 之前这行手写的「25 个 HTML 页面」在页面加到 27 个之后就过期了（A8 发现）。

⚠ **英文版不在 `data/*.en.json` 里**，而是走 `scripts/i18n-body.mjs`：
每个词条 md 里的英文写在 `> ` 引用块中，构建时拆出来生成双节点。
（`data/` 目录当前 0 个文件，早期文档里说的 `*.en.json` 并不存在。）

### 五阶段（按做游戏的实际顺序，不是按工具）

1. **选引擎** —— 哪个引擎对 AI 最友好
2. **核心循环** —— 怎么把玩法变成代码
3. **手感调参** —— 为什么 AI 给的参数不对
4. **资产合规** —— 美术 / 音频从哪来，哪些能商用
5. **导出发布** ——怎么让人玩到

## 构建

```bash
node scripts/build.mjs        # → site/
bash _audit/push-site.sh _data/game/site speculcom/vibe-gaming "说明"
```

⚠ 产物 = 25 个 HTML 页面 + `brand.*` + `site.css` + `CNAME` +
`.nojekyll` + `robots.txt` + `sitemap.xml` + `README.md`。

`sitemap.xml` 由构建末尾按 `site/` 实际文件枚举（中文文件名 percent-encode），
配 `_audit/vg-sitemap.mjs` 校验「每条 loc ↔ 一个真实文件」。

⚠ **`.nojekyll` 必须有** —— 缺了 Pages 构建失败。

## 方法论约束（v3铁律）

1. **不做实测** —— 本站不跑 benchmark，不给质量与速度结论
2. **核验快照** —— 每条判断记核验日；demo 状态变化快
3. **不同层不硬排** —— 不做引擎排名
4. **给判断依据不给虚假排名** —— 每条判断标出处，或显式标注「我们的口径」
5. **未知就说未知** —— 授权不明写「未获官方确认」，不猜
6. **不托管二进制** —— 只索引不托管

## 相关

- 作品库（规划中）：<https://demos.specul.com> —— 源仓 [`speculcom/ai-demos`](https://github.com/speculcom/ai-demos)
- 站群计划：`_plan/vibe-gaming.md`（在本地仓库 `speculcom/www` 的工作区）

## 实测规模（A8）

<!-- STATS:BEGIN 由 _audit/gen-repo-docs.mjs 生成，勿手改 -->
| 项 | 实测值 |
|---|---|
| 词条 | 17 条（阶段 12 · 关键词 5） |
| 引擎档案 | 5 个（Bevy · Godot · libGDX · Pixi · Three.js） |
| 贯穿页 | 2 个（demos · method） |
| 站点产物 | 27 个 HTML 页面 |
<!-- STATS:END -->

# ai-vibe-gaming

> English version: [README.en.md](./README.en.md)

「AI 做游戏」（Vibe Gaming）的**源仓** —— 唯一真相源。

> 站点：<https://vg.specul.com>
> ⚠ **本仓不发Pages**，产物在 [`speculcom/vibe-gaming`](https://github.com/speculcom/vibe-gaming)

## 我该怎么读

17 个词条 + 5 份引擎档案。按你现在的进度走：

| 你在哪个阶段 | 读什么 |
|---|---|
| 还没定用什么做 | `terms/engines/` 五份引擎档案 —— 先看哪个对 AI 最友好 |
| 刚跑通第一个能玩的 demo | `S1 选引擎` → `S2 核心循环` |
| 能玩但不好玩 | `S3 手感调参` —— AI 给的参数为什么总差一点，这篇讲这个 |
| 准备给人玩 | `S4 资产合规`（美术音频哪能商用）→ `S5 导出发布` |
| 只是好奇 AI 能不能做游戏 | 先看 [`claims/`](./claims/) 那三张判定表，结论在最前面 |

读完想知道「凭什么这么说」，翻 [`method.md`](./pages/method.md)。

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

<!-- INDEX:BEGIN 由 _audit/gen-repo-docs.mjs 生成，勿手改 -->

## 内容索引

### 五个阶段 —— 按做游戏的实际顺序

| 阶段 | 词条 | 一句话说清 |
|---|---|---|
| S1 · 选引擎 | [S1 · 选引擎](terms/S1-%E9%80%89%E5%BC%95%E6%93%8E.md) | 选错引擎，后面每一阶段都在替它的短板还债。 |
| S2 · 核心循环 | [S2 · 核心循环](terms/S2-%E6%A0%B8%E5%BF%83%E5%BE%AA%E7%8E%AF.md) | 玩法原型是可验证的 —— 代码能跑，就说明逻辑对。 |
| S3 · 手感调参 | [S3 · 手感调参](terms/S3-%E6%89%8B%E6%84%9F%E8%B0%83%E5%8F%82.md) | 这是 AI 帮不上忙的一段 —— 也是整个流程里唯一必须你自己判断的。 |
| S4 · 资产合规 | [S4 · 资产合规](terms/S4-%E8%B5%84%E4%BA%A7%E5%90%88%E8%A7%84.md) | 这一步不是技术问题，是法律问题 —— 但它能让你的整个项目作废。 |
| S5 · 导出与发布 | [S5 · 导出与发布](terms/S5-%E5%AF%BC%E5%87%BA%E5%8F%91%E5%B8%83.md) | 这一步 AI 帮得最少 —— 因为它是确定性工程，不是生成任务。 |

### 关键词 —— 做游戏绕不开的词

- [Vibe Gaming](terms/Vibe%20Gaming.md) —— 它实际混着两件事，只有一件成立。
- [Web 导出可行性](terms/Web%20%E5%AF%BC%E5%87%BA%E5%8F%AF%E8%A1%8C%E6%80%A7.md) —— 如果你需要长期存档、多人、或重度 3D，原生引擎；否则 Web 引擎迭代更快。
- [提示词的结构](terms/%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%9A%84%E7%BB%93%E6%9E%84.md) —— 每次给三样：输入映射、具体数值、明确的「不要做什么」。
- [最小可玩原型](terms/%E6%9C%80%E5%B0%8F%E5%8F%AF%E7%8E%A9%E5%8E%9F%E5%9E%8B.md) —— 原型做到什么程度算够？答案是：你能从这三条判断它有没有戏。
- [手感问题清单](terms/%E6%89%8B%E6%84%9F%E9%97%AE%E9%A2%98%E6%B8%85%E5%8D%95.md) —— 先分清是代码问题还是数值问题 —— 90% 的「飘」改两三个参数就能解决。
- [字体的授权陷阱](terms/%E5%AD%97%E4%BD%93%E7%9A%84%E6%8E%88%E6%9D%83%E9%99%B7%E9%98%B1.md) —— 用字体前，截图看它的授权页，搜「商用」两个字。搜不到就别用。
- [先发极简版](terms/%E5%85%88%E5%8F%91%E6%9E%81%E7%AE%80%E7%89%88.md) —— 在 itch.io 上传一个能玩的、素材很粗糙的版本 —— AI 让这变得可行。
- [存档与离线行为](terms/%E5%AD%98%E6%A1%A3%E4%B8%8E%E7%A6%BB%E7%BA%BF%E8%A1%8C%E4%B8%BA.md) —— 发布前必须测：刷新页面后进度还在吗？断网了会崩还是优雅降级？
- [AI 资产台账](terms/AI%20%E8%B5%84%E4%BA%A7%E5%8F%B0%E8%B4%A6.md) —— 建表成本 10 分钟，不建的成本是项目作废。
- [Godot 的场景树](terms/Godot%20%E5%9C%BA%E6%99%AF%E6%A0%91.md) —— 让 AI 写 GDScript，场景在编辑器里搭。这条不清楚，你会浪费几个小时。
- [AI 生成内容的版权归属](terms/AI%20%E7%94%9F%E6%88%90%E5%86%85%E5%AE%B9%E7%9A%84%E7%89%88%E6%9D%83.md) —— 商用前读服务条款的授权条款；把 AI 输出当作「授权不明」处理。
- [上下文窗口与 AI 写游戏](terms/%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AA%97%E5%8F%A3%E4%B8%8E%20AI%20%E5%86%99%E6%B8%B8%E6%88%8F.md) —— 单文件控制在几百行内；每次只让 AI 处理一个模块。

### 引擎档案

- [Bevy](terms/engines/Bevy.md)
- [Godot](terms/engines/Godot.md)
- [libGDX](terms/engines/libGDX.md)
- [Pixi](terms/engines/Pixi.md)
- [Three.js](terms/engines/Three.js.md)

<!-- INDEX:END -->

## 实测规模（A8）

<!-- STATS:BEGIN 由 _audit/gen-repo-docs.mjs 生成，勿手改 -->
| 项 | 实测值 |
|---|---|
| 词条 | 17 条（阶段 12 · 关键词 5） |
| 引擎档案 | 5 个（Bevy · Godot · libGDX · Pixi · Three.js） |
| 贯穿页 | 2 个（demos · method） |
| 站点产物 | 27 个 HTML 页面 |
<!-- STATS:END -->

---
zh: "Cocos Creator"
en: "Cocos Creator"
engine: cocos
script: "TypeScript"
scriptEn: "TypeScript"
tier: "2D/3D 跨平台"
tierEn: "2D/3D cross-platform"
aiFriendly: medium
aiScore: 3
what: "微信小游戏生态的默认选择 —— 官方手册专设「发布到微信小游戏」章节；代价是关卡与场景在编辑器里做，AI 只能接管脚本层。"
whatEn: "The default pick in the WeChat Mini Game ecosystem — the official manual has a dedicated \"Publish to WeChat Mini Game\" chapter; the price is that scenes live in the editor, so AI can only take over the scripting layer."
decision: "发布目标里有微信小游戏就绕不开它；纯网页游戏或想让 AI 多写代码，选 Phaser/Godot 更顺。"
decisionEn: "If WeChat Mini Games is in your release targets, you can't avoid it; for pure web games or more AI-written code, Phaser/Godot go smoother."
bestFor: "微信小游戏 / 即时网页娱乐为主的 2D/3D 跨平台发布"
bestForEn: "2D/3D cross-platform releases targeting WeChat Mini Games / instant web entertainment"
install: "官网下载 **Dashboard**，经 Dashboard 安装各版本 Cocos Creator；工程在 Creator 编辑器里创建、构建、发布（不是 npm 脚手架工作流）。"
installEn: "Download the **Dashboard** from the official site and install Cocos Creator versions through it; projects are created, built and published inside the Creator editor (not an npm-scaffold workflow)."
installSrc: "https://www.cocos.com/creator-download"
installVerified: "2026-10-30"
difficulty: medium
difficultyWhy: "脚本层是 TypeScript（AI 友好），但主入口是 GUI 编辑器：装 Dashboard、开编辑器、在场景视图里搭东西 —— 没有「一条命令出可跑工程」的路径，AI 也进不了场景编辑那一步。"
difficultyWhyEn: "The scripting layer is TypeScript (AI-friendly), but the main entry is a GUI editor: install the Dashboard, open Creator, assemble things in the scene view — there is no one-command runnable-project path, and AI cannot enter the scene-editing step."
confidence: our-judgement
verified: "2026-10-30 · GitHub API 快照"
verifiedEn: "2026-10-30 · GitHub API snapshot"
---

# Cocos Creator

**一句话**：它的读者问题不是「哪个引擎最好」，是「**要发微信小游戏**」—— 这件事它有官方文档，档案里的其他引擎没有。

<!-- EN -->
> **In one line**: its reader question is not "which engine is best" but "**I need to ship to WeChat Mini Games**" — and it has official docs for that while the other profiles here do not.

## 为什么它进档案

| 依据 | 说明 |
|---|---|
| **官方发布章节** | Cocos Creator 3.8 手册专设「发布到微信小游戏」，另有小游戏引擎插件、内存与性能优化指南（docs.cocos.com，2026-10-29 核对） |
| **官方定位** | 仓库描述自述 cross-platform + "instant web entertainment"（GitHub API，2026-10-29） |
| **活跃** | 最后提交 2026-10-28（GitHub API 当日快照） |

⚠ 本站不做实测：这里核对的是「官方文档有没有这条路」，不是「用它做小游戏一定顺利」。

<!-- EN -->
> ## Why it is in the profiles
>
> | Basis | Note |
> |---|---|
> | **Official publish chapter** | The Cocos Creator 3.8 manual has a dedicated "Publish to WeChat Mini Game" chapter, plus a mini-game engine plugin and a memory/performance optimisation guide (docs.cocos.com, checked 2026-10-29) |
> | **Official positioning** | The repo description says cross-platform + "instant web entertainment" (GitHub API, 2026-10-29) |
> | **Active** | Last push 2026-10-28 (GitHub API snapshot that day) |
>
> ⚠ This site runs no measurements: what is checked here is "does the official doc have this path", not "shipping a mini game with it is guaranteed smooth".

## 对 AI 的友好度：脚本层高、场景层进不去

| 面 | 情况 |
|---|---|
| **TypeScript 脚本** | AI 写游戏逻辑代码没问题，语言本身训练素材多 |
| ⚠ **场景与关卡在编辑器里** | `.scene` / `.prefab` 是 Creator 编辑器的格式 —— AI 生成不了也不该硬生成；**脚本归 AI，场景归你**，这是它和 Phaser/Godot 工作流最大的差别 |
| **文档中文为主** | 官方手册中文最全，英文相对薄 —— AI 的英文训练素材少，问答时容易拿到过时 API |
| **许可有细节** | 见下面事实表：LICENSE.md 是 MIT，但 GitHub 许可字段显示 NOASSERTION |

（「AI 友好度中等」是本站判断：脚本层加分、编辑器工作流减分，两条都写明依据。）

<!-- EN -->
> ## AI-friendliness: the script layer is in, the scene layer is not
>
> | Aspect | Situation |
> |---|---|
> | **TypeScript scripts** | AI writing game-logic code is fine; the language has plenty of training material |
> | ⚠ **Scenes and levels live in the editor** | `.scene` / `.prefab` are Creator editor formats — AI cannot generate them and should not try; **scripts to AI, scenes to you** — the biggest workflow difference versus Phaser/Godot |
> | **Docs mostly in Chinese** | The manual is fullest in Chinese, thinner in English — less English training material, so Q&A easily returns outdated APIs |
> | **Licence has a detail** | See the facts table: LICENSE.md is MIT, but GitHub's licence field shows NOASSERTION |
>
> ("Medium AI-friendliness" is this site's judgement: plus for the script layer, minus for the editor workflow — both sides stated with their basis.)

## 可核验事实

| 项 | 值 | 核验源 |
|---|---|---|
| 仓库 | `cocos/cocos-engine` | GitHub API |
| ★ | 9,894 | 同上 |
| 最后提交 | 2026-10-28 | 同上（**活跃**）|
| 仓库 LICENSE.md | **MIT** | 仓库 raw 文件当日核对 |
| GitHub 许可字段 | ⚠ **NOASSERTION**（与 LICENSE.md 不一致）| GitHub API —— 合规审查时以仓库 LICENSE.md 文本为准，但别只看 GitHub 徽章 |

<!-- EN -->
> ## Verifiable facts
>
> | Item | Value | Source |
> |---|---|---|
> | Repository | `cocos/cocos-engine` | GitHub API |
> | Stars | 9,894 | same |
> | Last push | 2026-10-28 | same (**active**) |
> | Repo LICENSE.md | **MIT** | raw file in the repo, checked that day |
> | GitHub licence field | ⚠ **NOASSERTION** (inconsistent with LICENSE.md) | GitHub API — for compliance, trust the LICENSE.md text in the repo, not the GitHub badge |

## 什么时候选它 / 不选

**选**：发布目标里有微信小游戏；要 2D/3D 一套跨平台出去。

**不选**：纯网页游戏（Phaser/Pixi 更轻、AI 接管面更大）；希望 AI 尽量端到端写代码（编辑器场景工作流是硬边界）；只发桌面/移动原生（Godot 路线更直）。

<!-- EN -->
> ## When to pick it, and when not to
>
> **Pick it when**: WeChat Mini Games is among your release targets; you want one 2D/3D codebase shipping cross-platform.
>
> **Do not pick it if**: it is a pure web game (Phaser/Pixi are lighter and give AI more surface); you want AI writing end-to-end (the editor scene workflow is a hard boundary); desktop/native mobile only (the Godot route is more direct).

---

<!-- 层：第一层 · 选对工具 · 档案里唯一以「发布渠道」立身的引擎：微信小游戏。 -->

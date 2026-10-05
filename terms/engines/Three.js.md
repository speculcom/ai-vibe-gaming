---
zh: "Three.js"
en: "Three.js"
engine: three
script: "JavaScript"
scriptEn: "JavaScript"
tier: "Web 3D"
tierEn: "web 3D"
aiFriendly: high
aiScore: 4
what: "对 AI 最友好的 3D 方案 —— 但它不是引擎，缺的东西要自己补。"
whatEn: "The most AI-friendly 3D option — but it is not an engine, and the gaps are yours to fill."
decision: "你要的不是「引擎」而是「3D 库」时选它。别指望它帮你管场景。"
decisionEn: "Pick it when what you want is a 3D library rather than an engine. Do not expect it to manage your scenes."
bestFor: "网页 3D 展示、可以自己搭架构的项目"
bestForEn: "Web 3D showcases, and projects where you are willing to build the architecture"
confidence: our-judgement
verified: "2026-10-05 · GitHub API 快照"
---

# Three.js

**一句话**：做网页 3D 时 AI 最可能一次写对的库 —— **但它不是引擎。**

<!-- EN -->
> **In one line**: the library AI is most likely to get right first time for web 3D — **but it is not an engine**.

## ⚠ 先说最重要的一件事

**Three.js 不是完整引擎。** 它没有：

- 场景图管理
- 物理系统
- 资源管理（模型/贴图的加载与生命周期）
- 游戏循环之外的状态管理

**这些都要你自己搭。** 这不是缺点 —— 但你得知道自己在搭什么。

<!-- EN -->
> ## ⚠ The most important thing first
>
> **Three.js is not a complete engine.** It has none of:
>
> - scene graph management
> - a physics system
> - asset management (loading models/textures and their lifetimes)
> - state management beyond the render loop
>
> **You build all of that yourself.** That is not a flaw — but you should know what you are building.

## 为什么对 AI 友好

| 原因 | 说明 |
|---|---|
| **JavaScript/TypeScript 训练数据最多** | ⚠ 这是最大的优势 —— 模型的训练集里 JS 代码的量级远大于其他游戏语言 |
| **API 极其稳定** | Three.js 的 API 十多年没大改，AI 学到的是当前的知识 |
| **概念少** | 场景、相机、渲染器、光源、材质 —— 五件事说完，没有引擎的复杂度 |
| **错误容易看出来** | 画不出来通常是相机位置或灯光问题，AI 能猜对 |

<!-- EN -->
> ## Why it is AI-friendly
>
> | Reason | Explanation |
> |---|---|
> | **JavaScript/TypeScript has by far the most training data** | ⚠ This is the big one — the volume of JS in the training set dwarfs that of any other game language |
> | **The API is extremely stable** | Three.js has not changed much in over a decade, so what AI learned is still current |
> | **Few concepts** | Scene, camera, renderer, lights, materials — five things, with none of an engine's complexity |
> | **Failures are visible** | If it renders wrong it is usually camera position or lighting, and AI can guess that |

## 它的代价

⚠ **代价就是「你得自己搭引擎」：**

| 你要自己解决的 | 意味着 |
|---|---|
| 场景管理 | 每次切换关卡要自己处理资源释放 |
| 物理 | 得自己接一个物理库（ cannon-es / rapier） |
| 资产加载 | 得自己写加载器与进度条 |
| 后期 | 得自己做对象池、垃圾回收控制 |

<!-- EN -->
> ## What it costs
>
> ⚠ **The cost is "you have to build the engine yourself":**
>
> | What you must solve | What that means |
> |---|---|
> | Scene management | Every level switch means handling asset disposal yourself |
> | Physics | You must attach a physics library (cannon-es / rapier) |
> | Asset loading | You write the loader and the progress bar |
> | Frame budget | You build object pooling and garbage-collection control |

## 什么时候选它 / 不选

**选**：网页 3D 展示、你愿意自己搭架构、⚠ 或者你**已经有一个引擎**只缺渲染层

**不选**：想要完整游戏功能（碰撞检测、场景管理开箱即用）

<!-- EN -->
> ## When to pick it, and when not to
>
> **Pick it if**: web 3D showcases; you are willing to build the architecture; ⚠ or you **already have an engine** and only need a rendering layer
>
> **Do not pick it if**: you want complete game features out of the box (collision detection, scene management)

## 可核验事实

| 项 | 值 | 核验源 |
|---|---|---|
| 仓库 | `mrdoob/three.js` | GitHub API |
| 许可 | **MIT** | 同上 |
| 主语言 | JavaScript | 同上 |
| ★ | 116,227 | 同上 |
| 最后提交 | 2026-10-04 | 同上（**活跃**）|

<!-- EN -->
> ## Verifiable facts
>
> | Item | Value | Source |
> |---|---|---|
> | Repository | `mrdoob/three.js` | GitHub API |
> | Licence | **MIT** | same |
> | Main language | JavaScript | same |
> | Stars | 116,227 | same |
> | Last push | 2026-10-04 | same (**active**) |

## 术语

⚠ 「场景图」「物理」这些词在 [Vibe Gaming 词条](../vibe-gaming.html) 里有解释。

<!-- EN -->
> ## Vocabulary
>
> ⚠ "Scene graph" and "physics" are explained in the [Vibe Gaming entry](../vibe-gaming.html).

---

<!-- 层：第一层 · 选对工具 · 对 AI 最友好的 3D 库，但不是引擎。 -->
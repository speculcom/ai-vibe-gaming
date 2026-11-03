---
zh: "Unity"
en: "Unity"
engine: unity
script: "C#"
scriptEn: "C#"
tier: "通用 2D/3D"
tierEn: "general 2D/3D"
aiFriendly: medium
aiScore: 3
what: "AI 能写 C#，但改场景与预制件仍要过编辑器这层；Unity 6 起官方内置 AI 菜单。"
whatEn: "AI can write C#, but scene and prefab changes still go through the editor; Unity 6 ships an official AI menu."
decision: "已有 Unity 项目、要发主机/移动端时选它；别指望 AI 直接改 .unity 场景文件。"
decisionEn: "Pick it for an existing Unity project or console/mobile release; do not expect AI to edit .unity scene files directly."
bestFor: "已有 Unity 项目、主机/移动发布、需要成熟资产管线"
bestForEn: "Existing Unity projects, console/mobile releases, and a mature asset pipeline"
install: "用 Unity Hub 安装编辑器。AI 功能在 6000.6 的 AI 菜单里：Assistant 负责问答与改场景/资产，Generators 生成 Sprite、Texture2D、Sound、Animation、Material；需在编辑器内接受条款，并在 Unity Dashboard 管理用量（官方文档 2026-11-03）。"
installEn: "Install the editor through Unity Hub. In 6000.6 the AI menu holds Assistant (Q&A plus scene/asset actions) and Generators (Sprite, Texture2D, Sound, Animation, Material). You must accept the terms in the editor and manage usage in the Unity Dashboard (official docs, 2026-11-03)."
installSrc: "https://docs.unity.com/en-us/engine/6000.6/manual/unity-ai/ai-menu-access"
installVerified: "2026-11-03"
difficulty: medium
difficultyWhy: "编辑器、包管理与平台导出链都要学；AI 能帮写 C#，但场景与预制件仍要在编辑器里操作。"
difficultyWhyEn: "You learn the editor, package management and platform export chains. AI can write the C#, but scenes and prefabs are still edited by hand."
confidence: partial
verified: "2026-11-03 · Unity 6000.6 官方文档"
verifiedEn: "2026-11-03 · Unity 6000.6 official docs"
---

# Unity

**一句话**：AI 能写 C#，但 Unity 的硬边界是编辑器里的场景与预制件。

<!-- EN -->
> **In one line**: AI can write the C#, but Unity's hard boundary is the scenes and prefabs inside the editor.

## 为什么对 AI 友好（以及哪里会卡）

| 原因 | 说明 |
|---|---|
| C# 训练数据多 | 通用编程语料充足，AI 写 C# 的错率低于 GDScript 之外的多数游戏语言 |
| 官方 API 文档完整 | 类参考给出参数、返回值与示例，AI 引用的 API 大多真实存在 |
| **AI 菜单已内建** | 6000.6 的 Assistant 可在编辑器里生成代码、排查问题、对场景与资产执行动作 |
| **场景/预制件是硬边界** | `.unity` / `.prefab` 是序列化资产，直接让 AI 改容易破坏引用；官方 AI 也是通过编辑器接口操作 |

<!-- EN -->
> ## Why it is AI-friendly, and where it gets stuck
>
> | Reason | Explanation |
> |---|---|
> | Lots of C# training data | General programming corpora are plentiful, so AI makes fewer C# mistakes than with most game languages other than GDScript |
> | Complete official API docs | The class reference gives parameters, return types and examples; most APIs AI cites exist |
> | AI menu is built in | In 6000.6, Assistant can generate code, troubleshoot and act on scenes and assets inside the editor |
> | Scenes/prefabs are the hard boundary | `.unity` / `.prefab` are serialized assets; letting AI edit them directly easily breaks references, which is why the official AI acts through editor interfaces |

## 它的代价

- **场景与预制件不能交给 AI 盲改**：改引用、丢组件、合并冲突都要人来判断
- **AI 功能按用量计费**：官方要求接受条款并在 Dashboard 管理点数，具体额度以官方页为准
- **导出链复杂**：主机/移动平台需要对应模块与证书，AI 只能帮到代码层
- **许可与收入门槛**：个人版有收入上限，商用前读官方定价与许可页

<!-- EN -->
> ## What it costs
>
> - Scenes and prefabs cannot be blindly handed to AI: broken references, lost components and merge conflicts need a human decision
> - AI features are usage-metered: official docs require accepting terms and managing points in the Dashboard; limits follow the official page
> - Export chains are complex: console/mobile targets need modules and certificates, and AI only helps at the code layer
> - Licence and revenue thresholds: the personal tier has a revenue cap; read the official pricing and licence pages before commercial use

## 什么时候选它 / 不选

**选**：已有 Unity 项目；要发主机或移动端；需要成熟资产商店与团队协作。

**不选**：单人 + 纯网页小项目（Godot 或 Pixi/Phaser 更轻）；想让 AI 端到端改场景（编辑器层仍然是硬边界）。

<!-- EN -->
> ## When to pick it, and when not to
>
> **Pick it if**: you already have a Unity project; you target console or mobile; you need a mature asset store and team collaboration.
>
> **Do not pick it if**: you are solo on a small web project (Godot or Pixi/Phaser are lighter); you want AI to change scenes end-to-end (the editor layer remains a hard boundary).

## 可核验事实

| 项 | 值 | 核验源 |
|---|---|---|
| 当前文档版本 | Unity 6000.6（Unity 6.2） | 官方文档 |
| AI 功能 | Assistant / Generators / Sentis | 官方文档 |
| Generators 覆盖 | Sprite、Texture2D、Sound、Animation、Material | 官方文档 |
| 许可 | 专有（个人版有收入门槛） | 官方定价/许可页 |

<!-- EN -->
> ## Verifiable facts
>
> | Item | Value | Source |
> |---|---|---|
> | Current docs version | Unity 6000.6 (Unity 6.2) | official docs |
> | AI features | Assistant / Generators / Sentis | official docs |
> | Generators coverage | Sprite, Texture2D, Sound, Animation, Material | official docs |
> | Licence | proprietary (personal tier has a revenue cap) | official pricing/licence pages |

## 术语

「场景」「预制件」「序列化资产」这些词在 [Vibe Gaming 词条](../vibe-gaming.html) 里有解释。

<!-- EN -->
> ## Vocabulary
>
> "Scene", "prefab" and "serialized asset" are explained in the [Vibe Gaming entry](../vibe-gaming.html).

---

<!-- 层：第一层 · 选对工具 · 已有 Unity 项目或主机/移动发布时选它；场景与预制件仍是编辑器边界。 -->

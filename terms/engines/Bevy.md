---
zh: "Bevy"
en: "Bevy"
engine: bevy
script: "Rust"
scriptEn: "Rust"
tier: "原生 3D"
tierEn: "native 3D"
aiFriendly: low
aiScore: 1
what: "AI 最容易写错的主流引擎 —— 但它的架构可能是最干净的。"
whatEn: "The mainstream engine AI gets wrong most easily — and yet its architecture may be the cleanest."
decision: "⚠ 如果用 AI 写 Bevy，改用 Web 引擎。除非你本人就是 Rust 开发者。"
decisionEn: "⚠ If AI is writing your Bevy code, use a web engine instead — unless you are a Rust developer yourself."
bestFor: "⚠ 熟悉 Rust 且愿意被 AI 拖累的人"
bestForEn: "⚠ People who know Rust and accept being slowed down by AI"
confidence: our-judgement
verified: "2026-10-05 · GitHub API 快照"
---

# Bevy

**一句话**：技术上很优雅，但**是 AI 最难写的引擎**。

<!-- EN -->
> **In one line**: technically elegant, and **the hardest engine for AI to write correctly**.

## ⚠ 为什么对 AI 不友好

这一条是本站最强的判断，请认真对待：

> **Rust 的所有权模型对 AI 很不友好。**

AI 写 Rust 时最常见的错误是**借用检查失败**：

```
cannot borrow `x` as mutable because it is also borrowed as immutable
```

⚠ 这类错误的成因是**生命周期推断** —— 而 AI 没有真正的类型系统模型，
它只是在模仿训练数据里的代码形态。**当代码需要跨越生命周期时，模仿就失效了。**

**这与 AI 写 Python/TypeScript 的差距是数量级的** —— 后两者里 AI 写的代码
即使风格不对也能跑，Rust 里直接编译失败。

<!-- EN -->
> ## ⚠ Why it is unfriendly
>
> This is the strongest judgement on this site; please take it seriously:
>
> > **Rust's ownership model is very unfriendly to AI.**
>
> The most common error when AI writes Rust is a **borrow-check failure**:
>
> ```
> cannot borrow `x` as mutable because it is also borrowed as immutable
> ```
>
> ⚠ These errors come from **lifetime inference** — and AI has no real model of a type system. It is imitating the *shape* of code it saw in training. **When the code has to cross a lifetime boundary, the imitation breaks down.**
>
> **The gap between this and Python/TypeScript is an order of magnitude** — in those languages AI-written code usually runs even if the style is wrong. In Rust it simply fails to compile.

## 它值得的地方

⚠ 本站判断它**技术方向是对的**：

- **数据驱动** —— 组件 + 系统，逻辑与数据分离
- **ECS 架构清晰** —— 比继承体系更好维护
- **开源彻底**（Apache-2.0）—— 官方写「free and open-source forever」

<!-- EN -->
> ## Where it deserves credit
>
> ⚠ This site's judgement is that **the technical direction is right**:
>
> - **Data-driven** — components plus systems, separating logic from data
> - **A clean ECS architecture** — easier to maintain than an inheritance hierarchy
> - **Genuinely open** (Apache-2.0) — the official line is "free and open-source forever"

## 如果你还是要用

⚠ 三个降低痛苦的做法：

1. **让 AI 写「一次性」的小系统**，别让它写大的架构
2. **每次只改一处** —— 借用错误会连锁，改一处好定位
3. ⚠ **准备好花更多时间在编译错误上**

<!-- EN -->
> ## If you still want to use it
>
> ⚠ Three ways to reduce the pain:
>
> 1. **Have AI write small, throwaway systems** rather than large architectural pieces
> 2. **Change one place at a time** — borrow errors cascade, and one change is easy to locate
> 3. ⚠ **Budget more time for compile errors**

## 什么时候选它 / 不选

**选**：⚠ 你本人是 Rust 开发者（那你根本不需要 AI 帮你写）

**不选**：单人 + 用 AI 做游戏 —— 这是本站最强烈的建议

<!-- EN -->
> ## When to pick it, and when not to
>
> **Pick it if**: ⚠ you are a Rust developer yourself (in which case you do not need AI to write it)
>
> **Do not pick it if**: you are solo and using AI — this is the site's strongest recommendation

## 可核验事实

| 项 | 值 | 核验源 |
|---|---|---|
| 仓库 | `bevyengine/bevy` | GitHub API |
| 许可 | **Apache-2.0** | 同上 |
| 主语言 | Rust | 同上 |
| ★ | 48,611 | 同上 |
| 最后提交 | 2026-10-04 | 同上（**活跃**）|
| 官方定位 | “A refreshingly simple data-driven game engine built in Rust” | 官方 README |

<!-- EN -->
> ## Verifiable facts
>
> | Item | Value | Source |
> |---|---|---|
> | Repository | `bevyengine/bevy` | GitHub API |
> | Licence | **Apache-2.0** | same |
> | Main language | Rust | same |
> | Stars | 48,611 | same |
> | Last push | 2026-10-04 | same (**active**) |
> | Official description | "A refreshingly simple data-driven game engine built in Rust" | official README |

## 术语

⚠ 「ECS」「数据驱动」这些词在 [Vibe Gaming 词条](../vibe-gaming.html) 里有解释。

<!-- EN -->
> ## Vocabulary
>
> ⚠ "ECS" and "data-driven" are explained in the [Vibe Gaming entry](../vibe-gaming.html).

---

<!-- 层：第一层 · 选对工具 · 技术优雅但 AI 最难写的一个。 -->
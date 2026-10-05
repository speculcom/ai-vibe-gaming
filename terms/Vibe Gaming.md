---
zh: "Vibe Gaming"
en: "Vibe Gaming"
kind: "keyword"
ord: 0
what: "跟 AI 聊天把游戏做出来。但这句话要先拆开，否则会误判。"
whatEn: "Making a game by talking to AI. But that sentence has to be taken apart first, or you will misjudge it."
decision: "它实际混着两件事，只有一件成立。"
decisionEn: "It actually mixes two things, and only one of them holds."
confidence: our-judgement
---

# Vibe Gaming

**定义**：通过与 AI 对话来制作游戏。⚠ **但这个词有歧义 —— 它混着两件事，只有一件成立。**

<!-- EN -->
> **Definition**: making a game by talking to AI. ⚠ **But the phrase is ambiguous — it mixes two things, and only one of them holds.**

## 两件事，只有一件成立

| | **A. 用 AI 写代码** | **B. 用 AI 生成内容** |
|---|---|---|
| 动作 | AI 写引擎代码、逻辑、调参 | AI 生成美术、配乐、关卡、剧情 |
| 「聊天」这个动作 | ✅ **成立** | ❌ **不成立** |
| 瓶颈 | 引擎 API 记忆、调试 | **风格一致性**、可玩性 |
| 成熟度 | 已成熟 | 半成熟 |

<!-- EN -->
> ## Two things, and only one holds
>
> | | **A. AI writes the code** | **B. AI generates the content** |
> |---|---|---|
> | Action | AI writes engine code, logic, tuning | AI generates art, music, levels, story |
> | Is "talking" the right word? | Yes | ⚠ **No** |
> | Bottleneck | Engine API recall, debugging | **Style consistency**, playability |
> | Maturity | Mature | Half-mature |

## ⚠ 为什么 B 里「聊天」不成立

> **风格不一致是生成模型的缺陷，不是提示词问题。**

多轮对话不会让风格更一致 —— 只会让生成结果更散。
你无法用聊天生成一套风格统一的手游美术包。

所以「跟 AI 聊天就能做出游戏」这个说法，**在代码层面成立，在内容层面不成立**。

<!-- EN -->
> ## ⚠ Why "talking" does not hold for content
>
> > **Style inconsistency is a defect of the generative model, not a prompting problem.**
>
> More dialogue does not make a style more consistent — it only spreads the results further.
> You cannot generate a coherent art pack for a mobile game by having a conversation.
>
> So "make a game by talking to AI" holds **at the level of code, and fails at the level of content**.

## 由此得出的判断

**AI 让做游戏的成本下降是「不均匀」的：**

- 写代码：**大幅下降**（这是 vibe coding 的成果）
- 做美术 / 配乐 / 关卡：**几乎没降**

于是「一个人做游戏」的瓶颈从「写不出来」变成了「凑不齐」。

→ 完整分析见首页的三张判定表。

<!-- EN -->
> ## The judgement this implies
>
> **The cost of making a game with AI falls "unevenly":**
>
> - Writing code: falls sharply — that is the result vibe coding produced
> - Art, music and level design: barely moves
>
> So the bottleneck for a solo developer shifts from "cannot write it" to "cannot assemble it".
>
> → For the full analysis, see the three tables on the home page.

## 与 vibe coding 的差别

vibe coding 的方法论**不能直接搬到游戏开发**，因为它依赖四个前提，
其中两个在游戏里不成立（**结果无法自动验证** + **失败是沉默的**）。

→ 见首页「表 2 · vibe coding 的哪些前提在游戏里不成立」。

<!-- EN -->
> ## How this differs from vibe coding
>
> vibe coding's method **does not carry over to game development unchanged**, because it relies on four premises, and two of them fail for games (**results cannot be verified automatically**, and **failure is silent**).
>
> → See "Table 2 · Which premises of vibe coding do not hold for games" on the home page.

---

<!-- 层：概念 · 这个词本身，以及它需要被拆开的原因。 -->
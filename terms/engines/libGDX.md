---
zh: "libGDX"
en: "libGDX"
engine: libgdx
script: "Java / Kotlin"
scriptEn: "Java / Kotlin"
tier: "Java 跨平台"
aiFriendly: medium
aiScore: 3
what: "Java 生态里唯一的完整游戏引擎 —— AI 写得不错，但你得先接受 JVM 的构建流程。"
decision: "⚠ 跨平台需求明确（尤其要 Android）时才选它。桌面项目直接选 Godot。"
bestFor: "⚠ 要发布到 Android、且团队用 Java/Kotlin"
confidence: our-judgement
verified: "2026-10-05 · GitHub API 快照"
---

# libGDX

**一句话**：Java/Kotlin 生态里的完整引擎。**AI 写得不错，但构建流程是它的门槛。**

## 对 AI 友好的部分

| 原因 | 说明 |
|---|---|
| **Java 是训练数据大户** | 语法严格但模式固定，AI 的 Java 能力优于 Rust/C++ |
| **Kotlin 也很好写** | 协程与空安全降低了出错的可能 |
| **Apache-2.0** | 商用无阻碍 |
| **跨平台成熟** | 桌面 + Android + iOS + Web |

## ⚠ 它的真正门槛：构建

**这是 AI 帮不上忙的地方**：

- Gradle 依赖解析 —— 版本冲突时的报错**极难读懂**
- Android 打包需要 Android SDK —— 环境配置本身就是一道坎
- ⚠ **AI 会写出能编译逻辑但配不出环境的构建文件**

⚠ 这一点与 S5「导出与发布」是同一类问题：**确定性工程，模型只能猜。**

## 什么时候选它 / 不选

**选**：⚠ 需要 Android 发布、团队用 Java/Kotlin、跨平台是硬需求

**不选**：只做桌面或网页（Godot 或 Pixi 都更省事）

## 可核验事实

| 项 | 值 | 核验源 |
|---|---|---|
| 仓库 | `libgdx/libgdx` | GitHub API |
| 许可 | **Apache-2.0** | 同上 |
| 主语言 | Java | 同上 |
| ★ | 25,422 | 同上 |
| 最后提交 | 2026-09-24 | 同上（活跃）|
| 官方定位 | “Desktop/Android/HTML5/iOS Java game development framework” | 官方 README |

---

<!-- 层：第一层 · 选对工具 · 跨平台需求明确时才值得。 -->

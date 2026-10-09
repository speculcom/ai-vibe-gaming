# AI 做游戏（ai-vibe-gaming）内容规范

> 本文是**内容仓的必填矩阵**。机器执行方是 [`scripts/validate.mjs`](./scripts/validate.mjs)（**本文与它必须一致**）。
>
> 实测规模：**词条 17（阶段 12 · 关键词 5）· 引擎 5 · 贯穿页 2**。

## 一、文件位置与命名

| 内容 | 路径 |
|---|---|
| 阶段词条 + 关键词 | `terms/<名称>.md` —— 阶段页命名 `S<N>-<名称>.md`（如 `S3-手感调参.md`） |
| 引擎档案 | `terms/engines/<引擎名>.md`（Godot / Bevy / libGDX / Pixi / Three.js） |
| 贯穿页 | `pages/<名称>.md`（`method` / `demos`）—— 不属于任何阶段，讲整条流程 |
| 立论层 | `claims/*.json`（`boundary.json` · `engines-verified.json`）—— **不是词条**，构建器消费它 |
| 产物 | `site/` · `data/`（构建生成，不要手改） |

`basement/` 目前只有 `.gitkeep`（占位）。

## 二、必填字段

### 2.1 三种内容共同的（6 个）

| 字段 | 说明 |
|---|---|
| `zh` | 中文标题 |
| `en` | 英文标题 |
| `what` | 一句话：这是什么 / 解决什么 |
| `whatEn` | 上者的英文 |
| `decision` | 结论 / 该怎么办（**给判断依据，不给虚假排名**） |
| `decisionEn` | 上者的英文 |
| `confidence` | 判断的可信度，实测全为 `our-judgement`（**我们的判断**，不是实测数据） |

### 2.2 词条额外（`terms/*.md`）

| 字段 | 规则 |
|---|---|
| `ord` | **整数、全局唯一** —— 「上一篇 / 下一篇」（`pathNav`）就按它排 |
| `stage` **或** `kind` | **二选一，且只能有一个**：<br>· `stage`: 1–5 的整数（阶段词条）<br>· `kind`: 只能是 `"keyword"`（跨阶段的概念词条） |

`ord` 编号**约定**（观测到的规律，校验器只强制唯一性，不强制这套编号）：

| 类型 | `ord` | 例 |
|---|---|---|
| 阶段导语 | `stage` | S1-选引擎 = 1 · S5-导出发布 = 5 |
| 阶段内条目 | `stage * 10 + 序号` | Web 导出可行性 = 11 · 手感问题清单 = 31 · 存档与离线行为 = 53 |
| 关键词 | `100 + 序号` | AI 资产台账 = 101 · Godot 场景树 = 110 · 上下文窗口与 AI 写游戏 = 130 |
| 全站第一个词条 | `0` | Vibe Gaming = 0 |

### 2.3 引擎档案额外（`terms/engines/*.md`，共 24 字段）

| 字段 | 取值 / 说明 |
|---|---|
| `engine` | 引擎名 |
| `script` / `scriptEn` | 用什么语言写脚本 |
| `tier` / `tierEn` | 定位分类（实测：通用 2D/3D · 原生 3D · Java 跨平台 · Web 2D · Web 3D）|
| `aiFriendly` | `high` / `medium` / `low` —— **AI 出错率**（AI 写它容不容易错）|
| `aiScore` | 与上者对应的分值（high=4 · medium=3 · low=1）|
| `bestFor` / `bestForEn` | 适合做什么（**分场景说**，不做总排名）|
| `install` / `installEn` | 安装/起步步骤 |
| `installSrc` | 安装步骤的**出处**（发布页/官方文档） |
| `installVerified` | 该步骤的核验日期 `YYYY-MM-DD` |
| `difficulty` | `low` / `medium` / `high` —— **人的上手成本**（与 `aiFriendly` 是**两条独立的轴**）|
| `difficultyWhy` / `difficultyWhyEn` | 为什么是这一档（给依据）|
| `verified` | 核验记录（日期 + 来源，如 `2026-10-05 · GitHub API 快照`）|

> ⚠ **`aiFriendly` 与 `difficulty` 不可合并成一个「推荐度」**：
> 前者问「AI 写这个引擎容易不容易出错」，后者问「人上手要花多少力气」。
> 实测 Godot / Pixi 是 `high` + `low`（AI 友好且好上手），Three.js 是 `high` + `medium`，
> Bevy / libGDX 是 `low`/`medium` + `high`。合并会丢掉「AI 友好但人难上手」这一整类。

## 三、枚举值（封闭）

| 字段 | 取值 |
|---|---|
| `stage` | 1 2 3 4 5 |
| `kind` | `keyword` |
| `aiFriendly` / `difficulty` | `high` `medium` `low` |
| `confidence` | `our-judgement`（实测唯一取值）|

阶段语义：S1 选引擎 · S2 核心循环 · S3 手感调参 · S4 资产合规 · S5 导出发布。

## 四、双语要求（R2）

**站上**的英文一律走 **frontmatter 里的 `*En` 孪生字段**（`whatEn` / `decisionEn` / `installEn` / `difficultyWhyEn` …），
**不使用 `.en.json` 文件**（本仓与其他仓不同，别照搬）。校验器要求：每个 `xxx` 字段都有对应的 `xxxEn` 且非空。

## 五、判定「已核验」的规则

| 状态 | 条件 |
|---|---|
| **已核验（数据）** | `verified` 写明**日期 + 来源**（如 GitHub API 快照），且 `installSrc` 指回发布页 |
| **已核验（安装步骤）** | `installVerified` 有日期（实测 5/5 为 2026-10-09）|
| **我们的判断** | `confidence: our-judgement` —— 页面必须让读者看出这是**判断**而非实测 |

铁律提醒：本仓**不做实测**（不跑分、不做性能测试）。「AI 友好度」是我们按错误率归纳的判断，
页面文案不得写成「实测 AI 友好度」。**未知就说未知**。

## 六、禁止

- ❌ 手改 `site/` · `data/`（产物）
- ❌ `stage` 与 `kind` 同时出现，或都不出现
- ❌ `ord` 重复（会让「上一篇/下一篇」错乱）
- ❌ 把 `aiFriendly` 与 `difficulty` 合成单一「推荐分」
- ❌ 自创 `kind` 值（目前只允许 `keyword`）
- ❌ 在正文里手写「共 N 条」这类计数（数字由构建器算）

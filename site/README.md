# ai-vibe-gaming

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
| `claims/` | **立论层**（三张判定表）| ⏳ P1 待写 |
| `terms/` | 五阶段教学词条（Markdown + frontmatter）| ⏳ P2 待写 |
| `terms/engines/` | 引擎档案（5~8 个）| ⏳ P3 待写 |
| `basement/` | 自研基座占位 | ⏸ 暂缓（用户定案）|
| `data/` | 双语映射（`*.en.json`）| P5 |
| `site/` | **产物**（推 `vibe-gaming` 仓）| 自动生成 |

### 五阶段（按做游戏的实际顺序，不是按工具）

1. **选引擎** —— 哪个引擎对 AI 最友好
2. **核心循环** —— 怎么把玩法变成代码
3. **手感调参** —— 为什么 AI 给的参数不对
4. **资产合规** —— 美术 / 音频从哪来，哪些能商用
5. **导出发布** ——怎么让人玩到

## 构建

```bash
node scripts/build.mjs        # → site/
bash _audit/push-site.sh_data/game/site speculcom/vibe-gaming "说明"
```

⚠ 产物 9 个文件：`index.html` + `brand.*` + `site.css` + `CNAME` +
`.nojekyll` + `robots.txt` + `sitemap.xml` + `README.md`。

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

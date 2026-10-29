# ai-vibe-gaming

> 中文版：[README.md](./README.md)

The **source repo** for "Vibe Gaming" — single source of truth.

> Site: <https://vg.specul.com>
> ⚠ **This repo does not publish Pages.** Build output goes to [`speculcom/vibe-gaming`](https://github.com/speculcom/vibe-gaming)

## How to read this

18 terms and 6 engine profiles. Go by the stage you're actually at:

| Where you are | What to read |
|---|---|
| Haven't picked an engine yet | `terms/engines/` — six profiles, starting with which one treats AI best |
| Got a demo that runs | `S1 选引擎` → `S2 核心循环` |
| It runs but doesn't feel good | `S3 手感调参` — why the parameters AI hands you are always slightly off |
| About to let other people play it | `S4 资产合规` (which art and audio you may ship) → `S5 导出发布` |
| Just curious whether AI can make games | Read the three judgement tables in [`claims/`](./claims/) first — the conclusions are at the top |

Want to know *why* we say that? [`pages/method.md`](./pages/method.md) has it.

## What question this site answers

**Which parts of making a game has AI actually changed, and which parts has it not?**

The core claim (see `claims/`):

> AI has lowered the cost of making games **unevenly** — writing code is down 70–80%,
> while art, music and level design have barely moved. So the bottleneck for making a
> game alone has shifted from "I can't write it" to "I can't assemble the parts."

## Content structure

| Path | Content | Status |
|---|---|---|
| `claims/` | **Claim layer** (three judgement tables) | ✅ done |
| `terms/` | Five-stage teaching entries (Markdown + frontmatter) | ✅ done |
| `terms/engines/` | Engine profiles (Godot · three.js · Pixi · Phaser · libGDX · Bevy) | ✅ done |
| `basement/` | Placeholder for a custom in-house base | ⏸ deferred (user decision) |
| `site/` | **Build output** (pushed to the `vibe-gaming` repo) | generated |

> **Counts are not written here by hand** — the "Measured size" section at the end is
> computed from the data by `_audit/gen-repo-docs.mjs`.
> A hand-written "25 HTML pages" line here went stale the moment the count hit 27.

⚠ **The English is not in `data/*.en.json`** — it goes through `scripts/i18n-body.mjs`:
each term's English lives in a `> ` quote block inside the Markdown, and the build splits it
out into dual nodes. (The `data/` directory currently holds 0 files; the `*.en.json` files
mentioned in earlier docs do not exist.)

### The five stages (ordered by how you actually build a game, not by tool)

1. **Choosing an engine** — which engine is most AI-friendly
2. **Core loop** — how to turn gameplay into code
3. **Game feel tuning** — why the parameters AI gives you are wrong
4. **Asset compliance** — where art and audio come from, what you may ship commercially
5. **Export and publish** — how to get it in front of players

## Build

```bash
node scripts/build.mjs        # → site/
bash _audit/push-site.sh _data/game/site speculcom/vibe-gaming "message"
```

⚠ Output = the HTML pages + `brand.*` + `site.css` + `CNAME` + `.nojekyll` + `robots.txt`
+ `sitemap.xml` + `README.md` (exact page count: see Measured size below).

`sitemap.xml` is enumerated from the actual files in `site/` at the end of the build
(percent-encoding Chinese filenames), and `_audit/vg-sitemap.mjs` verifies that every
`loc` corresponds to a real file.

⚠ **`.nojekyll` is required** — without it the Pages build fails.

## Methodology constraints (six rules)

1. **No benchmarks of our own** — this site runs no benchmarks and states no conclusions
   about quality or speed
2. **Verified snapshots** — every judgement records its verification date; demo status
   changes fast
3. **No cross-layer ranking** — engines are not ranked
4. **Judgement with evidence, never fake rankings** — each claim cites a source, or is
   explicitly labelled "our own reading"
5. **Unknown stays unknown** — where licensing is unclear, write "not confirmed by the
   publisher"; never guess
6. **No binary hosting** — index only, do not host

## Related

- Showcase site (planned): <https://demos.specul.com> — source repo [`speculcom/ai-demos`](https://github.com/speculcom/ai-demos)
- Site-group plan: `_plan/vibe-gaming.md` (in the working copy of the `speculcom/www` repo)

<!-- INDEX:BEGIN generated, do not edit -->

## Content index

### The five stages, in the order you actually build a game

| Stage | Term | In one line |
|---|---|---|
| S1 · Pick an engine | [S1 · Pick an engine](terms/S1-%E9%80%89%E5%BC%95%E6%93%8E.md) | Pick the wrong engine and every later sta… |
| S2 · The core loop | [S2 · The core loop](terms/S2-%E6%A0%B8%E5%BF%83%E5%BE%AA%E7%8E%AF.md) | A gameplay prototype is verifiable — if t… |
| S3 · Feel and tuning | [S3 · Game feel & tuning](terms/S3-%E6%89%8B%E6%84%9F%E8%B0%83%E5%8F%82.md) | This is the stage AI cannot help with — a… |
| S4 · Assets and licensing | [S4 · Asset licensing](terms/S4-%E8%B5%84%E4%BA%A7%E5%90%88%E8%A7%84.md) | This step is not technical, it is legal —… |
| S5 · Ship it | [S5 · Ship it](terms/S5-%E5%AF%BC%E5%87%BA%E5%8F%91%E5%B8%83.md) | This is where AI helps least — because it… |

### Keywords

- [Vibe Gaming](terms/Vibe%20Gaming.md) —— It actually mixes two things, and only on…
- [Web export feasibility](terms/Web%20%E5%AF%BC%E5%87%BA%E5%8F%AF%E8%A1%8C%E6%80%A7.md) —— If you need long-term saves, multiplayer,…
- [Structuring the prompt](terms/%E6%8F%90%E7%A4%BA%E8%AF%8D%E7%9A%84%E7%BB%93%E6%9E%84.md) —— Give three things each time: the input ma…
- [Minimal playable prototype](terms/%E6%9C%80%E5%B0%8F%E5%8F%AF%E7%8E%A9%E5%8E%9F%E5%9E%8B.md) —— How far is far enough? Far enough that th…
- [Game feel checklist](terms/%E6%89%8B%E6%84%9F%E9%97%AE%E9%A2%98%E6%B8%85%E5%8D%95.md) —— First work out whether it is a code probl…
- [Font licensing traps](terms/%E5%AD%97%E4%BD%93%E7%9A%84%E6%8E%88%E6%9D%83%E9%99%B7%E9%98%B1.md) —— Before using a font, screenshot its licen…
- [Audio sources and their licences](terms/%E9%9F%B3%E9%A2%91%E7%B4%A0%E6%9D%90%E7%9A%84%E6%9D%A5%E6%BA%90%E4%B8%8E%E6%8E%88%E6%9D%83.md) —— Prefer packs explicitly marked CC0; if yo…
- [Ship a rough version first](terms/%E5%85%88%E5%8F%91%E6%9E%81%E7%AE%80%E7%89%88.md) —— Upload something playable on itch.io with…
- [Save and offline behaviour](terms/%E5%AD%98%E6%A1%A3%E4%B8%8E%E7%A6%BB%E7%BA%BF%E8%A1%8C%E4%B8%BA.md) —— Before shipping, test: does progress surv…
- [AI asset ledger](terms/AI%20%E8%B5%84%E4%BA%A7%E5%8F%B0%E8%B4%A6.md) —— Building it costs ten minutes. Not buildi…
- [Godot's scene tree](terms/Godot%20%E5%9C%BA%E6%99%AF%E6%A0%91.md) —— Let AI write the GDScript and build the s…
- [Copyright of AI-generated work](terms/AI%20%E7%94%9F%E6%88%90%E5%86%85%E5%AE%B9%E7%9A%84%E7%89%88%E6%9D%83.md) —— Read the service's terms before commercia…
- [Context window and AI-written games](terms/%E4%B8%8A%E4%B8%8B%E6%96%87%E7%AA%97%E5%8F%A3%E4%B8%8E%20AI%20%E5%86%99%E6%B8%B8%E6%88%8F.md) —— Keep single files to a few hundred lines,…

### Engine profiles

- [Bevy](terms/engines/Bevy.md)
- [Godot](terms/engines/Godot.md)
- [libGDX](terms/engines/libGDX.md)
- [Phaser](terms/engines/Phaser.md)
- [Pixi](terms/engines/Pixi.md)
- [Three.js](terms/engines/Three.js.md)

<!-- INDEX:END -->

## Measured size (A8)

<!-- STATS:BEGIN generated, do not edit -->
| Item | Measured value |
|---|---|
| Term entries | 18 (stage 13 · keyword 5) |
| Engine profiles | 6 (Bevy · Godot · libGDX · Phaser · Pixi · Three.js) |
| Cross-cutting pages | 2 (demos · method) |
| Site output | 29 HTML pages |
<!-- STATS:END -->
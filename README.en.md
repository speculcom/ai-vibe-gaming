# ai-vibe-gaming

> 中文版：[README.md](./README.md)

> 中文 | [English](README.md)

The **source repo** for "Vibe Gaming" — single source of truth.

> Site: <https://vg.specul.com>
> ⚠ **This repo does not publish Pages.** Build output goes to [`speculcom/vibe-gaming`](https://github.com/speculcom/vibe-gaming)

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
| `terms/engines/` | Engine profiles (Godot · three.js · Pixi · libGDX · Bevy) | ✅ done |
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

## Measured size (A8)

<!-- STATS:BEGIN 由 _audit/gen-repo-docs.mjs 生成，勿手改 -->
| Item | Measured value |
|---|---|
| Term entries | 17 (stage 12 · keyword 5) |
| Engine profiles | 5 (Bevy · Godot · libGDX · Pixi · Three.js) |
| Cross-cutting pages | 2 (demos · method) |
| Site output | 27 HTML pages |
<!-- STATS:END -->
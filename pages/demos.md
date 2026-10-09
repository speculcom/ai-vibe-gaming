---
zh: "最小可玩原型代码清单"
en: "Minimal prototype code list"
what: "五个引擎各一份「能操作 / 有目标 / 有反馈」的最小骨架 —— 可以抄的起点，不是成品。"
whatEn: "One minimal skeleton per engine covering operable / goal-directed / responsive — a starting point to copy, not a finished thing."
decision: "抄骨架、只改三个数（速度、目标位置、反馈方式），先让它跑起来 —— 原型阶段加美术是最贵的弯路。"
decisionEn: "Copy a skeleton, change three numbers (speed, target position, feedback), and get it running — polishing art during prototyping is the most expensive detour."
confidence: our-judgement
---

# 最小可玩原型代码清单

每个阶段页都在说「先做最小可玩原型」，但**没人给过能直接抄的骨架**。
这一页补上：五个引擎各一段最小骨架，外加一张共用清单。

⚠ **本站铁律：不做实测。** 下面的骨架是**起点模板，未经本站运行验证**；
每一段都附了官方入门文档的出处 —— 跑不通时，先看官方那一份。

<!-- EN -->
> Every stage page says "build the minimal playable prototype first", but **nobody hands you a skeleton to copy**.
> This page does: one minimal skeleton per engine, plus a shared checklist.
>
> ⚠ **The site's rule: no measurements.** The skeletons below are **starting templates, not run or verified by this site**.
> Each one links to the official tutorial — if it does not run, go there first.

## 共用清单

三条判据（来自 [最小可玩原型](./最小可玩原型.html)），骨架里逐条标注：

- [ ] **能操作** —— 玩家能让角色动起来
- [ ] **有目标** —— 玩家知道要做什么
- [ ] **有反馈** —— 操作有可见响应
- [ ] **粗糙的美术** —— 纯色方块就够，别在原型阶段美化
- [ ] **一次只改一个参数** —— 改完记下来

<!-- EN -->
> ## Shared checklist
>
> The three criteria (from [Minimal playable prototype](./最小可玩原型.html)), marked line by line in each skeleton:
>
> - [ ] **Operable** — the player can move the character
> - [ ] **Goal-directed** — the player knows what to do
> - [ ] **Responsive** — input has a visible result
> - [ ] **Crude art** — flat coloured boxes are enough; do not polish during prototyping
> - [ ] **One parameter at a time** — and write the change down

## Godot · GDScript

场景树：`Player(CharacterBody2D)` + `Ground(StaticBody2D)` + `Target(Area2D)` + `Camera2D`。
下面这段挂在 `Player` 上。

```gdscript
extends CharacterBody2D

const SPEED := 220.0
const JUMP_VELOCITY := -420.0
var score := 0

func _physics_process(delta: float) -> void:
	velocity.y += 980.0 * delta                                   # 反馈：重力一直在作用
	velocity.x = Input.get_axis("ui_left", "ui_right") * SPEED    # 能操作
	if is_on_floor() and Input.is_action_just_pressed("ui_accept"):
		velocity.y = JUMP_VELOCITY
	move_and_slide()

func _on_target_body_entered(_body: Node2D) -> void:
	score += 1                                                    # 有目标：碰到就得分
	$HUD.text = "得分 %d" % score                                  # 反馈：数字变了
```

出处：Godot 官方 *Your first 2D game*（`docs.godotengine.org`）。

<!-- EN -->
> ## Godot · GDScript
>
> Scene tree: `Player(CharacterBody2D)` + `Ground(StaticBody2D)` + `Target(Area2D)` + `Camera2D`.
> The script below goes on `Player`.
>
> ```gdscript
> extends CharacterBody2D
>
> const SPEED := 220.0
> const JUMP_VELOCITY := -420.0
> var score := 0
>
> func _physics_process(delta: float) -> void:
> 	velocity.y += 980.0 * delta                                   # responsive: gravity always acts
> 	velocity.x = Input.get_axis("ui_left", "ui_right") * SPEED    # operable
> 	if is_on_floor() and Input.is_action_just_pressed("ui_accept"):
> 		velocity.y = JUMP_VELOCITY
> 	move_and_slide()
>
> func _on_target_body_entered(_body: Node2D) -> void:
> 	score += 1                                                    # goal: touching the target scores
> 	$HUD.text = "score %d" % score                                 # responsive: the number changes
> ```
>
> Source: Godot's official *Your first 2D game* (`docs.godotengine.org`).

## three.js · JavaScript

three.js 是库不是引擎（见 [引擎档案](./engines.html)），所以循环与状态要自己写。

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
camera.position.z = 6;

const player = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshNormalMaterial());
scene.add(player);

const target = new THREE.Mesh(new THREE.SphereGeometry(0.35),
  new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
target.position.set(2.5, 1, 0);
scene.add(target);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

const keys = new Set();
addEventListener('keydown', (e) => keys.add(e.code));
addEventListener('keyup', (e) => keys.delete(e.code));

renderer.setAnimationLoop(() => {
  const dir = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
  player.position.x += dir * 0.05;                       // 能操作
  if (player.position.distanceTo(target.position) < 0.8) {
    target.visible = false;                              // 有目标
    player.material = new THREE.MeshBasicMaterial({ color: 0x4ade80 });  // 反馈
  }
  renderer.render(scene, camera);
});
```

出处：three.js 官方 *Installation* 与 *Creating a scene*（`threejs.org`）。

<!-- EN -->
> ## three.js · JavaScript
>
> three.js is a library, not an engine (see [engine profiles](./engines.html)), so the loop and the state are yours to write.
>
> ```js
> import * as THREE from 'three';
>
> const scene = new THREE.Scene();
> const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 100);
> camera.position.z = 6;
>
> const player = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8),
>   new THREE.MeshNormalMaterial());
> scene.add(player);
>
> const target = new THREE.Mesh(new THREE.SphereGeometry(0.35),
>   new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
> target.position.set(2.5, 1, 0);
> scene.add(target);
>
> const renderer = new THREE.WebGLRenderer({ antialias: true });
> renderer.setSize(innerWidth, innerHeight);
> document.body.appendChild(renderer.domElement);
>
> const keys = new Set();
> addEventListener('keydown', (e) => keys.add(e.code));
> addEventListener('keyup', (e) => keys.delete(e.code));
>
> renderer.setAnimationLoop(() => {
>   const dir = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
>   player.position.x += dir * 0.05;                       // operable
>   if (player.position.distanceTo(target.position) < 0.8) {
>     target.visible = false;                              // goal
>     player.material = new THREE.MeshBasicMaterial({ color: 0x4ade80 });  // responsive
>   }
>   renderer.render(scene, camera);
> });
> ```
>
> Source: three.js official *Installation* and *Creating a scene* (`threejs.org`).

## Pixi · TypeScript

```ts
import { Application, Graphics } from 'pixi.js';

const app = new Application();
await app.init({ background: '#12161f', resizeTo: window });
document.body.appendChild(app.canvas);

const player = new Graphics().rect(0, 0, 40, 40).fill(0x4ade80);
player.position.set(80, 120);
const target = new Graphics().circle(0, 0, 16).fill(0xfacc15);
target.position.set(420, 120);
app.stage.addChild(player, target);

const keys = new Set<string>();
addEventListener('keydown', (e) => keys.add(e.key));
addEventListener('keyup', (e) => keys.delete(e.key));

app.ticker.add(({ deltaTime }) => {
  const dir = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
  player.x += dir * 4 * deltaTime;                       // 能操作
  if (Math.abs(player.x - target.x) < 24) {
    target.visible = false;                              // 有目标
    player.tint = 0xfacc15;                              // 反馈
  }
});
```

出处：PixiJS 官方 *Quick Start*（`pixijs.com`）。

<!-- EN -->
> ## Pixi · TypeScript
>
> ```ts
> import { Application, Graphics } from 'pixi.js';
>
> const app = new Application();
> await app.init({ background: '#12161f', resizeTo: window });
> document.body.appendChild(app.canvas);
>
> const player = new Graphics().rect(0, 0, 40, 40).fill(0x4ade80);
> player.position.set(80, 120);
> const target = new Graphics().circle(0, 0, 16).fill(0xfacc15);
> target.position.set(420, 120);
> app.stage.addChild(player, target);
>
> const keys = new Set<string>();
> addEventListener('keydown', (e) => keys.add(e.key));
> addEventListener('keyup', (e) => keys.delete(e.key));
>
> app.ticker.add(({ deltaTime }) => {
>   const dir = (keys.has('ArrowRight') ? 1 : 0) - (keys.has('ArrowLeft') ? 1 : 0);
>   player.x += dir * 4 * deltaTime;                       // operable
>   if (Math.abs(player.x - target.x) < 24) {
>     target.visible = false;                              // goal
>     player.tint = 0xfacc15;                              // responsive
>   }
> });
> ```
>
> Source: PixiJS official *Quick Start* (`pixijs.com`).

## libGDX · Java

用 gdx-liftoff 生成工程后，把 `core` 里那个 `ApplicationAdapter` 换成这段。

```java
import com.badlogic.gdx.ApplicationAdapter;
import com.badlogic.gdx.Gdx;
import com.badlogic.gdx.Input;
import com.badlogic.gdx.graphics.Color;
import com.badlogic.gdx.graphics.Texture;
import com.badlogic.gdx.graphics.g2d.SpriteBatch;
import com.badlogic.gdx.utils.ScreenUtils;

public class Prototype extends ApplicationAdapter {
    SpriteBatch batch;
    Texture player, target;
    float px = 100f;
    boolean hit;

    public void create() {
        batch = new SpriteBatch();
        player = new Texture("player.png");   // 先用 1x1 纯色图
        target = new Texture("target.png");
    }

    public void render() {
        float dx = 0f;
        if (Gdx.input.isKeyPressed(Input.Keys.LEFT))  dx -= 1f;   // 能操作
        if (Gdx.input.isKeyPressed(Input.Keys.RIGHT)) dx += 1f;
        px += dx * 240f * Gdx.graphics.getDeltaTime();

        if (Math.abs(px - 400f) < 24f) hit = true;                // 有目标

        ScreenUtils.clear(hit ? Color.GREEN : Color.DARK_GRAY);   // 反馈：整屏变色
        batch.begin();
        batch.draw(player, px, 100f);
        if (!hit) batch.draw(target, 400f, 100f);
        batch.end();
    }
}
```

出处：libGDX 官方 wiki *A simple game*（`libgdx.com`）+ gdx-liftoff 工程结构。

<!-- EN -->
> ## libGDX · Java
>
> After generating a project with gdx-liftoff, replace the `ApplicationAdapter` in `core` with this.
>
> ```java
> import com.badlogic.gdx.ApplicationAdapter;
> import com.badlogic.gdx.Gdx;
> import com.badlogic.gdx.Input;
> import com.badlogic.gdx.graphics.Color;
> import com.badlogic.gdx.graphics.Texture;
> import com.badlogic.gdx.graphics.g2d.SpriteBatch;
> import com.badlogic.gdx.utils.ScreenUtils;
>
> public class Prototype extends ApplicationAdapter {
>     SpriteBatch batch;
>     Texture player, target;
>     float px = 100f;
>     boolean hit;
>
>     public void create() {
>         batch = new SpriteBatch();
>         player = new Texture("player.png");   // use a 1x1 flat-colour image first
>         target = new Texture("target.png");
>     }
>
>     public void render() {
>         float dx = 0f;
>         if (Gdx.input.isKeyPressed(Input.Keys.LEFT))  dx -= 1f;   // operable
>         if (Gdx.input.isKeyPressed(Input.Keys.RIGHT)) dx += 1f;
>         px += dx * 240f * Gdx.graphics.getDeltaTime();
>
>         if (Math.abs(px - 400f) < 24f) hit = true;                // goal
>
>         ScreenUtils.clear(hit ? Color.GREEN : Color.DARK_GRAY);   // responsive: the screen changes colour
>         batch.begin();
>         batch.draw(player, px, 100f);
>         if (!hit) batch.draw(target, 400f, 100f);
>         batch.end();
>     }
> }
> ```
>
> Source: the official libGDX wiki *A simple game* (`libgdx.com`) plus the gdx-liftoff project layout.

## Bevy · Rust

⚠ Bevy 的 API 随版本变化较快（本站核验时官方入门写的是 `0.19` 的写法）。
跑不通时**先看官方那份**，不要照着改到能跑为止再回头怀疑本站。

```rust
use bevy::prelude::*;

#[derive(Component)] struct Player;
#[derive(Component)] struct Target;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .add_systems(Startup, setup)
        .add_systems(Update, (move_player, collect))
        .run();
}

fn setup(mut commands: Commands) {
    commands.spawn(Camera2d);
    commands.spawn((Player, Sprite {
        color: Color::srgb(0.3, 0.8, 0.4),
        custom_size: Some(Vec2::splat(40.0)),
        ..default()
    }, Transform::default()));
    commands.spawn((Target, Sprite {
        color: Color::srgb(0.95, 0.8, 0.2),
        custom_size: Some(Vec2::splat(24.0)),
        ..default()
    }, Transform::from_xyz(240.0, 120.0, 0.0)));
}

fn move_player(keys: Res<ButtonInput<KeyCode>>, time: Res<Time>,
               mut q: Query<&mut Transform, With<Player>>) {
    let dir = (keys.pressed(KeyCode::ArrowRight) as i32
             - keys.pressed(KeyCode::ArrowLeft) as i32) as f32;
    for mut t in &mut q {
        t.translation.x += dir * 300.0 * time.delta_secs();   // 能操作
    }
}

fn collect(mut commands: Commands,
           players: Query<&Transform, With<Player>>,
           targets: Query<(Entity, &Transform), With<Target>>) {
    for (e, tt) in &targets {
        for pt in &players {
            if pt.translation.distance(tt.translation) < 32.0 {
                commands.entity(e).despawn();   // 有目标 + 反馈：方块消失
            }
        }
    }
}
```

出处：Bevy 官方 *Quick Start · Setup* 与 *Apps*（`bevy.org`）。

<!-- EN -->
> ## Bevy · Rust
>
> ⚠ Bevy's API moves fast (the official quick start we checked documents the `0.19` style).
> When it does not compile, **go to the official guide first** — do not keep patching until it runs and then doubt this page.
>
> ```rust
> use bevy::prelude::*;
>
> #[derive(Component)] struct Player;
> #[derive(Component)] struct Target;
>
> fn main() {
>     App::new()
>         .add_plugins(DefaultPlugins)
>         .add_systems(Startup, setup)
>         .add_systems(Update, (move_player, collect))
>         .run();
> }
>
> fn setup(mut commands: Commands) {
>     commands.spawn(Camera2d);
>     commands.spawn((Player, Sprite {
>         color: Color::srgb(0.3, 0.8, 0.4),
>         custom_size: Some(Vec2::splat(40.0)),
>         ..default()
>     }, Transform::default()));
>     commands.spawn((Target, Sprite {
>         color: Color::srgb(0.95, 0.8, 0.2),
>         custom_size: Some(Vec2::splat(24.0)),
>         ..default()
>     }, Transform::from_xyz(240.0, 120.0, 0.0)));
> }
>
> fn move_player(keys: Res<ButtonInput<KeyCode>>, time: Res<Time>,
>                mut q: Query<&mut Transform, With<Player>>) {
>     let dir = (keys.pressed(KeyCode::ArrowRight) as i32
>              - keys.pressed(KeyCode::ArrowLeft) as i32) as f32;
>     for mut t in &mut q {
>         t.translation.x += dir * 300.0 * time.delta_secs();   // operable
>     }
> }
>
> fn collect(mut commands: Commands,
>            players: Query<&Transform, With<Player>>,
>            targets: Query<(Entity, &Transform), With<Target>>) {
>     for (e, tt) in &targets {
>         for pt in &players {
>             if pt.translation.distance(tt.translation) < 32.0 {
>                 commands.entity(e).despawn();   // goal + responsive: the box disappears
>             }
>         }
>     }
> }
> ```
>
> Source: Bevy official *Quick Start · Setup* and *Apps* (`bevy.org`).

## 怎么用这些骨架

1. **挑一个引擎**（依据见 [选引擎](./s1-选引擎.html) 与 [引擎档案](./engines.html)）
2. **把骨架跑起来**，然后**只改三个地方**：移动速度、目标位置、反馈方式
3. 三条判据都满足 → 原型完成，进 [手感调参](./s3-手感调参.html)
4. ⚠ **别在原型阶段加美术**（理由见 [最小可玩原型](./最小可玩原型.html)）

<!-- EN -->
> ## How to use these skeletons
>
> 1. **Pick one engine** (see [Picking an engine](./s1-选引擎.html) and the [engine profiles](./engines.html))
> 2. **Get the skeleton running**, then **change only three things**: movement speed, target position, feedback style
> 3. All three criteria met → the prototype is done; move on to [game feel](./s3-手感调参.html)
> 4. ⚠ **Do not add art during prototyping** (see [Minimal playable prototype](./最小可玩原型.html))

---

<!-- 层：贯穿层 · 把「最小可玩原型」的三条判据落成可抄的骨架。 -->

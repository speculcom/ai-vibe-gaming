/* vg · 引擎决策树（B4，2026-10-09）
 *
 * 三个问题 → 一个建议 + 一个备选。**不是排名**：每条规则的依据都来自引擎档案自己的字段
 * （tier / aiFriendly / difficulty / script），由构建期生成内嵌进页面，本脚本只做匹配与渲染。
 *
 * URL 可还原：?p=web&d=yes&s=no（平台 / 是否需要 3D / 团队是否有系统语言经验）。
 */
(function () {
  'use strict';

  var box = document.querySelector('.etree');
  if (!box) return;

  var dataEl = box.querySelector('.etree-data');
  var out = box.querySelector('.etree-out');
  var RULES = [];
  try { RULES = JSON.parse(dataEl.textContent) || []; } catch (e) { RULES = []; }
  if (!RULES.length) return;

  var sels = {
    p: box.querySelector('.etree-p'),
    d: box.querySelector('.etree-d'),
    s: box.querySelector('.etree-s'),
  };

  function IS_EN() { return document.documentElement.lang === 'en'; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function param(n) {
    try { return new URLSearchParams(location.search).get(n) || ''; } catch (e) { return ''; }
  }

  function render() {
    var p = sels.p.value, d = sels.d.value, s = sels.s.value;
    if (!p || !d || !s) { out.innerHTML = ''; return; }
    var hit = null;
    for (var i = 0; i < RULES.length; i++) {
      var w = RULES[i].when;
      if (w.p === p && w.d === d && w.s === s) { hit = RULES[i]; break; }
    }
    if (!hit) {
      out.innerHTML = '<p class="etree-none">' + esc(IS_EN()
        ? 'No rule matches this combination — the tree only covers the combinations listed in the engine profiles.'
        : '这组条件没有对应规则 —— 决策树只覆盖引擎档案能支撑的那些组合。') + '</p>';
      return;
    }
    var card = function (e, tag) {
      /* data-* 带**原始字段值**（不是中文标签），供 _audit/engine-tree.mjs 逐个核对
       * 「依据真的来自这份档案」。人读的是 why，机器读的是 data-*。 */
      var r = e.raw || {};
      return '<div class="etree-card' + (tag === 'alt' ? ' is-alt' : '') + '"'
        + ' data-eng="' + esc(e.slug) + '" data-tier="' + esc(r.tier || '') + '" data-ai="' + esc(r.ai || '') + '"'
        + ' data-diff="' + esc(r.diff || '') + '" data-script="' + esc(r.script || '') + '">'
        + '<div class="etree-tag">' + esc(tag === 'alt' ? (IS_EN() ? 'Alternative' : '备选') : (IS_EN() ? 'Suggested' : '建议')) + '</div>'
        + '<div class="etree-name"><a href="./' + esc(e.slug) + '.html">' + esc(e.name) + '</a></div>'
        + '<div class="etree-why">' + esc(IS_EN() && e.whyEn ? e.whyEn : e.why) + '</div>'
        + (e.caveat ? '<div class="etree-caveat">' + esc(IS_EN() && e.caveatEn ? e.caveatEn : e.caveat) + '</div>' : '')
        + '</div>';
    };
    var en = IS_EN();
    var html = card(en ? hit.pickEn : hit.pick, 'pick');
    if (hit.alt) html += card(en ? hit.altEn : hit.alt, 'alt');
    html += '<p class="etree-note">' + esc(en
      ? 'Every line above is read from that engine profile own fields (tier / AI error rate / onboarding cost / scripting language). This site runs no measurements: the AI-error-rate column is our judgement, and it is a different axis from onboarding cost.'
      : '上面每一行都来自该引擎档案自己的字段（类型 / AI 出错率 / 上手成本 / 脚本语言）。本站不做实测：AI 出错率是本站判断，且与「上手成本」是两条独立的轴。') + '</p>';
    out.innerHTML = html;
  }

  function sync() {
    try {
      var u = new URL(location.href);
      ['p', 'd', 's'].forEach(function (k) { if (sels[k].value) u.searchParams.set(k, sels[k].value); else u.searchParams.delete(k); });
      history.replaceState(null, '', u.toString());
    } catch (e) { /* 静默降级：功能可用，地址栏不同步 */ }
  }

  ['p', 'd', 's'].forEach(function (k) {
    var v = param(k);
    if (v) {
      var found = Array.prototype.some.call(sels[k].options, function (o) { return o.value === v; });
      if (!found) { var o2 = document.createElement('option'); o2.value = v; o2.textContent = v; sels[k].appendChild(o2); }
      sels[k].value = v;
    }
    sels[k].addEventListener('change', function () { render(); sync(); });
  });
  render();
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
})();

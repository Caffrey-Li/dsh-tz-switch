window.__ModuleLoader__.load({
  id: 'dsh-tz-switch',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

    var react = require('react');
    // Every call below passes children as trailing arguments, which is
    // createElement's shape — jsx() takes them in props.children instead.
    var h = react.createElement;

    // The sidebar row id and the main-panel key share one value, the way the
    // stock sidebar panels do, so the entry and the page it opens resolve
    // together through the layout's selectPanel.
    var PANEL_ID = 'tz-switch';
    var ROUTE = '/api/tz-switch';
    // The module system owns styles by package id: it claims untagged <style>
    // tags a factory injected and removes the ones tagged for the package when
    // the row unloads. Tag with the real id and rewrite the text on every load,
    // otherwise the very first stylesheet stays in the page forever and later
    // rule changes never reach it.
    var OWNER = 'dsh-tz-switch';
    var STYLE_ID = OWNER + '/page.css';

    var CSS = [
      '.tzg-page{box-sizing:border-box;height:100%;overflow:auto;padding:28px 32px 40px;display:flex;flex-direction:column;gap:18px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary)}',
      '.tzg-head{align-items:flex-start;justify-content:space-between;gap:16px;display:flex}',
      '.tzg-title{font-size:20px;font-weight:600;line-height:1.4;margin:0}',
      '.tzg-sub{color:var(--dsw-alias-label-secondary);font-size:12px;margin:2px 0 0}',
      '.tzg-refresh{border:1px solid var(--dsw-alias-border-l3);border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:12px;padding:6px 12px}',
      '.tzg-refresh:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.tzg-now{border:1px solid var(--dsw-alias-border-l3);border-radius:14px;padding:18px 20px;display:flex;flex-direction:column;gap:6px;background:var(--dsw-specific-sidebar-fill,transparent)}',
      '.tzg-now-label{color:var(--dsw-alias-label-secondary);font-size:12px}',
      '.tzg-now-zone{font-size:16px;display:flex;align-items:baseline;gap:10px;flex-wrap:wrap}',
      '.tzg-now-id,.tzg-now-offset{color:var(--dsw-alias-label-secondary);font-size:13px;font-weight:400}',
      '.tzg-clock{font-family:ui-monospace,Consolas,monospace;font-size:26px;font-weight:600;letter-spacing:.5px}',
      '.tzg-grid{display:grid;gap:12px}',
      '.tzg-card{box-sizing:border-box;width:100%;border:1px solid var(--dsw-alias-border-l3);border-radius:14px;padding:16px 18px;background:transparent;color:inherit;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:16px;text-align:left;transition:background .15s,border-color .15s}',
      '.tzg-card:hover{background:var(--dsw-alias-interactive-bg-hover)}',
      '.tzg-card[disabled]{cursor:progress;opacity:.7}',
      '.tzg-card-active{border-color:var(--dsw-alias-brand-primary,#4c9aff);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4c9aff) 8%,transparent)}',
      '.tzg-card-city{font-size:15px;font-weight:600}',
      '.tzg-card-label{color:var(--dsw-alias-label-secondary);font-size:12px;margin-top:3px}',
      '.tzg-card-side{display:flex;align-items:center;gap:12px;flex:none}',
      '.tzg-card-time{font-family:ui-monospace,Consolas,monospace;font-size:15px;color:var(--dsw-alias-label-secondary)}',
      '.tzg-pill{border-radius:999px;padding:3px 10px;font-size:11px;background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4c9aff) 16%,transparent);color:var(--dsw-alias-brand-primary,#4c9aff)}',
      '.tzg-pill-busy{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '.tzg-notice{border-radius:10px;padding:10px 14px;font-size:13px}',
      '.tzg-warn{background:color-mix(in srgb,#f5a524 18%,transparent);color:#7a4f00}',
      '.tzg-good{background:color-mix(in srgb,#2fbf71 14%,transparent);color:#1f8f55}',
      '.tzg-bad{background:color-mix(in srgb,#f2555a 14%,transparent);color:#c62f35}',
      '.tzg-note{color:var(--dsw-alias-label-secondary);font-size:12px;margin:0}',
      '.tzg-icon{display:inline-flex;align-items:center;justify-content:center}',
      '.tzf-side{display:flex;align-items:center;gap:9px;width:100%;min-height:34px;margin:2px 0 6px;padding:0 8px 0 6px;border:0;border-radius:9px;background:none;color:var(--bt-ink,var(--dsw-alias-label-primary,inherit));font:inherit;font-size:14px;line-height:20px;text-align:left;cursor:pointer;flex:none;transition:background-color .14s ease}',
      '.tzf-side:hover{background:var(--bt-hover,var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.12)))}',
      '.tzf-side:active .tzf-side-badge{transform:scale(.92)}',
      '.tzf-side-badge{display:inline-flex;flex:none;line-height:0;filter:drop-shadow(0 2px 5px rgba(76,107,255,.3));transition:transform .18s cubic-bezier(.22,1,.36,1)}',
      '.tzf-side:hover .tzf-side-badge{transform:translateY(-1px) scale(1.05) rotate(-4deg)}',
      '.tzf-side-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500}',
      '.tzf-side-time{margin-left:auto;flex:none;padding-left:6px;font-family:ui-monospace,Consolas,monospace;font-size:12px;line-height:16px;font-variant-numeric:tabular-nums;color:var(--bt-ink-3,var(--dsw-alias-label-secondary,currentColor))}',
      '.bt-leftcol[data-left=rail] .tzf-side{justify-content:center;padding:0}',
      '.bt-leftcol[data-left=rail] .tzf-side-name,.bt-leftcol[data-left=rail] .tzf-side-time{display:none}',
      '.tzg-list{display:flex;flex-direction:column;gap:6px}',
      '.tzg-row{display:flex;align-items:center;gap:6px;padding:6px 8px 6px 3px;border:1px solid var(--dsw-alias-border-l3,#0000001f);border-radius:12px;background:transparent;transition:border-color .12s,background-color .12s,opacity .12s}',
      '.tzg-row-active{border-color:var(--dsw-alias-brand-primary,#4c9aff);background:color-mix(in srgb,var(--dsw-alias-brand-primary,#4c9aff) 7%,transparent)}',
      '.tzg-row-over{border-color:var(--dsw-alias-brand-primary,#4c9aff);box-shadow:inset 0 2px 0 0 var(--dsw-alias-brand-primary,#4c9aff)}',
      '.tzg-row-drag{opacity:.45}',
      '.tzg-grip{cursor:grab;color:var(--dsw-alias-label-secondary);font-size:15px;line-height:1;padding:0 2px;user-select:none;flex:none;opacity:.7}',
      '.tzg-row-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;align-items:flex-start;border:0;background:none;color:inherit;font:inherit;text-align:left;cursor:pointer;padding:6px 4px;border-radius:8px}',
      '.tzg-row-main:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000f)}',
      '.tzg-row-city{font-size:15px;font-weight:600;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.tzg-row-meta{font-size:12px;color:var(--dsw-alias-label-secondary);display:flex;align-items:center;gap:8px}',
      '.tzg-row-time{flex:none;font-family:ui-monospace,Consolas,monospace;font-size:15px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.tzg-row-del{flex:none;width:26px;height:26px;border:0;border-radius:8px;background:none;color:var(--dsw-alias-label-secondary);font-size:16px;line-height:1;cursor:pointer}',
      '.tzg-row-del:hover{background:color-mix(in srgb,#f2555a 16%,transparent);color:#c62f35}',
      '.tzg-list-foot{display:flex}',
      '.tzg-add{border:1px dashed var(--dsw-alias-border-l3,#00000029);background:none;color:var(--dsw-alias-label-secondary);border-radius:10px;padding:8px 14px;font:inherit;font-size:13px;cursor:pointer}',
      '.tzg-add:hover{border-color:var(--dsw-alias-brand-primary,#4c9aff);color:var(--dsw-alias-label-primary)}',
      '.tzg-picker{border:1px solid var(--dsw-alias-border-l3,#0000001f);border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px;background:var(--dsw-specific-sidebar-fill)}',
      '.tzg-search{box-sizing:border-box;width:100%;height:34px;border:1px solid var(--dsw-alias-border-l3,#0000001f);border-radius:8px;background:transparent;color:inherit;font:inherit;font-size:13px;padding:8px 10px;outline:none}',
      '.tzg-search:focus{border-color:var(--dsw-alias-brand-primary,#4c9aff)}',
      '.tzg-picks{display:flex;flex-direction:column;gap:2px;max-height:280px;overflow:auto}',
      '.tzg-pick{display:flex;align-items:center;gap:10px;border:0;background:none;color:inherit;font:inherit;font-size:13px;text-align:left;padding:7px 8px;border-radius:8px;cursor:pointer}',
      '.tzg-pick:hover{background:var(--dsw-alias-interactive-bg-hover,#0000000f)}',
      '.tzg-pick-city{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.tzg-pick-offset{flex:none;color:var(--dsw-alias-label-secondary);font-family:ui-monospace,Consolas,monospace;font-size:12px}',
      '.tzg-pick-empty{padding:10px;color:var(--dsw-alias-label-secondary);font-size:12px}',
    ].join('');

    if (typeof document !== 'undefined') {
      // Drop the tag the first builds left under the short id: it is tagged for
      // nobody, so the module system never reclaims it and it keeps stale rules.
      var legacy = document.querySelectorAll('style[data-plugin="dsh-plugin-tz-switch"]');
      for (var legacyIndex = 0; legacyIndex < legacy.length; legacyIndex += 1) legacy[legacyIndex].remove();
      var sheet = document.querySelector('style[data-plugin-css=' + JSON.stringify(STYLE_ID) + ']');
      if (sheet === null) {
        sheet = document.createElement('style');
        sheet.dataset.plugin = OWNER;
        sheet.dataset.pluginCss = STYLE_ID;
        document.head.appendChild(sheet);
      }
      if (sheet.textContent !== CSS) sheet.textContent = CSS;
    }

    /** Next tick of the panel clock; the page renders the three zone times itself. */
    function useNow() {
      var pair = react.useState(function () { return Date.now(); });
      var setNow = pair[1];
      react.useEffect(function () {
        var timer = setInterval(function () { setNow(Date.now()); }, 1000);
        return function () { clearInterval(timer); };
      }, []);
      return pair[0];
    }

    // Last-resort names, used only when the host has not reported an offset.
    // Chromium builds here carry stale Canadian rules (Calgary and Vancouver an
    // hour fast), so a browser-computed clock is never trusted for a live zone.
    var IANA = {
      'China Standard Time': 'Asia/Shanghai',
      'Mountain Standard Time': 'America/Edmonton',
      'Pacific Standard Time': 'America/Los_Angeles',
    };

    function ianaOf(zoneId) {
      return Object.prototype.hasOwnProperty.call(IANA, zoneId) ? IANA[zoneId] : 'UTC';
    }

    /** `UTC-7` / `GMT-07:00` -> minutes east of UTC. */
    function parseOffset(label) {
      if (typeof label !== 'string') return null;
      var match = /^(?:UTC|GMT)?([+-])(\d{1,2})(?::?(\d{2}))?$/.exec(label.trim());
      if (match === null) return null;
      var minutes = Number(match[2]) * 60 + Number(match[3] || 0);
      return match[1] === '-' ? -minutes : minutes;
    }

    function pad(value) {
      return value < 10 ? '0' + value : String(value);
    }

    /** Wall clock at a fixed offset; shifts the instant instead of the clock zone. */
    function clockAt(offsetMinutes, date, withSeconds) {
      var shifted = new Date(date.getTime() + offsetMinutes * 60000);
      var text = pad(shifted.getUTCHours()) + ':' + pad(shifted.getUTCMinutes());
      return withSeconds ? text + ':' + pad(shifted.getUTCSeconds()) : text;
    }

    /** The current zone's wall clock, ticking, from the host-reported offset. */
    function clockOfNow(state, now) {
      if (state === null || typeof state !== 'object') return '';
      var offset = typeof state.offsetMinutes === 'number' ? state.offsetMinutes : parseOffset(state.offsetLabel);
      if (offset === null) return typeof state.local === 'string' ? state.local : '';
      return clockAt(offset, new Date(now), true);
    }

    function localTime(zone, date) {
      if (zone !== null && typeof zone === 'object' && typeof zone.offsetMinutes === 'number') {
        return clockAt(zone.offsetMinutes, date, true);
      }
      var id = zone !== null && typeof zone === 'object' ? zone.id : zone;
      try {
        return new Intl.DateTimeFormat('zh-CN', {
          timeZone: ianaOf(id), hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
        }).format(date);
      } catch (error) {
        return '--:--:--';
      }
    }

    /** The sidebar glyph: a clock face, drawn inline so it inherits the row colour. */
    function TZIcon(props) {
      var size = props && props.size ? props.size : 16;
      return h('span', { className: 'tzg-icon' },
        h('svg', {
          width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
          stroke: 'currentColor', strokeWidth: 1.4, strokeLinecap: 'round', strokeLinejoin: 'round',
          'aria-hidden': 'true',
        },
          h('circle', { cx: 8, cy: 8, r: 6 }),
          h('path', { d: 'M8 4.6V8l2.2 1.4' })
        )
      );
    }

    async function callApi(method, body) {
      var response = await fetch(ROUTE, {
        method: method,
        credentials: 'same-origin',
        headers: body === undefined ? {} : { 'content-type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      var payload = {};
      try { payload = await response.json(); } catch (error) { payload = {}; }
      if (!response.ok && payload.ok === undefined) throw new Error('HTTP ' + response.status);
      return payload;
    }

    function messageOf(error) {
      return String(error && error.message ? error.message : error);
    }

    /**
     * The zone payload, wherever the reply put it: GET nests it under `state`,
     * while a switch replies with the same fields flat next to `ok`/`zones`.
     * Reading only `payload.state` leaves the row and the page showing the zone
     * that was current before the switch.
     */
    function stateOf(payload) {
      if (payload === null || typeof payload !== 'object') return null;
      if (payload.state !== null && typeof payload.state === 'object') return payload.state;
      if (typeof payload.id === 'string' && payload.id !== '') return payload;
      return null;
    }

    /** The page behind the sidebar row: the current zone and the user's own list. */
    function TZPage() {
      var dataPair = react.useState({ loading: true, state: null, zones: [], catalog: [], error: null });
      var data = dataPair[0];
      var setData = dataPair[1];
      var busyPair = react.useState(null);
      var busy = busyPair[0];
      var setBusy = busyPair[1];
      var noticePair = react.useState(null);
      var notice = noticePair[0];
      var setNotice = noticePair[1];
      var pickerPair = react.useState(false);
      var picker = pickerPair[0];
      var setPicker = pickerPair[1];
      var queryPair = react.useState('');
      var query = queryPair[0];
      var setQuery = queryPair[1];
      var dragPair = react.useState(-1);
      var drag = dragPair[0];
      var setDrag = dragPair[1];
      var overPair = react.useState(-1);
      var over = overPair[0];
      var setOver = overPair[1];
      var now = useNow();

      var merge = function (payload) {
        var next = stateOf(payload);
        setData(function (current) {
          return {
            loading: false,
            state: next === null ? current.state : next,
            zones: Array.isArray(payload.zones) ? payload.zones : current.zones,
            catalog: Array.isArray(payload.catalog) ? payload.catalog : current.catalog,
            error: payload.ok === false ? String(payload.error || '操作失败') : null,
          };
        });
        if (next !== null) syncRowState(next);
      };

      var refresh = react.useCallback(function () {
        return callApi('GET').then(merge).catch(function (error) {
          setData(function (current) {
            return { loading: false, state: current.state, zones: current.zones, catalog: current.catalog, error: messageOf(error) };
          });
        });
      }, []);

      react.useEffect(function () { refresh(); }, [refresh]);

      var send = function (op, target) {
        setBusy(target || op);
        setNotice(null);
        var body = op === 'switch' ? { op: 'switch', target: target } : { op: 'save', zones: target };
        return callApi('POST', body).then(function (payload) {
          merge(payload);
          if (payload.ok === false) {
            setNotice({ tone: 'bad', text: String(payload.error || '操作失败') + (payload.detail ? '：' + payload.detail : '') });
          } else if (op === 'switch') {
            var next = stateOf(payload);
            setNotice({ tone: 'good', text: payload.changed ? '已切换到' + (next && next.city ? next.city : '目标时区') : '当前已经是这个时区' });
          }
        }).catch(function (error) {
          setNotice({ tone: 'bad', text: '操作失败：' + messageOf(error) });
        }).then(function () {
          setBusy(null);
        });
      };

      var ids = function () { return data.zones.map(function (zone) { return zone.id; }); };
      var addZone = function (id) {
        if (data.zones.some(function (zone) { return zone.id === id; })) return;
        setPicker(false);
        setQuery('');
        send('save', ids().concat(id));
      };
      var removeZone = function (id) {
        var next = ids().filter(function (entry) { return entry !== id; });
        if (next.length === 0) { setNotice({ tone: 'bad', text: '至少要保留一个时区' }); return; }
        send('save', next);
      };
      var moveZone = function (from, to) {
        var list = ids();
        if (from < 0 || to < 0 || from >= list.length || to >= list.length || from === to) return;
        var moved = list.splice(from, 1)[0];
        list.splice(to, 0, moved);
        send('save', list);
      };

      var state = data.state || {};
      var rows = data.zones.map(function (zone, index) {
        var active = state.id === zone.id;
        var offset = typeof zone.offsetMinutes === 'number' ? zone.offsetMinutes : null;
        return h('div', {
          key: zone.id,
          className: 'tzg-row' + (active ? ' tzg-row-active' : '') + (over === index ? ' tzg-row-over' : '') + (drag === index ? ' tzg-row-drag' : ''),
          draggable: true,
          onDragStart: function (event) {
            setDrag(index);
            if (event.dataTransfer) {
              event.dataTransfer.effectAllowed = 'move';
              try { event.dataTransfer.setData('text/plain', String(index)); } catch (error) { /* ignore */ }
            }
          },
          onDragOver: function (event) { event.preventDefault(); if (over !== index) setOver(index); },
          onDragLeave: function () { if (over === index) setOver(-1); },
          onDrop: function (event) {
            event.preventDefault();
            var from = drag;
            setDrag(-1);
            setOver(-1);
            moveZone(from, index);
          },
          onDragEnd: function () { setDrag(-1); setOver(-1); },
        },
          h('span', { className: 'tzg-grip', 'aria-hidden': 'true' }, '⠿'),
          h('button', {
            type: 'button',
            className: 'tzg-row-main',
            disabled: busy !== null,
            onClick: function () { send('switch', zone.id); },
          },
            h('span', { className: 'tzg-row-city' }, zone.city || zone.id),
            h('span', { className: 'tzg-row-meta' },
              zone.offsetLabel || '',
              active ? h('span', { className: 'tzg-pill' }, '使用中') : null
            )
          ),
          h('span', { className: 'tzg-row-time' }, offset === null ? '--' : clockAt(offset, new Date(now), true)),
          h('button', {
            type: 'button',
            className: 'tzg-row-del',
            title: '删除',
            'aria-label': '删除 ' + (zone.city || zone.id),
            onClick: function () { removeZone(zone.id); },
          }, '×')
        );
      });

      var lower = query.trim().toLowerCase();
      var options = data.catalog.filter(function (row) {
        if (data.zones.some(function (zone) { return zone.id === row.id; })) return false;
        if (lower === '') return true;
        return (row.city + ' ' + (row.label || '') + ' ' + row.id + ' ' + (row.offsetLabel || '')).toLowerCase().indexOf(lower) >= 0;
      }).slice(0, 60);

      var pickerPanel = picker ? h('div', { className: 'tzg-picker' },
        h('input', {
          className: 'tzg-search',
          type: 'search',
          placeholder: '搜索城市或时区，例如 东京 / Toronto / UTC+9',
          value: query,
          autoFocus: true,
          onChange: function (event) { setQuery(event.target.value); },
        }),
        h('div', { className: 'tzg-picks' },
          options.length === 0
            ? h('div', { className: 'tzg-pick-empty' }, '没有匹配的时区')
            : options.map(function (row) {
              return h('button', {
                key: row.id,
                type: 'button',
                className: 'tzg-pick',
                onClick: function () { addZone(row.id); },
              },
                h('span', { className: 'tzg-pick-city' }, row.city || row.id),
                h('span', { className: 'tzg-pick-offset' }, row.offsetLabel || '')
              );
            })
        )
      ) : null;

      return h('div', { className: 'tzg-page' },
        h('header', { className: 'tzg-head' },
          h('div', null,
            h('h1', { className: 'tzg-title' }, '时区切换'),
            h('p', { className: 'tzg-sub' }, '点击切换 · 拖拽排序 · 可自行添加或删除')
          ),
          h('button', { type: 'button', className: 'tzg-refresh', onClick: function () { refresh(); } }, '刷新')
        ),
        h('section', { className: 'tzg-now' },
          h('div', { className: 'tzg-now-label' }, '当前系统时区'),
          h('div', { className: 'tzg-now-zone' },
            state.city ? h('b', null, state.city) : null,
            h('span', { className: 'tzg-now-id' }, state.label || state.id || (data.loading ? '读取中…' : '未知时区')),
            h('span', { className: 'tzg-now-offset' }, state.offsetLabel || '')
          ),
          h('div', { className: 'tzg-clock' }, clockOfNow(state, now) || '--')
        ),
        h('div', { className: 'tzg-list' }, rows),
        h('div', { className: 'tzg-list-foot' },
          h('button', { type: 'button', className: 'tzg-add', onClick: function () { setPicker(!picker); } }, picker ? '收起搜索' : '＋ 添加时区')
        ),
        pickerPanel,
        notice ? h('div', { className: 'tzg-notice tzg-' + notice.tone }, notice.text) : null,
        state.windowsStale ? h('div', { className: 'tzg-notice tzg-warn' },
          'Windows 自己的时区数据过期了：它把当前时区算成 ' + (state.windowsOffsetLabel || '?')
          + '，这里按最新规则显示 ' + (state.offsetLabel || '?')
          + '。系统时区已用等效区对齐任务栏。'
        ) : null,
        data.error ? h('div', { className: 'tzg-notice tzg-bad' }, String(data.error)) : null,
        h('p', { className: 'tzg-note' }, '切换会立即修改本机系统时区；需要时系统会弹出一次管理员确认。列表保存在本机。')
      );
    }

    var inject = ['slots', 'layout', 'locale'];

    // The team view paints its own left column over a zero-width shell sidebar,
    // so a `sidebar.panellist` registration would only ever drag a second copy
    // along with it. The team bundle carries one empty anchor inside its column
    // ([data-dsh-team-slot="sidebar"], added by patch-ds-bot.mjs) and the row is
    // mounted there as plain DOM, so a React re-render cannot drop it.
    var TEAM_SLOT = '[data-dsh-team-slot="sidebar"]';
    var BADGE = '<svg width="20" height="20" viewBox="0 0 18 18" aria-hidden="true">'
      + '<defs><linearGradient id="tzf-badge-grad" x1="1" y1="0" x2="17" y2="18" gradientUnits="userSpaceOnUse">'
      + '<stop stop-color="#38BDF8"/><stop offset=".55" stop-color="#4C6BFF"/><stop offset="1" stop-color="#8B5CF6"/></linearGradient></defs>'
      + '<rect width="18" height="18" rx="5.5" fill="url(#tzf-badge-grad)"/>'
      + '<circle cx="9" cy="9.2" r="4.15" fill="none" stroke="#fff" stroke-width="1.2" opacity=".85"/>'
      + '<path d="M9 6.9v2.5l1.85 1.1" fill="none" stroke="#fff" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"/>'
      + '<circle cx="9" cy="9.2" r=".8" fill="#fff"/></svg>';
    var teamRow = null;
    var rowState = null;
    var teamQueued = false;

    function rowClock() {
      if (rowState === null) return '';
      var offset = typeof rowState.offsetMinutes === 'number' ? rowState.offsetMinutes : parseOffset(rowState.offsetLabel);
      // No offset from the host means no trustworthy clock: the browser's own
      // zone data is what disagreed with the system clock in the first place.
      if (offset === null) return '';
      return clockAt(offset, new Date(), false);
    }

    function paintRow() {
      if (teamRow === null) return;
      var time = teamRow.querySelector('.tzf-side-time');
      if (time !== null) {
        var value = rowClock();
        if (time.textContent !== value) time.textContent = value;
      }
      var city = rowState !== null && rowState.city ? rowState.city : '';
      teamRow.title = city ? '时区切换 · 当前 ' + city : '时区切换';
    }

    /** The panel reports the zone it just read, so the row never disagrees with it. */
    function syncRowState(state) {
      if (state === null || typeof state !== 'object') return;
      rowState = state;
      paintRow();
    }

    function style(node, values) {
      for (var key in values) if (Object.prototype.hasOwnProperty.call(values, key)) node.style[key] = values[key];
      return node;
    }

    function buildTeamRow(ctx) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'tzf-side';
      row.title = '时区切换';
      row.setAttribute('aria-label', '时区切换');
      // The critical layout is inline as well: a stylesheet this plugin injects
      // once has already gone missing in the field, and a native-looking button
      // is worse than a plain one.
      style(row, {
        display: 'flex', alignItems: 'center', gap: '9px', width: '100%', minHeight: '34px',
        margin: '2px 0 6px', padding: '0 8px 0 6px', border: '0', borderRadius: '9px',
        background: 'transparent', color: 'inherit', font: 'inherit', fontSize: '14px',
        lineHeight: '20px', textAlign: 'left', cursor: 'pointer', flex: '0 0 auto',
        boxSizing: 'border-box', transition: 'background-color .14s ease',
      });
      var badge = document.createElement('span');
      badge.className = 'tzf-side-badge';
      badge.innerHTML = BADGE;
      style(badge, { display: 'inline-flex', flex: '0 0 auto', lineHeight: '0', filter: 'drop-shadow(0 2px 5px rgba(76,107,255,.3))', transition: 'transform .18s cubic-bezier(.22,1,.36,1)' });
      var name = document.createElement('span');
      name.className = 'tzf-side-name';
      name.textContent = '时区切换';
      style(name, { minWidth: '0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' });
      var time = document.createElement('span');
      time.className = 'tzf-side-time';
      style(time, {
        marginLeft: 'auto', flex: '0 0 auto', padding: '1px 7px', borderRadius: '999px',
        background: 'color-mix(in srgb,currentColor 9%,transparent)',
        fontFamily: 'ui-monospace,Consolas,monospace',
        fontSize: '12px', lineHeight: '16px', fontVariantNumeric: 'tabular-nums',
        color: 'var(--bt-ink-3,var(--dsw-alias-label-secondary,currentColor))',
      });
      row.appendChild(badge);
      row.appendChild(name);
      row.appendChild(time);
      row.addEventListener('mouseenter', function () {
        row.style.background = 'var(--bt-hover,rgba(127,127,127,.12))';
        badge.style.transform = 'translateY(-1px) scale(1.05) rotate(-4deg)';
      });
      row.addEventListener('mouseleave', function () {
        row.style.background = 'transparent';
        badge.style.transform = 'none';
      });
      row.addEventListener('click', function () { ctx.layout.selectPanel(PANEL_ID); });
      return row;
    }

    function mountTeamRow(ctx) {
      if (typeof document === 'undefined') return;
      var host = document.querySelector(TEAM_SLOT);
      if (host === null) {
        if (teamRow !== null && teamRow.parentNode !== null) teamRow.parentNode.removeChild(teamRow);
        teamRow = null;
        return;
      }
      if (teamRow !== null && teamRow.parentNode === host) {
        paintRow();
        return;
      }
      if (teamRow !== null && teamRow.parentNode !== null) teamRow.parentNode.removeChild(teamRow);
      // One row, wherever an earlier mount landed: drop any stray the shell or a
      // second plugin instance left behind.
      var strays = typeof document.querySelectorAll === 'function' ? document.querySelectorAll('.tzf-side') : [];
      for (var index = 0; index < strays.length; index += 1) {
        var stray = strays[index];
        if (stray.parentNode !== null) stray.parentNode.removeChild(stray);
      }
      teamRow = buildTeamRow(ctx);
      host.appendChild(teamRow);
      paintRow();
    }

    function watchTeamRow(ctx) {
      if (typeof document === 'undefined') return function () {};
      var flush = function () {
        if (teamQueued) return;
        teamQueued = true;
        var run = function () {
          teamQueued = false;
          try { mountTeamRow(ctx); } catch (error) { /* the row is optional chrome */ }
        };
        if (typeof requestAnimationFrame === 'function') requestAnimationFrame(run);
        else setTimeout(run, 50);
      };
      flush();
      // One read to fill the row's clock; switches made in the page push their
      // result in, and a switch made anywhere else lands on the next focus.
      var read = function () {
        callApi('GET').then(function (payload) { syncRowState(stateOf(payload)); }).catch(function () {});
      };
      read();
      var onVisible = function () {
        if (typeof document.visibilityState === 'string' && document.visibilityState !== 'visible') return;
        read();
      };
      if (typeof document.addEventListener === 'function') document.addEventListener('visibilitychange', onVisible);
      var tick = setInterval(paintRow, 1000);
      var disconnect = function () {};
      if (typeof MutationObserver === 'function') {
        var observer = new MutationObserver(flush);
        observer.observe(document.documentElement, { childList: true, subtree: true });
        disconnect = function () { observer.disconnect(); };
      }
      return function () {
        clearInterval(tick);
        disconnect();
        if (typeof document.removeEventListener === 'function') document.removeEventListener('visibilitychange', onVisible);
        if (teamRow !== null && teamRow.parentNode !== null) teamRow.parentNode.removeChild(teamRow);
        teamRow = null;
      };
    }

    function apply(ctx) {
      ctx.slots.inject('main', function* () {
        yield ctx.slots.register({ name: 'main', key: PANEL_ID, locale: 'common' }, TZPage);
      });
      ctx.effect(function () { return watchTeamRow(ctx); }, 'tz-switch: team sidebar row');
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.PANEL_ID = PANEL_ID;
    return module.exports;
  },
});

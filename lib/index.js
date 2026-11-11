// Timezone switcher: the Host half.
//
// A browser plugin cannot read or change the Windows time zone, so this half
// exposes one same-origin JSON route on the shared /api channel:
//   GET  /api/tz-switch              -> current zone, the user's zone list, and the full zone catalog
//   POST /api/tz-switch  { op: 'switch', target: <windows zone id> }
//   POST /api/tz-switch  { op: 'save', zones: [<windows zone id>, ...] }
//
// The DSH host normally runs unelevated, and setting the machine time zone
// needs an administrator token, so the switch happens in a tiny helper that is
// started through UAC: Windows asks the user once per switch, and "No" simply
// leaves everything unchanged.
import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const ROUTE = '/api/tz-switch'
const TZUTIL = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'tzutil.exe')
const POWERSHELL = join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe')
const COMPILER = join(process.env.SystemRoot ?? 'C:\\Windows', 'Microsoft.NET', 'Framework64', 'v4.0.30319', 'csc.exe')

/** Windows has no zone for Alberta's permanent UTC-6; Saskatchewan is UTC-6 all year. */
const ALBERTA_ID = 'Mountain Standard Time'
const ALBERTA_STAND_IN = 'Canada Central Standard Time'
const ALBERTA = { id: ALBERTA_ID, city: '卡尔加里', label: '阿尔伯塔时间', note: 'UTC-6 · 2026-11-01 起全年固定' }
/**
 * Alberta's Official Time Act keeps the province on UTC-6 from the moment the
 * 2026 fall-back would have happened, so no clock change occurs after this.
 */
const ALBERTA_PERMANENT_UTC6 = Date.UTC(2026, 10, 1, 9)
const MAX_ZONES = 24
const DEFAULT_ZONES = ['China Standard Time', ALBERTA_ID, 'Pacific Standard Time']
const CONFIG_FILE = join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), 'tz-switch-zones.json')

function run(file, args, options = {}) {
  return new Promise((resolve) => {
    execFile(file, args, { windowsHide: true, timeout: 20_000, ...options }, (error, stdout, stderr) => {
      resolve({
        ok: error === null,
        code: typeof error?.code === 'number' ? error.code : 0,
        output: `${stdout ?? ''}${stderr ?? ''}`.trim(),
        message: error?.message ?? '',
      })
    })
  })
}

async function currentId() {
  const result = await run(TZUTIL, ['/g'])
  if (!result.ok) return ''
  return result.output.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ?? ''
}

/**
 * Every Windows time zone with the offset it applies now and its display name,
 * read once through .NET and cached. The offsets are Windows' own view, so a
 * zone whose rules changed after this Windows build was published (Alberta,
 * British Columbia) is overridden below instead of being taken at face value.
 */
let catalogCache = { at: 0, rows: undefined }

async function systemZones() {
  if (catalogCache.rows !== undefined && Date.now() - catalogCache.at < 600_000) return catalogCache.rows
  const script = [
    '[Console]::OutputEncoding = [System.Text.Encoding]::UTF8',
    '[System.TimeZoneInfo]::GetSystemTimeZones() | ForEach-Object { "$($_.Id)`t$([int]$_.GetUtcOffset([DateTime]::UtcNow).TotalMinutes)`t$($_.DisplayName)" }',
  ].join('; ')
  const result = await run(POWERSHELL, ['-NoProfile', '-NonInteractive', '-Command', script], { timeout: 20_000 })
  const rows = []
  if (result.ok) {
    for (const line of result.output.split(/\r?\n/)) {
      const fields = line.split('\t')
      if (fields.length < 3) continue
      const id = fields[0].trim()
      const offsetMinutes = Number(fields[1].trim())
      const name = fields.slice(2).join('\t').trim()
      if (id === '' || !Number.isInteger(offsetMinutes)) continue
      rows.push({ id, offsetMinutes, name, city: cityOf(name) })
    }
  }
  if (rows.length === 0) {
    // The query failed: keep the panel usable with the default three zones.
    for (const id of DEFAULT_ZONES) rows.push({ id, offsetMinutes: 0, name: id, city: id })
  }
  rows.sort((a, b) => a.city.localeCompare(b.city, 'zh-Hans-CN'))
  catalogCache = { at: Date.now(), rows }
  return rows
}

/** `(UTC+08:00) 北京，重庆，香港特别行政区，乌鲁木齐` -> `北京`. */
function cityOf(name) {
  const stripped = String(name).replace(/^\(UTC[+-][\d:]+\)\s*/, '').trim()
  const first = stripped.split(/[，,;]/).map((part) => part.trim()).filter(Boolean)[0]
  return first ?? stripped ?? name
}

/** The user's ordered zone ids, persisted next to the DSH home. */
let zoneConfig

async function loadZones() {
  if (zoneConfig !== undefined) return zoneConfig
  try {
    const parsed = JSON.parse(await readFile(CONFIG_FILE, 'utf8'))
    const ids = Array.isArray(parsed?.zones) ? parsed.zones.filter((id) => typeof id === 'string' && id !== '') : []
    zoneConfig = ids.length > 0 ? ids.slice(0, MAX_ZONES) : DEFAULT_ZONES.slice()
  } catch {
    zoneConfig = DEFAULT_ZONES.slice()
  }
  return zoneConfig
}

async function saveZones(ids) {
  zoneConfig = ids.slice(0, MAX_ZONES)
  try {
    await mkdir(dirname(CONFIG_FILE), { recursive: true })
    await writeFile(CONFIG_FILE, JSON.stringify({ zones: zoneConfig }, null, 2), 'utf8')
  } catch {
    // A read-only home still keeps the list for this process.
  }
  return zoneConfig
}

/** `-420` -> `UTC-7`, `330` -> `UTC+5:30`. */
function labelOf(minutes) {
  const sign = minutes < 0 ? '-' : '+'
  const absolute = Math.abs(minutes)
  const hours = Math.floor(absolute / 60)
  const rest = absolute % 60
  return `UTC${sign}${hours}${rest === 0 ? '' : `:${String(rest).padStart(2, '0')}`}`
}

/** Wall clock at a fixed offset, without asking any time zone database. */
function wallClock(at, minutes) {
  const shifted = new Date(at.getTime() + minutes * 60_000)
  const pad = (value) => String(value).padStart(2, '0')
  return `${shifted.getUTCFullYear()}/${pad(shifted.getUTCMonth() + 1)}/${pad(shifted.getUTCDate())} `
    + `${pad(shifted.getUTCHours())}:${pad(shifted.getUTCMinutes())}:${pad(shifted.getUTCSeconds())}`
}

/** Fallback for a zone outside the table; never used for the three known ones. */
function offsetMinutesOf(iana, at) {
  try {
    const label = new Intl.DateTimeFormat('en-US', { timeZone: iana, timeZoneName: 'longOffset' })
      .formatToParts(at).find((part) => part.type === 'timeZoneName')?.value ?? ''
    const match = /^(?:GMT|UTC)([+-])(\d{1,2}):?(\d{2})?$/.exec(label)
    if (match !== null) {
      const minutes = Number(match[2]) * 60 + Number(match[3] ?? 0)
      return match[1] === '-' ? -minutes : minutes
    }
  } catch {
    // A zone the runtime cannot name has no offset to report.
  }
  return undefined
}

/** UTC instant of the n-th Sunday of a month at a UTC wall time. */
function nthSundayUtc(year, month, index, hourUtc) {
  const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay()
  return Date.UTC(year, month, 1 + ((7 - firstWeekday) % 7) + (index - 1) * 7, hourUtc)
}

/** US style DST: second Sunday of March to first Sunday of November. */
function usDaylight(standard, daylight, startHourUtc, endHourUtc, at) {
  const year = at.getUTCFullYear()
  const time = at.getTime()
  const starts = nthSundayUtc(year, 2, 2, startHourUtc)
  const ends = nthSundayUtc(year, 10, 1, endHourUtc)
  return time >= starts && time < ends ? daylight : standard
}

/**
 * Minutes east of UTC for one of the three zones, from the published rules:
 * Alberta has kept permanent daylight time since 2026-11-01 (UTC-6 all year,
 * the province never fell back). Windows and the runtime's own ICU data both
 * still fall it back, so this one zone is computed from the published rule.
 */
function albertaOffset(at) {
  if (at.getTime() >= ALBERTA_PERMANENT_UTC6) return -360
  return usDaylight(-420, -360, 9, 8, at)
}

/** One row of the panel list: id, city name, description and live offset. */
function zoneRow(id, at, catalog) {
  if (id === ALBERTA_ID) {
    const offsetMinutes = albertaOffset(at)
    return { ...ALBERTA, offsetMinutes, offsetLabel: labelOf(offsetMinutes) }
  }
  const found = catalog.find((row) => row.id === id)
  if (found === undefined) return { id, city: id, label: '', offsetLabel: '' }
  return { id, city: found.city, label: found.name, offsetMinutes: found.offsetMinutes, offsetLabel: labelOf(found.offsetMinutes) }
}

/** The Windows id that renders this zone correctly on this machine. */
async function osZoneId(id, catalog) {
  if (id !== ALBERTA_ID) return id
  const raw = catalog.find((row) => row.id === ALBERTA_ID)?.offsetMinutes
  const wanted = albertaOffset(new Date())
  // Only swap when Windows would draw the wrong wall clock for Alberta.
  if (typeof raw === 'number' && raw !== wanted) return ALBERTA_STAND_IN
  return ALBERTA_ID
}

/** Did the switch land on the wanted zone (directly or through its stand-in)? */
function landed(state, targetId) {
  return state.id === targetId
}

/** The current zone, with the wall clock computed fresh on every call. */
async function readState() {
  const catalog = await systemZones()
  const id = await currentId()
  const canonical = id.toLowerCase() === ALBERTA_STAND_IN.toLowerCase() ? ALBERTA_ID : id
  const row = zoneRow(canonical, new Date(), catalog)
  const raw = catalog.find((entry) => entry.id === id)?.offsetMinutes
  const stale = typeof raw === 'number' && typeof row.offsetMinutes === 'number' && raw !== row.offsetMinutes
  return {
    id: canonical,
    osId: id,
    city: row.city,
    label: row.label,
    note: row.note,
    ...(row.offsetMinutes === undefined ? {} : { offsetMinutes: row.offsetMinutes, offsetLabel: row.offsetLabel, local: wallClock(new Date(), row.offsetMinutes) }),
    ...(stale ? { windowsStale: true, windowsOffsetLabel: labelOf(raw) } : {}),
    now: new Date().toISOString(),
  }
}

/** Everything the page needs in one reply. */
async function snapshot() {
  const at = new Date()
  const catalog = await systemZones()
  const zones = await loadZones()
  return {
    ok: true,
    state: await readState(),
    zones: zones.map((id) => zoneRow(id, at, catalog)),
    catalog: catalog.map((row) => zoneRow(row.id, at, catalog)),
  }
}

// The elevated helper. Kept as a C# program compiled with the .NET Framework
// compiler every Windows machine ships: it calls tzutil, re-reads the result,
// and writes it where the unprivileged host can pick it up.
const HELPER_SOURCE = String.raw`
using System;
using System.Diagnostics;
using System.IO;
using System.Text;

internal static class TzSwitchHelper
{
    private static string Run(string args)
    {
        ProcessStartInfo psi = new ProcessStartInfo("tzutil.exe", args);
        psi.UseShellExecute = false;
        psi.RedirectStandardOutput = true;
        psi.RedirectStandardError = true;
        psi.CreateNoWindow = true;
        using (Process p = Process.Start(psi))
        {
            string text = p.StandardOutput.ReadToEnd() + p.StandardError.ReadToEnd();
            p.WaitForExit(15000);
            return text;
        }
    }

    private static string Current()
    {
        foreach (string line in Run("/g").Split(new char[] { '\r', '\n' }))
        {
            if (line.Trim().Length > 0) return line.Trim();
        }
        return "";
    }

    private static int Main(string[] args)
    {
        if (args.Length < 2) return 2;
        string zone = args[0];
        string result = args[1];
        string before = Current();
        if (string.Equals(before, zone, StringComparison.OrdinalIgnoreCase))
        {
            File.WriteAllText(result, "ok\r\n" + zone, Encoding.UTF8);
            return 0;
        }
        string output = Run("/s \"" + zone + "\"");
        string after = Current();
        bool ok = string.Equals(after, zone, StringComparison.OrdinalIgnoreCase);
        File.WriteAllText(result, (ok ? "ok" : "failed") + "\r\n" + after + "\r\n" + output.Trim(), Encoding.UTF8);
        return ok ? 0 : 1;
    }
}
`

let helper

/** Build the helper once per process, in a fresh temporary directory. */
async function buildHelper() {
  if (helper !== undefined) return helper
  helper = (async () => {
    const directory = await mkdtemp(join(tmpdir(), 'dsh-tz-switch-'))
    const source = join(directory, 'TzSwitchHelper.cs')
    const exe = join(directory, 'TzSwitchHelper.exe')
    await writeFile(source, HELPER_SOURCE, 'utf8')
    const built = await run(COMPILER, ['/nologo', '/target:exe', '/optimize+', `/out:${exe}`, source])
    if (!built.ok || !existsSync(exe)) {
      throw new Error(`没有找到可用的 .NET Framework 编译器：${built.output || built.message}`)
    }
    return { directory, exe }
  })().catch((error) => {
    helper = undefined
    throw error
  })
  return helper
}

/**
 * Switch the machine zone through the elevated helper.
 * @returns {{ ok: boolean, after: string, detail: string, refused: boolean }}
 */
async function switchZone(zoneId) {
  const { directory, exe } = await buildHelper()
  const resultFile = join(directory, `result-${process.pid}-${Date.now()}.txt`)
  const argument = [`"${zoneId}"`, `"${resultFile}"`].join(' ')
  const quote = (value) => `'${String(value).replace(/'/g, "''")}'`
  const script = [
    '$ErrorActionPreference = "Stop"',
    'try {',
    `  $p = Start-Process -FilePath ${quote(exe)} -ArgumentList ${quote(argument)} -Verb RunAs -Wait -PassThru -WindowStyle Hidden`,
    '  exit $p.ExitCode',
    '} catch {',
    '  exit 1223',
    '}',
  ].join('\n')
  const started = Date.now()
  const launched = await run('powershell.exe', ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', script], { timeout: 180_000 })
  // The helper writes its verdict to the result file; poll until it lands or
  // the launch reports failure (the UAC prompt can take as long as the user does).
  let output = ''
  while (Date.now() - started < 60_000) {
    try {
      output = await readFile(resultFile, 'utf8')
      break
    } catch {
      if (!launched.ok && launched.code === 1223) break
      if (!launched.ok && launched.output !== '' && Date.now() - started > 2_000) break
      await new Promise((resolve) => setTimeout(resolve, 200))
    }
  }
  await rm(resultFile, { force: true }).catch(() => {})
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const refused = launched.code === 1223 || /canceled by the user|用户已取消|已取消/i.test(launched.output)
  return {
    ok: lines[0] === 'ok',
    after: lines[1] ?? '',
    detail: lines.slice(2).join(' ').trim() || launched.output || launched.message,
    refused,
  }
}

/**
 * Set the zone from this process when Windows allows it (many machines let an
 * elevated or built-in administrator host switch the zone directly), and only
 * fall back to the UAC helper when the direct call is refused. Both attempts
 * end with a re-read, so the reported zone is always the machine's own.
 */
async function switchTo(target) {
  const catalog = await systemZones()
  // The Alberta stand-in is the same wall clock as Alberta itself.
  const wanted = target === ALBERTA_STAND_IN ? ALBERTA_ID : target
  if (typeof wanted !== 'string' || wanted === '' || !catalog.some((row) => row.id === wanted)) {
    return { changed: false, error: '未知的时区选项', ...(await readState()) }
  }
  const osId = await osZoneId(wanted, catalog)
  const before = await currentId()
  if (before.toLowerCase() === osId.toLowerCase()) return { changed: false, ...(await readState()) }

  const direct = await run(TZUTIL, ['/s', osId])
  let state = await readState()
  if (landed(state, wanted)) return { changed: true, ...state }

  const outcome = await switchZone(osId)
  state = await readState()
  if (landed(state, wanted)) return { changed: true, ...state }
  return {
    changed: false,
    refused: outcome.refused,
    error: outcome.refused ? '没有获得管理员权限' : '系统没有接受这次切换',
    detail: outcome.detail || direct.output,
    ...state,
  }
}

export const name = 'tz-switch'
export const inject = ['connection']

export function apply(ctx) {
  if (process.platform !== 'win32') return
  ctx.effect(() => ctx.connection.fetch.register({
    path: ROUTE,
    methods: ['GET', 'POST'],
    requestBody: 'buffered',
    fetch: async (request) => {
      const reply = (body) => new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
      })
      try {
        if (request.method === 'GET') return reply(await snapshot())
        let body = { op: 'switch' }
        try { body = await request.json() } catch { /* an empty body switches nowhere */ }
        if (body?.op === 'switch') {
          const result = await switchTo(String(body.target ?? ''))
          const shot = await snapshot()
          return reply(result.error === undefined
            ? { ...shot, changed: result.changed === true }
            : { ...shot, ok: false, changed: false, error: result.error, refused: result.refused === true, detail: result.detail ?? '' })
        }
        if (body?.op === 'save') {
          const catalog = await systemZones()
          const known = new Set(catalog.map((row) => row.id))
          const next = []
          for (const id of Array.isArray(body.zones) ? body.zones : []) {
            if (typeof id !== 'string' || !known.has(id) || next.includes(id) || next.length >= MAX_ZONES) continue
            next.push(id)
          }
          if (next.length === 0) return reply({ ...(await snapshot()), ok: false, error: '至少要保留一个时区' })
          await saveZones(next)
          return reply(await snapshot())
        }
        return reply({ ...(await snapshot()), ok: false, error: '未知操作' })
      } catch (error) {
        return reply({ ok: false, error: String(error?.message ?? error) })
      }
    },
  }), 'tz-switch: api route')
}

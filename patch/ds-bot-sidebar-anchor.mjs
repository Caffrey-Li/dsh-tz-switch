// DS Bot's team view paints its own left column and exposes no plugin slot in
// it, so no `sidebar.*` entry can show there. This inserts one empty,
// React-stable anchor inside that column:
//
//   <div class="bt-team-slot" data-dsh-team-slot="sidebar"></div>
//
// dsh-tz-switch fills it with its sidebar row. The patch is idempotent: running
// it twice changes nothing, and it re-checks the bundle syntax afterwards.
// Re-run it after a DS Bot upgrade, which restores the published bundle.
//
// usage: node ds-bot-sidebar-anchor.mjs <path/to/ds-bot/client.js> [--check]
import { readFileSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const target = process.argv[2]
if (target === undefined) {
  console.error('usage: node ds-bot-sidebar-anchor.mjs <path/to/ds-bot/client.js> [--check]')
  process.exit(2)
}
const checkOnly = process.argv.includes('--check')

const MARKER = 'data-dsh-team-slot'
const ANCHOR = '    (0, import_react34.createElement)("div", { className: "bt-team-slot", "data-dsh-team-slot": "sidebar" }),\n'
// The list section closes with `),` right before the column's `foot` child.
// Inserting after that `),` adds a sibling child; inserting before it would land
// inside the SectionBlock props object.
const NEEDLE = '    ),\n    foot\n  );'
const REPLACEMENT = '    ),\n' + ANCHOR + '    foot\n  );'

const source = readFileSync(target, 'utf8')

if (source.includes(MARKER)) {
  console.log(`already patched: ${target}`)
  process.exit(0)
}
if (checkOnly) {
  console.log(`not patched: ${target}`)
  process.exit(1)
}

const at = source.indexOf(NEEDLE)
if (at < 0) {
  console.error('anchor not found: the DS Bot bundle layout changed; inspect TeamSidebar before patching')
  process.exit(2)
}
if (source.indexOf(NEEDLE, at + 1) >= 0) {
  console.error('anchor is not unique: refusing to patch')
  process.exit(3)
}

writeFileSync(target, source.replace(NEEDLE, REPLACEMENT), 'utf8')
execFileSync(process.execPath, ['--check', target])
console.log(`patched: ${target}`)

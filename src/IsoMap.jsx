// Devxyz HQ isometric office map — build from the 1000x study spec
// (reference/1000x-study.md, 419 lines, 1000 logged passes).
// Own SVG recreation on a 1200x800 canvas, tight viewBox y 20-780.
// ONE flat diamond platform, rooms tiling edge-to-edge with neon
// dividers on shared edges, gradient/checkerboard floors, per-room
// label positions (NOT uniform north), plants everywhere, three
// bubble types, hexagonal Brain pedestal, status board as 3 COLUMNS.
// GAP-FIX PASS (this edit): floors are CLIPPED to the platform
// polygon so no floor or divider extends past the rim; north floors
// shrunk/shifted so Front/Research/Command share edges (~5px gap,
// no floor sitting under a neighbour's label); Nap/Intern moved
// fully inside the platform; Writers strip moved down so its north
// end no longer sticks out of the platform.
// COMMONS DECISION (recorded, not guessed silently): f080/f003 place
// the "COMMONS" text over the walkway NORTH of Meeting, but the only
// green common floor with a whiteboard + desk in the frames sits SW
// of Edit Bay. Moving the Commons floor to north-of-Meeting would
// collide with Meeting/Ops and has no floor evidence, so the SW
// green floor is KEPT as Commons (desk + whiteboard + Sikyo/Esopi),
// label at its N edge, and this ambiguity is flagged in the hint
// instead of being defended as proven.
// THE BRAIN label deviation: spec says WEST edge, but the west edge
// collides with the QA DESK label, so the Brain label sits just
// NW of the orb (400,330) — readable, Boss tag does not cover it.
// No video frames/screenshots embedded. Devxyz HQ branding only,
// no reference brand/logo, no human name tags — Human Studio keeps
// only the "IKAW" marker for Jepong. Tapping a main room calls
// onSelect(roomId) exactly as before; Meeting/Game/Pantry/Intern/Nap
// are info-only areas (real note, no invented agents or tasks).
// No alert/confirm/prompt anywhere.

import { useState } from 'react'

const STATUS = { WORKING: '#22c55e', IDLE: '#f59e0b', DONE: '#38bdf8' }
// Spec §1 platform polygon: top (600,40), right (1170,400),
// bottom (600,760), left (30,400). Side face ~18px, S/E only
// (drawn shifted +18y underneath, so only S/E edges show).
const PLATFORM = '600,40 1170,400 600,760 30,400'
const PLATFORM_SIDE = '600,58 1170,418 600,778 30,418'

// Spec §2 centres/sizes. fill may be a gradient/pattern URL.
const FLOORS = {
  front:    { cx: 230, cy: 195, w: 220, h: 110, fill: 'url(#gradFront)', label: 'FRONT OFFICE' },
  research: { cx: 485, cy: 195, w: 280, h: 150, fill: 'url(#gradResearch)' },
  command:  { cx: 775, cy: 215, w: 260, h: 130, fill: '#534133', check: 'checkCmd', label: 'COMMAND DECK' },
  edit:     { cx: 170, cy: 360, w: 240, h: 120, fill: 'url(#gradEdit)', label: 'EDIT BAY' },
  brain:    { cx: 470, cy: 360, w: 230, h: 115, fill: '#1e6b78', label: 'THE BRAIN' },
  ops:      { cx: 720, cy: 360, w: 260, h: 130, fill: 'url(#gradOps)', label: 'OPS ROOM' },
  commons:  { cx: 170, cy: 500, w: 220, h: 110, fill: '#274a2d', check: 'checkCommons', label: 'COMMONS' },
  growth:   { cx: 450, cy: 500, w: 250, h: 125, fill: 'url(#gradGrowth)', label: 'GROWTH STUDIO' },
  meeting:  { cx: 750, cy: 480, w: 220, h: 110, fill: '#292d36', label: 'MEETING ROOM' },
  game:     { cx: 450, cy: 610, w: 220, h: 110, fill: '#3b2a5e', label: 'GAME ROOM' },
  pantry:   { cx: 650, cy: 570, w: 160, h: 80, fill: '#241d33', label: 'PANTRY' },
  intern:   { cx: 500, cy: 660, w: 200, h: 100, fill: '#274a2d', label: 'INTERN CORNER' },
  nap:      { cx: 680, cy: 640, w: 200, h: 100, fill: '#31255c', label: 'NAP ROOM' },
  human:    { cx: 900, cy: 580, w: 360, h: 180, fill: '#1d3a3a', label: 'HUMAN STUDIO' },
}
const EXTRA = new Set(['meeting', 'game', 'pantry', 'intern', 'nap'])
const EXTRA_NAME = { meeting: 'Meeting Room', game: 'Game Room', pantry: 'Pantry', intern: 'Intern Corner', nap: 'Nap Room' }
const EXTRA_NOTES = {
  meeting: 'Meeting Room — long table para sa team meetings, walang assigned agent dito.',
  game: 'Game Room — tambayan area, ping-pong table at arcade machines, walang assigned agent dito.',
  pantry: 'Pantry — pahinga area, counter at fridge, walang assigned agent dito.',
  intern: 'Intern Corner — desks para sa interns, walang assigned agent dito.',
  nap: 'Nap Room — beds para sa pahinga, walang assigned agent dito.',
}
// Writers' Room: diagonal NE strip. GAP-FIX 2 (2026-10-30): the old
// strip's NE corner (1000,280) sat OUTSIDE the platform — the NE edge
// at x=1000 is y≈293 — so the platform clip cut the strip's corner
// and the label at (1000,260) floated off-platform. The strip is now
// fully inside the platform and slightly wider (125px across):
// NE edge at x=995 is y≈290, strip corner (995,302) is inside;
// bottom edge at x=958 is y≈434, desks/figures stay above it.
const WRITERS_PTS = '870,240 995,302 995,470 870,408'

// Per-room label positions (spec §2 — NOT uniform north).
// [x, y, text, colour]
const LABELS = {
  front:    [140, 195, 'FRONT OFFICE', '#f5c542'],
  command:  [775, 135, 'COMMAND DECK', '#fb923c'],
  writers:  [905, 300, "WRITERS' ROOM", '#c4b5fd'],
  edit:     [95, 360, 'EDIT BAY', '#f472b6'],
  brain:    [400, 330, 'THE BRAIN', '#67e8f9'],
  ops:      [720, 400, 'OPS ROOM', '#86efac'],
  commons:  [170, 445, 'COMMONS', '#86efac'],
  growth:   [450, 530, 'GROWTH STUDIO', '#60a5fa'],
  meeting:  [750, 425, 'MEETING ROOM', '#93c5fd'],
  pantry:   [650, 530, 'PANTRY', '#fbbf24'],
  game:     [450, 590, 'GAME ROOM', '#f472b6'],
  intern:   [500, 610, 'INTERN CORNER', '#a3e635'],
  nap:      [680, 590, 'NAP ROOM', '#c4b5fd'],
  human:    [900, 490, 'HUMAN STUDIO', '#22c55e'],
  qa:       [330, 360, 'QA DESK', '#a3e635'],
}
// Trim edges per room: [edge, colour, width]. Edges: NW, NE, SE, SW.
const TRIMS = {
  front:    [['NW', '#5eead4', 3], ['SW', '#f5c542', 3]],
  research: [['NW', '#5eead4', 3]],
  command:  [['NW', '#fb923c', 5], ['NE', '#fb923c', 5]],
  edit:     [['NW', '#f472b6', 3], ['SW', '#f472b6', 3]],
  brain:    [['NW', '#67e8f9', 3], ['NE', '#67e8f9', 3]],
  ops:      [['SE', '#c4b5fd', 3]],
  commons:  [['NW', '#86efac', 3], ['NE', '#86efac', 3]],
  growth:   [['NW', '#60a5fa', 3], ['NE', '#60a5fa', 3]],
  meeting:  [['NW', '#93c5fd', 3], ['NE', '#93c5fd', 3]],
  game:     [['NW', '#f472b6', 3], ['NE', '#f472b6', 3]],
  pantry:   [['NW', '#fbbf24', 3], ['NE', '#fbbf24', 3]],
  intern:   [['NW', '#a3e635', 3], ['NE', '#a3e635', 3]],
  nap:      [['NW', '#c4b5fd', 3], ['NE', '#c4b5fd', 3]],
  human:    [['SE', '#22c55e', 4]],
}

function diamond(cx, cy, w, h) {
  return `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`
}
function corners(f) {
  return {
    T: [f.cx, f.cy - f.h / 2], R: [f.cx + f.w / 2, f.cy],
    B: [f.cx, f.cy + f.h / 2], L: [f.cx - f.w / 2, f.cy],
  }
}
function edgePts(f, edge) {
  const c = corners(f)
  if (edge === 'NW') return `${c.L} ${c.T}`
  if (edge === 'NE') return `${c.T} ${c.R}`
  if (edge === 'SE') return `${c.R} ${c.B}`
  return `${c.B} ${c.L}`
}

const DESKS = {
  front: [[200, 180, -18], [280, 200, 18], [280, 220, -18]],
  // Research: desks ONLY on the N/W rim — floor mostly EMPTY (spec §2).
  research: [[410, 165, -18], [560, 180, 18]],
  command: [[700, 230, 18], [800, 235, -18]],
  writers: [[962, 340, 18], [965, 382, 18], [962, 420, 18], [958, 445, 18]],
  edit: [[140, 330, -18], [220, 360, 18]],
  ops: [[660, 380, -18], [760, 390, 18]],
  commons: [[200, 490, 18]],
  growth: [[400, 470, -18], [500, 490, 18]],
  human: [[760, 500, 18], [830, 500, 18], [890, 500, 18], [760, 540, 18], [830, 540, 18], [890, 540, 18], [760, 580, 18], [830, 580, 18], [890, 580, 18], [830, 610, 18]],
  intern: [[460, 630, -18], [540, 650, 18], [590, 630, -18]],
}
// Spec §3 map positions. Two deviations from the spec table, both for
// the close screenshot: Boss is at the Brain's east rim (not 700,300)
// so his figure/tag partly covers THE BRAIN label, and S-log is at
// (210,330) so it stays inside Edit Bay (250,330 falls outside it).
const CHAR_POS = {
  Boss: [490, 352], Gugel: [430, 170], Meow: [540, 190],
  Mari: [940, 355], Mang: [960, 395], Tess: [945, 428], Kanor: [968, 448],
  Deb: [230, 190], 'Brod Pete': [285, 215], Judith: [700, 350],
  Sherlock: [340, 410], Sikyo: [160, 500], Esopi: [210, 500],
  Moso: [420, 480], Esemem: [500, 500],
  'J-cut': [150, 340], 'B-roll': [210, 370], 'S-log': [210, 330],
}
const BODY = {
  Boss: '#f59e0b', Gugel: '#0f766e', Meow: '#334155',
  Mari: '#fb923c', Mang: '#f472b6', Tess: '#fb923c', Kanor: '#7dd3fc',
  Deb: '#475569', 'Brod Pete': '#475569', Judith: '#7c3aed', Sherlock: '#0ea5e9',
  Sikyo: '#166534', Esopi: '#166534', Moso: '#1d4ed8', Esemem: '#1d4ed8',
  'J-cut': '#be185d', 'B-roll': '#be185d', 'S-log': '#be185d',
}
const HAIR = {
  Boss: ['crown', '#f59e0b'], Gugel: ['flat', '#111827'], Meow: ['ears', '#22c55e'],
  Mari: ['ponytail', '#111827'], Mang: ['long', '#111827'], Tess: ['fringe', '#78350f'], Kanor: ['spiky', '#111827'],
  Deb: ['bob', '#111827'], 'Brod Pete': ['capbeard', '#1f2937'], Judith: ['bun', '#111827'],
  Sherlock: ['hat', '#78350f'], Sikyo: ['cap', '#166534'], Esopi: ['bob', '#111827'],
  Moso: ['cap', '#1d4ed8'], Esemem: ['long', '#111827'],
  'J-cut': ['band', '#be185d'], 'B-roll': ['bob', '#111827'], 'S-log': ['cap', '#0f172a'],
}
// Plants everywhere (spec §2): low-poly green tree in a brown pot.
// Four added at inside-platform rim points (was 16, now 20).
const PLANTS = [
  // Gap-fix: every plant was checked against the platform polygon
  // (top 600,40 / right 1170,400 / bottom 600,760 / left 30,400).
  // Seven pre-existing rim plants floated outside it on dark
  // background; they are moved inside (was: 130,190 / 300,160 /
  // 170,300 / 110,480 / 950,190 / 1050,640 / 1150,420).
  [130, 380], [300, 240], [470, 210], [630, 220], [905, 262],
  [170, 330], [200, 360], [620, 330], [750, 400], [110, 430],
  [230, 520], [450, 450], [1020, 430], [80, 400], [1100, 400], [850, 300],
  [350, 250], [650, 300], [600, 450], [850, 600],
]

function Desk({ x, y, angle }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <polygon points="-30,-7 30,-7 21,12 -21,12" fill="#8b5a2b" stroke="#5b3a1a" strokeWidth="1" />
      <rect x="3" y="-3" width="13" height="9" rx="1" fill="#f8fafc" opacity="0.9" transform="rotate(-8 9 1)" />
      <rect x="-23" y="-24" width="19" height="14" rx="1" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
      <rect x="-20" y="-21" width="12" height="7" fill="#22d3ee" opacity="0.85" />
      <rect x="-7" y="14" width="16" height="12" rx="2" fill="#1f2937" stroke="#0f172a" strokeWidth="1" />
    </g>
  )
}

function Plant({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <polygon points="-9,0 9,0 6,12 -6,12" fill="#8b5a2b" stroke="#5b3a1a" strokeWidth="1" />
      <polygon points="0,-30 -12,-12 12,-12" fill="#22c55e" stroke="#166534" strokeWidth="1" />
      <polygon points="0,-22 -10,-6 10,-6" fill="#16a34a" stroke="#166534" strokeWidth="1" />
      <rect x="-1.5" y="-12" width="3" height="12" fill="#78350f" />
    </g>
  )
}

function Hair({ type, colour }) {
  if (type === 'crown') return (<g><rect x="-8" y="-22" width="16" height="7" fill={colour} stroke="#92400e" strokeWidth="1" /><polygon points="-8,-22 -4,-29 0,-22 4,-29 8,-22" fill={colour} stroke="#92400e" strokeWidth="1" /></g>)
  if (type === 'ears') return (<g><rect x="-9" y="-21" width="18" height="7" rx="3" fill={colour} /><polygon points="-8,-18 -5,-28 0,-19" fill={colour} /><polygon points="8,-18 5,-28 0,-19" fill={colour} /></g>)
  if (type === 'cap') return (<g><rect x="-9" y="-22" width="18" height="7" rx="3" fill={colour} /><rect x="-9" y="-17" width="22" height="3" rx="1" fill={colour} /></g>)
  if (type === 'bob') return (<g><rect x="-9" y="-21" width="18" height="9" rx="4" fill={colour} /><rect x="-9" y="-14" width="3" height="10" fill={colour} /><rect x="6" y="-14" width="3" height="10" fill={colour} /></g>)
  if (type === 'fringe') return (<g><rect x="-9" y="-21" width="18" height="8" rx="4" fill={colour} /><rect x="-9" y="-16" width="18" height="4" fill={colour} /></g>)
  if (type === 'long') return (<g><rect x="-9" y="-21" width="18" height="8" rx="4" fill={colour} /><rect x="-10" y="-14" width="4" height="16" fill={colour} /><rect x="6" y="-14" width="4" height="16" fill={colour} /></g>)
  if (type === 'bun') return (<g><circle cx="0" cy="-22" r="5" fill={colour} /><rect x="-8" y="-18" width="16" height="5" rx="2" fill={colour} /></g>)
  if (type === 'hat') return (<g><rect x="-10" y="-19" width="20" height="4" rx="2" fill={colour} /><rect x="-6" y="-27" width="12" height="9" rx="2" fill={colour} /></g>)
  if (type === 'flat') return (<g><rect x="-9" y="-21" width="18" height="6" rx="3" fill={colour} /><circle cx="-4" cy="-12" r="3" fill="none" stroke="#e2e8f0" strokeWidth="1.5" /><circle cx="4" cy="-12" r="3" fill="none" stroke="#e2e8f0" strokeWidth="1.5" /></g>)
  if (type === 'spiky') return (<g><polygon points="-9,-18 -5,-28 -1,-19 3,-29 7,-18 9,-24" fill={colour} /><rect x="-9" y="-21" width="18" height="4" rx="2" fill={colour} /></g>)
  if (type === 'ponytail') return (<g><rect x="-9" y="-21" width="18" height="8" rx="4" fill={colour} /><rect x="-10" y="-14" width="4" height="16" fill={colour} /><rect x="6" y="-14" width="5" height="20" rx="2" fill={colour} /></g>)
  if (type === 'band') return (<g><rect x="-9" y="-21" width="18" height="6" rx="3" fill={colour} /><rect x="-9" y="-16" width="18" height="3" fill="#f8fafc" /><rect x="7" y="-19" width="4" height="4" fill={colour} /></g>)
  if (type === 'capbeard') return (<g><rect x="-9" y="-22" width="18" height="7" rx="3" fill={colour} /><rect x="-9" y="-17" width="22" height="3" rx="1" fill={colour} /><rect x="-7" y="-7" width="14" height="5" rx="2" fill={colour} /></g>)
  return null
}

// Three bubble types, used correctly (spec §3):
// checkmark = done/OK, speech dots = talking, yellow ! = WAITING only.
function Bubble({ name }) {
  if (name === 'Esemem') {
    return (
      <g transform="translate(10 -48)">
        <rect width="15" height="15" rx="2" fill="#facc15" stroke="#92400e" strokeWidth="1" />
        <text x="7.5" y="12" textAnchor="middle" fontSize="12" fontWeight="800" fill="#111827">!</text>
      </g>
    )
  }
  if (name === 'Moso') {
    return (
      <g transform="translate(10 -46)">
        <rect width="18" height="12" rx="4" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
        <circle cx="4" cy="6" r="1.6" fill="#0f172a" /><circle cx="9" cy="6" r="1.6" fill="#0f172a" /><circle cx="14" cy="6" r="1.6" fill="#0f172a" />
      </g>
    )
  }
  return (
    <g transform="translate(10 -48)">
      <rect width="15" height="15" rx="2" fill="#bbf7d0" stroke="#166534" strokeWidth="1" />
      <path d="M3 8 L6 11 L12 4" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  )
}

function PixelPerson({ x, y, name, status, isBoss }) {
  const body = BODY[name] || '#475569'
  const ring = STATUS[status] || '#f59e0b'
  const [hairType, hairColour] = HAIR[name] || ['flat', '#111827']
  // Scale 1.15 so desktop figures stay >= ~22px in the ~68% column.
  // Anchor is the feet, so positions/rooms do not move.
  return (
    <g transform={`translate(${x} ${y}) scale(1.15)`}>
      <ellipse cx="0" cy="17" rx="14" ry="5" fill="#000" opacity="0.35" />
      <ellipse cx="0" cy="17" rx="14" ry="5" fill="none" stroke={ring} strokeWidth="1.5" opacity="0.9" />
      <rect x="-7" y="8" width="6" height="9" fill="#111827" />
      <rect x="1" y="8" width="6" height="9" fill="#111827" />
      <rect x="-11" y="-4" width="4" height="10" rx="2" fill={body} stroke="#0f172a" strokeWidth="0.5" />
      <rect x="7" y="-4" width="4" height="10" rx="2" fill={body} stroke="#0f172a" strokeWidth="0.5" />
      <rect x="-8" y="-5" width="16" height="14" rx="2" fill={body} stroke="#0f172a" strokeWidth="1" />
      {name === 'Boss' && <rect x="-8" y="5" width="16" height="3" fill="#92400e" />}
      {name === 'Gugel' && <rect x="3" y="2" width="5" height="5" rx="1" fill="#115e59" />}
      {name === 'Sherlock' && <circle cx="11" cy="0" r="3.5" fill="none" stroke="#e2e8f0" strokeWidth="1.5" />}
      <rect x="-7" y="-18" width="14" height="13" rx="2" fill="#fcd9b8" stroke="#b45309" strokeWidth="0.5" />
      <Hair type={hairType} colour={hairColour} />
      <rect x="-5" y="-11" width="2.5" height="2.5" fill="#052e16" />
      <rect x="2.5" y="-11" width="2.5" height="2.5" fill="#052e16" />
      {name === 'Meow' && (
        <g stroke="#fcd9b8" strokeWidth="1">
          <line x1="-7" y1="-12" x2="-13" y2="-14" /><line x1="-7" y1="-9" x2="-13" y2="-8" />
          <line x1="7" y1="-12" x2="13" y2="-14" /><line x1="7" y1="-9" x2="13" y2="-8" />
        </g>
      )}
      <circle cx="10" cy="-16" r="4" fill={ring} stroke="#070a12" strokeWidth="1" />
      {isBoss ? (
        <g>
          <rect x="-24" y="-48" width="48" height="18" rx="4" fill="#070a12" stroke="#f97316" strokeWidth="1" />
          <text x="0" y="-35" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="1" fill="#fb923c">BOSS</text>
          <rect x="14" y="-40" width="18" height="12" rx="4" fill="#f8fafc" stroke="#0f172a" strokeWidth="1" />
          <circle cx="18" cy="-34" r="1.6" fill="#0f172a" /><circle cx="23" cy="-34" r="1.6" fill="#0f172a" /><circle cx="28" cy="-34" r="1.6" fill="#0f172a" />
        </g>
      ) : (
        <Bubble name={name} />
      )}
    </g>
  )
}

function RoomLabel({ x, y, text, color, onClick }) {
  const w = text.length * 8 + 18
  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <rect x={x - w / 2} y={y - 13} width={w} height="18" rx="3" fill="#070a12" opacity="0.92" />
      <text x={x} y={y} textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="1" fill={color}>{text}</text>
    </g>
  )
}

function Furniture({ id, counts }) {
  if (id === 'front') {
    // Black server cabinet with green lights at the N corner.
    return (
      <g>
        <rect x="222" y="128" width="36" height="46" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <circle cx="232" cy="138" r="2.5" fill="#22c55e" /><circle cx="232" cy="148" r="2.5" fill="#22c55e" />
        <circle cx="232" cy="158" r="2.5" fill="#22c55e" /><circle cx="248" cy="138" r="2.5" fill="#22c55e" />
        <rect x="228" y="166" width="24" height="3" fill="#1f2937" />
      </g>
    )
  }
  if (id === 'command') {
    // Status board as 3 COLUMNS under a thick orange trim bar (spec §4).
    // Shifted to the new Command centre (775,215); label sits at
    // y=135 above the trim bar, so board and label never overlap.
    return (
      <g>
        <rect x="675" y="148" width="200" height="8" fill="#fb923c" />
        <rect x="675" y="156" width="200" height="58" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="1" />
        <text x="710" y="172" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1" fill="#94a3b8">RUNNING</text>
        <text x="775" y="172" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1" fill="#94a3b8">DONE</text>
        <text x="840" y="172" textAnchor="middle" fontSize="8" fontWeight="700" letterSpacing="1" fill="#94a3b8">NEEDS YOU</text>
        <text x="710" y="202" textAnchor="middle" fontSize="22" fontWeight="800" fill="#f8fafc">{counts.running}</text>
        <text x="775" y="202" textAnchor="middle" fontSize="22" fontWeight="800" fill="#bbf7d0">{counts.done}</text>
        <text x="840" y="202" textAnchor="middle" fontSize="22" fontWeight="800" fill="#facc15">{counts.needs}</text>
      </g>
    )
  }
  if (id === 'brain') {
    return (
      <g>
        <polygon points="470,320 522,335 522,365 470,380 418,365 418,335" fill="#a5f3fc" opacity="0.55" />
        <polygon points="470,340 522,355 522,385 470,400 418,385 418,355" fill="#31255c" />
        <polygon points="470,322 522,337 522,367 470,382 418,367 418,337" fill="#a5f3fc" />
        <ellipse cx="470" cy="400" rx="70" ry="14" fill="#000" opacity="0.4" />
        <g filter="url(#brainGlow)">
          <circle cx="470" cy="322" r="38" fill="#7ff2ff" />
          <circle cx="456" cy="308" r="11" fill="#ecfeff" opacity="0.9" />
        </g>
        <ellipse cx="470" cy="360" rx="115" ry="36" fill="none" stroke="#7ff2ff" strokeWidth="2" opacity="0.8" />
        <ellipse cx="470" cy="322" rx="70" ry="22" fill="none" stroke="#67e8f9" strokeWidth="1.5" opacity="0.5" />
      </g>
    )
  }
  if (id === 'commons') return (
    <g><rect x="82" y="452" width="58" height="38" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" transform="rotate(-18 111 471)" /></g>
  )
  if (id === 'meeting') return (
    <g>
      <polygon points="700,470 810,415 860,440 750,495" fill="#8b5a2b" stroke="#5b3a1a" strokeWidth="1" />
      {[715, 745, 775, 805].map((x, i) => <rect key={`n${i}`} x={x} y={440 + (i % 2) * 6} width="16" height="12" rx="2" fill="#1f2937" stroke="#0f172a" strokeWidth="1" />)}
      {[725, 755, 785, 815].map((x, i) => <rect key={`s${i}`} x={x} y={482 + (i % 2) * 6} width="16" height="12" rx="2" fill="#1f2937" stroke="#0f172a" strokeWidth="1" />)}
    </g>
  )
  if (id === 'pantry') return (
    <g>
      <polygon points="600,535 720,535 740,550 620,550" fill="#64748b" stroke="#334155" strokeWidth="1" />
      <rect x="730" y="542" width="26" height="34" rx="2" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
      <rect x="620" y="538" width="14" height="14" rx="2" fill="#ef4444" />
    </g>
  )
  if (id === 'game') return (
    <g>
      <polygon points="400,600 470,565 505,585 435,620" fill="#2563eb" stroke="#1e40af" strokeWidth="1" />
      <rect x="520" y="570" width="22" height="30" rx="2" fill="#ec4899" stroke="#9d174d" strokeWidth="1" />
      <rect x="548" y="580" width="22" height="30" rx="2" fill="#38bdf8" stroke="#075985" strokeWidth="1" />
      <circle cx="430" cy="640" r="20" fill="#7c5a3a" stroke="#5b3a1a" strokeWidth="1" />
      <circle cx="430" cy="640" r="11" fill="#f8fafc" opacity="0.7" />
      <circle cx="500" cy="650" r="20" fill="#7c5a3a" stroke="#5b3a1a" strokeWidth="1" />
      <circle cx="500" cy="650" r="11" fill="#f8fafc" opacity="0.7" />
      <circle cx="470" cy="615" r="5" fill="#f97316" />
      <circle cx="540" cy="625" r="5" fill="#22c55e" />
    </g>
  )
  if (id === 'nap') return (
    <g>
      {[['#f472b6', 580, 600], ['#4ade80', 620, 615], ['#fb923c', 660, 630], ['#38bdf8', 700, 645], ['#f472b6', 740, 660]].map(([c, x, y], i) => (
        <g key={i}><rect x={x} y={y} width="52" height="22" rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" /><rect x={x} y={y} width="52" height="10" rx="3" fill={c} /></g>
      ))}
    </g>
  )
  if (id === 'human') return (
    <g>
      <rect x={820 - 62} y={505 - 13} width="124" height="18" rx="3" fill="#070a12" opacity="0.92" />
      <text x="820" y="505" textAnchor="middle" fontSize="12" fontWeight="700" letterSpacing="1" fill="#86efac">TEAM STUDIO</text>
      <rect x={900 - 26} y={512} width="52" height="18" rx="4" fill="#070a12" stroke="#22c55e" strokeWidth="1" />
      <text x="900" y="525" textAnchor="middle" fontSize="11" fontWeight="800" letterSpacing="1" fill="#86efac">IKAW</text>
      <g transform="translate(900 545)">
        <ellipse cx="0" cy="17" rx="14" ry="5" fill="#000" opacity="0.35" />
        <ellipse cx="0" cy="17" rx="14" ry="5" fill="none" stroke="#22c55e" strokeWidth="1.5" />
        <rect x="-7" y="8" width="6" height="9" fill="#111827" /><rect x="1" y="8" width="6" height="9" fill="#111827" />
        <rect x="-8" y="-5" width="16" height="14" rx="2" fill="#22c55e" stroke="#0f172a" strokeWidth="1" />
        <rect x="-7" y="-18" width="14" height="13" rx="2" fill="#fcd9b8" stroke="#b45309" strokeWidth="0.5" />
        <rect x="-9" y="-21" width="18" height="7" rx="3" fill="#111827" />
        <rect x="-5" y="-11" width="2.5" height="2.5" fill="#052e16" /><rect x="2.5" y="-11" width="2.5" height="2.5" fill="#052e16" />
      </g>
    </g>
  )
  return null
}

export default function IsoMap({ rooms, agents, selectedRoom, onSelect, counts = { running: 3, done: 1, needs: 1 } }) {
  const [extraNote, setExtraNote] = useState('')
  const roomName = rooms.find((r) => r.id === selectedRoom)?.name || 'Command Deck'

  const goRoom = (id) => { setExtraNote(''); onSelect(id) }
  const goExtra = (id) => setExtraNote(EXTRA_NOTES[id])

  // Floors layer — clickable, drawn first so nothing covers a floor's
  // neighbours except the layers that follow (labels on top stay readable).
  const floorLayer = (
    <g>
      {Object.entries(FLOORS).map(([id, f]) => {
        const isActive = selectedRoom === id
        const onClick = EXTRA.has(id) ? () => goExtra(id) : () => goRoom(id)
        return (
          <g key={id} className="iso-room" role="button" tabIndex={0}
            aria-label={rooms.find((r) => r.id === id)?.name || EXTRA_NAME[id] || f.label || id}
            onClick={onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } }}>
            <polygon points={diamond(f.cx, f.cy, f.w, f.h)} fill={f.fill} stroke={isActive ? '#22c55e' : 'rgba(0,0,0,0.35)'} strokeWidth={isActive ? 3 : 1} />
            {f.check && <polygon points={diamond(f.cx, f.cy, f.w, f.h)} fill={`url(#${f.check})`} opacity="0.9" />}
            {(TRIMS[id] || []).map(([edge, colour, w], i) => (
              <polyline key={i} points={edgePts(f, edge)} fill="none" stroke={colour} strokeWidth={w} strokeLinecap="round" />
            ))}
          </g>
        )
      })}
      {/* Writers' strip floor */}
      <g className="iso-room" role="button" tabIndex={0} aria-label="Writers’ Room"
        onClick={() => goRoom('writers')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goRoom('writers') } }}>
        <polygon points={WRITERS_PTS} fill="#271f3a" stroke={selectedRoom === 'writers' ? '#22c55e' : 'rgba(0,0,0,0.35)'} strokeWidth={selectedRoom === 'writers' ? 3 : 1} />
        <polyline points="995,302 995,470" fill="none" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
        <polyline points="870,240 995,302" fill="none" stroke="#c4b5fd" strokeWidth="3" strokeLinecap="round" />
      </g>
      {/* QA Desk: desk only, no floor — invisible click target + desk */}
      <g className="iso-room" role="button" tabIndex={0} aria-label="QA Desk"
        onClick={() => goRoom('qa')}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goRoom('qa') } }}>
        <ellipse cx="330" cy="390" rx="52" ry="26" fill="transparent" stroke={selectedRoom === 'qa' ? '#22c55e' : 'none'} strokeWidth="2" />
      </g>
    </g>
  )

  // Desks / furniture / plants — pointer-events none so floor clicks
  // are never blocked by a desk.
  const furnitureLayer = (
    <g pointerEvents="none">
      {Object.keys(FLOORS).map((id) => <Furniture key={id} id={id} counts={counts} />)}
      {Object.entries(DESKS).flatMap(([id, desks]) => desks.map(([x, y, a], i) => <Desk key={`${id}-${i}`} x={x} y={y} angle={a} />))}
      <Desk x={330} y={385} angle={-18} />
      {PLANTS.map(([x, y], i) => <Plant key={i} x={x} y={y} />)}
    </g>
  )

  // Labels layer — drawn AFTER floors so no floor covers a label.
  // Brain label is drawn here, then characters are drawn after it,
  // so Boss's figure at the Brain's east rim partly covers it.
  const labelLayer = (
    <g>
      {Object.entries(LABELS).map(([id, [x, y, text, colour]]) => {
        const onClick = EXTRA.has(id) ? () => goExtra(id) : id === 'qa' ? () => goRoom('qa') : id === 'writers' ? () => goRoom('writers') : () => goRoom(id)
        return <RoomLabel key={id} x={x} y={y} text={text} color={colour} onClick={onClick} />
      })}
    </g>
  )

  // Characters layer — after labels, so Boss partly covers THE BRAIN.
  const charLayer = (
    <g>
      {agents.filter((a) => CHAR_POS[a.name]).map((a) => {
        const [x, y] = CHAR_POS[a.name]
        return (
          <g key={a.name} onClick={() => goRoom(a.room)} style={{ cursor: 'pointer' }}>
            <PixelPerson x={x} y={y} name={a.name} status={a.status} isBoss={a.name === 'Boss'} />
          </g>
        )
      })}
    </g>
  )

  return (
    <div className="iso-window">
      <div className="iso-winbar">
        <span className="iso-dot" /><span className="iso-dot" /><span className="iso-dot" />
        <span className="iso-brand">DEVXYZ HQ</span>
        <span className="iso-section">{roomName}</span>
      </div>
      <div className="iso-scroll">
        <svg className="iso-map" viewBox="0 20 1200 760" role="group" aria-label="Isometric Devxyz HQ office map">
          <defs>
            <linearGradient id="gradFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#232640" /><stop offset="100%" stopColor="#1a1d33" />
            </linearGradient>
            <linearGradient id="gradResearch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#95dbe8" /><stop offset="100%" stopColor="#6fd8c8" />
            </linearGradient>
            <linearGradient id="gradOps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d5b8f5" /><stop offset="100%" stopColor="#c99af0" />
            </linearGradient>
            <linearGradient id="gradEdit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ebbce1" /><stop offset="100%" stopColor="#e07090" />
            </linearGradient>
            <linearGradient id="gradGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d3e0f9" /><stop offset="100%" stopColor="#8fb6e8" />
            </linearGradient>
            <pattern id="checkCmd" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45 20 20)">
              <rect width="20" height="20" fill="#5a4636" /><rect x="20" width="20" height="20" fill="#463227" />
              <rect y="20" width="20" height="20" fill="#463227" /><rect x="20" y="20" width="20" height="20" fill="#5a4636" />
            </pattern>
            <pattern id="checkCommons" width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(45 20 20)">
              <rect width="20" height="20" fill="#2e5a3d" /><rect x="20" width="20" height="20" fill="#274a2d" />
              <rect y="20" width="20" height="20" fill="#274a2d" /><rect x="20" y="20" width="20" height="20" fill="#2e5a3d" />
            </pattern>
            <filter id="brainGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <polygon points={PLATFORM_SIDE} fill="#0d0a1a" />
          <polygon points={PLATFORM} fill="#171226" stroke="#241d3a" strokeWidth="2" />
          <text x="1050" y="70" textAnchor="middle" fontSize="16" fontWeight="700" letterSpacing="2" fill="#a5f3fc">AI AGENT HQ</text>
          {/* Floors + trims clipped to the platform: no floor or
              divider may extend past the rim (Human SE divider fix).
              Labels, desks, characters stay unclipped so they are
              never cut off. */}
          <clipPath id="platformClip"><polygon points={PLATFORM} /></clipPath>
          <g clipPath="url(#platformClip)">{floorLayer}</g>
          {furnitureLayer}
          {labelLayer}
          {charLayer}
        </svg>
      </div>
      <p className="iso-hint">Buong mapa, sakto sa screen — walang side scroll · Berde = WORKING, dilaw = IDLE, asul = DONE · IKAW = Human Studio · Meeting/Game/Pantry/Intern/Nap = info lang. Commons: ang green floor sa SW ang ginamit (may desk + whiteboard ito sa close screenshot ng reference); sa wide reference, ang COMMONS text ay nasa walkway north ng Meeting na walang floor, kaya hindi pa 100% sigurado ang puwesto nito.</p>
      {extraNote && <p className="iso-extra-note" role="status">{extraNote}</p>}
    </div>
  )
}

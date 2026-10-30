import { useEffect, useRef, useState } from 'react'
import {
  Building2, Brain, Search, Github, PenLine, Wallet, Clapperboard,
  ShieldCheck, Megaphone, User, Crown, Play, Check, X, Plus,
  Clock, Radio, MessageCircle, Trello, Sparkles, Eye
} from 'lucide-react'
import IsoMap from './IsoMap.jsx'

const ROOMS = [
  { id: 'front', name: 'Front Office', desc: 'Unang harap ng HQ' },
  { id: 'research', name: 'Research Lab', desc: 'Research at GitHub crawl' },
  { id: 'command', name: 'Command Deck', desc: 'Dito nakaupo si Boss' },
  { id: 'writers', name: 'Writers\u2019 Room', desc: 'Researchers at writers' },
  { id: 'ops', name: 'Ops Room', desc: 'Finance, admin at QA' },
  { id: 'qa', name: 'QA Desk', desc: 'Dito nag-QA check si Sherlock' },
  { id: 'growth', name: 'Growth Studio', desc: 'Social at growth' },
  { id: 'edit', name: 'Edit Bay', desc: 'Video editing' },
  { id: 'commons', name: 'Commons', desc: 'Tambayan ng HQ agents' },
  { id: 'human', name: 'Human Studio', desc: 'Dito ka — approval area mo' },
  { id: 'brain', name: 'The Brain', desc: 'Shared brain ng buong HQ', center: true },
]

const AGENTS = [
  { name: 'Boss', role: 'Chief of Staff / coordination', room: 'command', task: 'Nagko-coordinate sa buong HQ at nagbabantay sa approval queue.', icon: Crown, status: 'WORKING' },
  { name: 'Gugel', role: 'Deep research', room: 'research', task: 'Deep research: Solender AI Ad background.', icon: Search, status: 'WORKING' },
  { name: 'Meow', role: 'GitHub crawler', room: 'research', task: 'Nag-crawl ng GitHub repos para sa Solender AI Ad.', icon: Github, status: 'WORKING' },
  { name: 'Mari', role: 'Researchers/Writers', room: 'writers', task: 'Nagsusulat ng research notes para sa The Orange Design.', icon: PenLine, status: 'WORKING' },
  { name: 'Mang', role: 'Researchers/Writers', room: 'writers', task: 'Nagsusulat ng draft para sa Tatay of 5.', icon: PenLine, status: 'IDLE' },
  { name: 'Tess', role: 'Researchers/Writers', room: 'writers', task: 'Nag-e-edit ng research draft.', icon: PenLine, status: 'IDLE' },
  { name: 'Kanor', role: 'Researchers/Writers', room: 'writers', task: 'Nagve-verify ng sources.', icon: PenLine, status: 'WORKING' },
  { name: 'Deb', role: 'HQ agent', room: 'front', task: 'Naka-standby sa Front Office.', icon: User, status: 'IDLE' },
  { name: 'Brod Pete', role: 'HQ agent', room: 'front', task: 'Naka-standby sa Front Office.', icon: User, status: 'IDLE' },
  { name: 'Judith', role: 'Finance/Admin', room: 'ops', task: 'Nag-a-update ng finance at admin tracker.', icon: Wallet, status: 'WORKING' },
  { name: 'Sikyo', role: 'HQ agent', room: 'commons', task: 'Naka-standby sa Commons.', icon: User, status: 'IDLE' },
  { name: 'Moso', role: 'HQ agent', room: 'growth', task: 'Naka-standby sa Growth Studio.', icon: User, status: 'IDLE' },
  { name: 'Esopi', role: 'HQ agent', room: 'commons', task: 'Naka-standby sa Commons.', icon: User, status: 'IDLE' },
  { name: 'J-cut', role: 'Video editors', room: 'edit', task: 'Nag-e-edit ng video draft.', icon: Clapperboard, status: 'WORKING' },
  { name: 'B-roll', role: 'Video editors', room: 'edit', task: 'Naghahanap ng B-roll clips.', icon: Clapperboard, status: 'IDLE' },
  { name: 'S-log', role: 'Video editors', room: 'edit', task: 'Nag-aayos ng S-log footage.', icon: Clapperboard, status: 'WORKING' },
  { name: 'Sherlock', role: 'QA', room: 'qa', task: 'QA check sa pinakabagong output.', icon: ShieldCheck, status: 'WORKING' },
  { name: 'Esemem', role: 'Social media', room: 'growth', task: 'Nag-schedule ng social media post.', icon: Megaphone, status: 'WORKING' },
]

const INITIAL_TASKS = [
  { id: 't-orange', title: 'Research notes: The Orange Design', agent: 'Mari', column: 'progress', note: '' },
  { id: 't-video', title: 'Video draft edit', agent: 'J-cut', column: 'progress', note: '' },
  { id: 't-qa', title: 'QA check sa pinakabagong output', agent: 'Sherlock', column: 'progress', note: '' },
  { id: 't-social', title: 'I-post ang social media draft', agent: 'Esemem', column: 'waiting', note: 'Draft lang ito — hindi pa ito na-post. Hintayin ang approval mo.' },
  { id: 't-checkin', title: 'Morning HQ check-in — lahat ng agents online', agent: 'Boss', column: 'done', note: '' },
]

const INITIAL_BRAIN = {
  'Important information': [
    'Solender AI Ad — Trello card, pending since Oct 14.',
    'The Orange Design at Tatay of 5 — may dedicated researchers at writers.',
  ],
  'Instructions': [
    'Walang critical action na tuloy nang walang approval ni Jepong.',
    'Si Boss ang Chief of Staff — siya ang nagko-coordinate, hindi siya basta gumagawa nang mag-isa.',
  ],
  'Mga natutunan nila': [
    'Kapag may pending na Trello card, i-flag agad ni Boss at gumawa ng Discord ping draft.',
  ],
}

function nowManila() {
  return new Intl.DateTimeFormat('fil-PH', {
    timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
  }).format(new Date())
}
function todayManila() {
  return new Intl.DateTimeFormat('fil-PH', {
    timeZone: 'Asia/Manila', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date())
}

export default function App() {
  const [now, setNow] = useState(nowManila())
  const [selectedRoom, setSelectedRoom] = useState('command')
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0])
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [timeline, setTimeline] = useState([
    { time: nowManila(), agent: 'Boss', text: 'HQ online. Binabantayan ko ang approval queue — walang critical action na tuloy nang walang go signal mo.' },
  ])
  const [brain, setBrain] = useState(INITIAL_BRAIN)
  const [brainSection, setBrainSection] = useState('Important information')
  const [brainNote, setBrainNote] = useState('')
  const [toast, setToast] = useState('')
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoDone, setDemoDone] = useState(false)
  const toastTimer = useRef(null)
  const demoTimers = useRef([])

  useEffect(() => {
    const t = setInterval(() => setNow(nowManila()), 1000)
    return () => { clearInterval(t); demoTimers.current.forEach(clearTimeout) }
  }, [])

  const notify = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 3200)
  }
  const addTimeline = (agent, text) => setTimeline(prev => [...prev, { time: nowManila(), agent, text }])

  const roomAgents = selectedRoom === 'brain' ? AGENTS : AGENTS.filter(a => a.room === selectedRoom)
  const room = ROOMS.find(r => r.id === selectedRoom)
  const selectedRoomName = room?.name || 'Command Deck'

  const selectRoom = (id) => {
    setSelectedRoom(id)
    if (id === 'brain') {
      document.getElementById('brain-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      notify('The Brain — shared brain ng buong HQ.')
      return
    }
    if (id === 'human') {
      notify('Human Studio — dito ka, Jepong. Ikaw ang final approval.')
      return
    }
    const list = AGENTS.filter(a => a.room === id)
    if (list[0]) setSelectedAgent(list[0])
  }

  const approve = (task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, column: 'done', note: '' } : t))
    addTimeline('Ikaw', `Inaprubahan mo: “${task.title}” — lumipat sa DONE TODAY.`)
    if (task.id === 'demo-solender') {
      addTimeline('Boss', 'Noted. Ready na ang Discord ping kay MJ Lorque — hindi ito na-send nang walang approval mo, ngayon lang ito tuloy.')
      setDemoDone(true)
    }
    notify(`Na-approve! Lumipat sa DONE TODAY: ${task.title}`)
  }

  const reject = (task) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, column: 'progress', note: 'Binalik — kailangan ng revision bago ito tuloy.' } : t))
    addTimeline('Ikaw', `Binalik mo sa IN PROGRESS: “${task.title}” — kailangan ng revision.`)
    notify(`Binalik sa IN PROGRESS: ${task.title}`)
  }

  const playDemo = () => {
    if (demoRunning) return
    setDemoRunning(true)
    // Reset a previous demo run so the flow is replayable.
    setTasks(prev => prev.filter(t => t.id !== 'demo-solender').map(t => t.id === 't-checkin' ? t : t))
    setDemoDone(false)
    addTimeline('Boss', 'Demo simula: chine-check ko ang Trello.')
    const steps = [
      [900, 'Boss', 'Na-flag ko: Trello card “Solender AI Ad” — pending since Oct 14.'],
      [1900, 'Gugel', 'Deep research: kinuha ko ang background ng Solender AI Ad.'],
      [2900, 'Meow', 'GitHub crawl: chine-check ko ang related repos.'],
      [3900, 'Boss', 'Gumawa ako ng Discord ping draft kay MJ Lorque tungkol sa pending card. Hindi ko ito sine-send — draft lang, nasa WAITING FOR YOU na.'],
    ]
    steps.forEach(([ms, agent, text]) => {
      demoTimers.current.push(setTimeout(() => addTimeline(agent, text), ms))
    })
    demoTimers.current.push(setTimeout(() => {
      setTasks(prev => {
        if (prev.some(t => t.id === 'demo-solender')) return prev
        return [...prev, {
          id: 'demo-solender',
          title: 'Discord ping kay MJ Lorque — Solender AI Ad (pending since Oct 14)',
          agent: 'Boss', column: 'waiting',
          note: 'Draft lang ito. I-approve mo muna bago ito tuloy — walang auto-send.',
        }]
      })
      setDemoRunning(false)
      notify('Demo: nasa WAITING FOR YOU na ang Discord ping draft. Ikaw ang mag-approve.')
    }, 4700))
  }

  const addBrainNote = () => {
    const text = brainNote.trim()
    if (!text) { notify('Magsulat ka muna ng note bago magdagdag.'); return }
    setBrain(prev => ({ ...prev, [brainSection]: [...prev[brainSection], text] }))
    setBrainNote('')
    notify(`Naidagdag sa Shared Brain — ${brainSection}.`)
  }

  const col = (name) => tasks.filter(t => t.column === name)

  return (
    <div className="app">
      <div className="wrap">
        <div className="banner">
          <span className="banner-dot" />
          <strong>Demo Mode</strong> — walang live Meta API call pa. Ang lahat ng galaw dito ay demo flow lang sa session na ito.
        </div>

        <header className="header">
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
          <div className="logo"><Building2 size={26} /></div>
          <div className="head-text">
            <h1>Devxyz HQ</h1>
            <p>AI office — 18 agents, isang shared brain</p>
            <p className="section-title">{selectedRoomName}</p>
          </div>
          <div className="boss-status">
            <span className="online-dot" /><strong>Boss</strong><small>Chief of Staff · Online</small>
          </div>
        </header>

        <div className="clockbar">
          <span><Clock size={15} /> {now} · Asia/Manila</span>
          <span>{todayManila()}</span>
        </div>

        <div className="dashbar">
          <span>{selectedRoomName} · {todayManila()}</span>
          <span className="dash-pills"><span>RUNNING {col('progress').length}</span><span>DONE TODAY {col('done').length}</span><span className="amber">NEEDS YOU {col('waiting').length}</span></span>
        </div>
        <p className="muted counts-note">Live counts — galing mismo sa Task Board sa ibaba (RUNNING = IN PROGRESS, NEEDS YOU = WAITING FOR YOU). Parehong numero ang nasa Command Deck status board; nagbabago ito pag nag-approve/reject ka o tumakbo ang demo.</p>

        <section className="card map-card">
          <h2><Sparkles size={18} /> Office Map</h2>
          <p className="muted">Pindutin ang isang room para makita ang agents na naka-assign doon.</p>
          <IsoMap rooms={ROOMS} agents={AGENTS} selectedRoom={selectedRoom} onSelect={selectRoom} counts={{ running: col('progress').length, done: col('done').length, needs: col('waiting').length }} />
          <div className="room-detail">
            <strong>{selectedRoom === 'brain' ? 'The Brain — lahat ng agents, isang utak' : selectedRoom === 'human' ? 'Human Studio — ikaw ang boss dito' : `${room?.name}`}</strong>
            {selectedRoom === 'human' ? (
              <p className="muted">Dito ka mag-a-approve o magre-reject. Walang critical action na tuloy nang walang go signal mo.</p>
            ) : selectedRoom === 'brain' ? (
              <p className="muted">Dito naka-store ang important information, instructions, at mga natutunan nila — para hindi mo na ulitin ang instructions.</p>
            ) : (
              <p className="muted">{roomAgents.length} agent(s) dito: {roomAgents.map(a => a.name).join(', ')}</p>
            )}
          </div>
          <div className="chip-row" aria-label="Agent chips">
            {AGENTS.map(a => (
              <button key={a.name} className={`chip-btn ${selectedAgent.name === a.name ? 'active' : ''}`} onClick={() => { setSelectedAgent(a); setSelectedRoom(a.room) }}>{a.name.toUpperCase()}</button>
            ))}
            <button className="chip-btn chip-note" onClick={() => notify('BENTA — chip lang sa reference dashboard, hindi ito ika-19 na agent. 18 agents pa rin ang Devxyz HQ.')}>BENTA</button>
            <button className="chip-btn" onClick={() => selectRoom('brain')}>THE BRAIN</button>
          </div>
        </section>

        <section className="card roster-card">
          <h2><User size={18} /> Agent Roster — 18 agents</h2>
          <div className="agents">
            {AGENTS.map(a => {
              const Icon = a.icon
              return (
                <button key={a.name} className={`agent ${selectedAgent.name === a.name ? 'active' : ''}`} onClick={() => { setSelectedAgent(a); setSelectedRoom(a.room) }}>
                  <span className="agent-icon"><Icon size={18} /></span>
                  <strong>{a.name}</strong><small>{a.role}</small>
                  <span className={`status ${a.status.toLowerCase()}`}>{a.status}</span>
                </button>
              )
            })}
          </div>
          {selectedAgent.name === 'Boss' ? (
            <div className="boss-card">
              <div className="boss-card-head">
                <span className="boss-avatar"><Crown size={22} /></span>
                <div>
                  <strong>BOSS</strong>
                  <small>Chief of Staff · COMMAND DECK</small>
                </div>
                <span className="status working">WORKING</span>
              </div>
              <p><strong>NOW:</strong> Sweeping Trello and Discord for stuck cards.</p>
              <p><strong>LATEST OUTPUT:</strong> brain/reports/2026-10-27-daily.md</p>
              <ul>
                <li>Wave 1 and wave 2 ran</li>
                <li>Trello: 5 stale cards flagged</li>
              </ul>
              <p><strong>LEVEL 1 · 2 TASKS DONE</strong></p>
              <div className="boss-bar"><span style={{ width: '40%' }} /></div>
              <p><strong>TOOLS:</strong> All tools · Spawns agents</p>
              <p><strong>NEVER:</strong></p>
              <ul>
                <li>Posts, sends or spends without your approval</li>
                <li>Does a specialist's job itself</li>
                <li>Invents results</li>
              </ul>
              <p><strong>BRIEF:</strong> .claude/agents/chief-of-staff.md</p>
              <p className="muted">{selectedAgent.task}</p>
            </div>
          ) : (
            <div className="agent-detail">
              <strong>{selectedAgent.name}</strong><span className="muted"> · {selectedAgent.role}</span>
              <p>{selectedAgent.task}</p>
              <p className="muted">Status: {selectedAgent.status} · Room: {ROOMS.find(r => r.id === selectedAgent.room)?.name}</p>
            </div>
          )}
        </section>

        <section className="card demo-card">
          <div className="section-head">
            <h2><Radio size={18} /> Live Demo</h2>
            <button className="btn primary" onClick={playDemo} disabled={demoRunning}>
              <Play size={16} /> {demoRunning ? 'Tumatakbo ang demo…' : 'I-play ang demo'}
            </button>
          </div>
          <p className="muted">Replayable demo: Trello card na pending since Oct 14 → Boss flag → Discord ping draft kay MJ Lorque → approval mo → DONE TODAY.</p>
          <div className="timeline">
            {timeline.map((e, i) => (
              <div key={i} className="tl-item">
                <span className="tl-time">{e.time}</span>
                <span><strong>{e.agent}:</strong> {e.text}</span>
              </div>
            ))}
          </div>
          {demoDone && <p className="success">Demo kumpleto: na-approve mo ang Discord ping draft. Walang na-send nang walang approval mo.</p>}
        </section>

        <section className="card board-card">
          <h2><Trello size={18} /> Task Board</h2>
          <p className="muted">Ang WAITING FOR YOU ang core: Approve = DONE TODAY, Reject = balik sa IN PROGRESS na may note.</p>
          <div className="board">
            {[
              ['progress', 'IN PROGRESS'],
              ['waiting', 'WAITING FOR YOU'],
              ['done', 'DONE TODAY'],
            ].map(([key, label]) => (
              <div key={key} className="column">
                <h3>{label} <span>({col(key).length})</span></h3>
                {col(key).length === 0 && <p className="muted">Walang task dito ngayon.</p>}
                {col(key).map(t => (
                  <div key={t.id} className="task">
                    <strong>{t.title}</strong>
                    <small>{t.agent}{t.note ? ` · ${t.note}` : ''}</small>
                    {key === 'waiting' && (
                      <div className="task-actions">
                        <button className="btn small approve" onClick={() => approve(t)}><Check size={15} /> Approve</button>
                        <button className="btn small reject" onClick={() => reject(t)}><X size={15} /> Reject</button>
                      </div>
                    )}
                    {key === 'waiting' && <p className="draft-note"><MessageCircle size={14} /> Draft lang — hindi pa ito na-send o na-post.</p>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <section className="card bottom-card">
          <div className="bottom-panels">
            <div className="panel">
              <h3>TEAM TODAY</h3>
              <p><strong>{AGENTS.filter(a => a.status === 'WORKING').length} OF 18 ACTIVE</strong></p>
              <p className="muted">Working ngayon: {AGENTS.filter(a => a.status === 'WORKING').map(a => a.name).join(', ')}.</p>
            </div>
            <div className="panel">
              <h3>MORNING BRIEF LOOT</h3>
              <ol>
                <li>Trello sweep — hanapin ang stuck cards.</li>
                <li>Discord ping draft — pending since Oct 14.</li>
                <li>Research notes — The Orange Design.</li>
                <li>Video draft edit — J-cut.</li>
                <li>QA check — pinakabagong output.</li>
                <li>Shared Brain note — huwag ulitin ang instructions.</li>
              </ol>
            </div>
            <div className="panel">
              <h3>ACTIVITY LOG</h3>
              {timeline.slice(-5).map((e, i) => (
                <p key={i} className="log-line"><span className="tl-time">{e.time}</span> <strong>{e.agent}:</strong> {e.text}</p>
              ))}
            </div>
          </div>
        </section>

        <section className="card" id="brain-panel">
          <h2><Brain size={18} /> Shared Brain</h2>
          <p className="muted">Naka-save lang sa session na ito (state) — walang claim ng permanent storage.</p>
          {Object.entries(brain).map(([section, notes]) => (
            <div key={section} className="brain-section">
              <h3>{section}</h3>
              <ul>{notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
            </div>
          ))}
          <div className="brain-add">
            <label htmlFor="brain-section">Section</label>
            <select id="brain-section" value={brainSection} onChange={e => setBrainSection(e.target.value)}>
              {Object.keys(brain).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label htmlFor="brain-note">Bagong note</label>
            <input id="brain-note" value={brainNote} onChange={e => setBrainNote(e.target.value)} placeholder="Halimbawa: Laging i-check ang Trello bago mag-Discord ping." onKeyDown={e => { if (e.key === 'Enter') addBrainNote() }} />
            <button className="btn primary" onClick={addBrainNote}><Plus size={16} /> Magdagdag ng note</button>
          </div>
        </section>

        <section className="card approval-rule">
          <h2><Eye size={18} /> Approval Rule</h2>
          <p>Si Boss ay nagko-coordinate at nagda-draft — pero walang critical action na tuloy nang walang approval mo. Approve o Reject, ikaw ang final say.</p>
        </section>

        <footer>Powered by Jepong Devxyz · Devxyz HQ — local MVP v1, hindi pa naka-deploy</footer>
      </div>

      {toast && (
        <div className="toast show" role="status">
          <span>{toast}</span>
          <small>Powered by Jepong Devxyz</small>
        </div>
      )}
    </div>
  )
}

/* pages-extras.jsx — Incident war-room, Integrations marketplace */

/* ============================================================
   INCIDENT WAR-ROOM
   ============================================================ */
const WarRoomArtboard = () => (
  <div className="pulse-app" style={{ display: 'flex', height: '100%', background: 'oklch(0.14 0.012 22 / 0.4)' }}>
    <Sidebar active="alerts"/>
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* hot top bar */}
      <div style={{
        height: 64, padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid oklch(0.50 0.15 22 / 0.5)',
        background: 'linear-gradient(180deg, var(--status-outage-bg), oklch(0.18 0.04 22 / 0.4))',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }}>
          <LiveWave width={1200} height={64} beats={4} spike={0.7} status="outage" showFill={false} showMarker={false}/>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          <StatusBadge status="outage" label="ACTIVE INCIDENT"/>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Webhook delivery is failing</div>
            <div className="t-mono fg-ter" style={{ fontSize: 11 }}>inc_8b3e9c2 · pulse-webhooks · started 13:38 UTC</div>
          </div>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div className="t-mono" style={{ fontSize: 22, color: 'var(--status-outage)' }}>00:24:17</div>
            <div className="t-eyebrow">DURATION</div>
          </div>
          <button className="pulse-btn"><Icon name="bell" size={12}/>Page on-call</button>
          <button className="pulse-btn primary"><Icon name="check" size={12}/>Mark resolved</button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'hidden', padding: 20, display: 'grid', gridTemplateColumns: '1.5fr 1fr', gridTemplateRows: 'auto auto 1fr', gap: 14, minHeight: 0 }}>
        {/* live response wave */}
        <div className="pulse-card" style={{ gridColumn: '1 / 2', padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="pulse-dot outage"/>
              <span className="t-h4" style={{ fontSize: 13 }}>Response time · live</span>
              <span className="t-mono fg-qui" style={{ fontSize: 11 }}>last 5 min</span>
            </div>
            <div style={{ display: 'flex', gap: 18 }}>
              <span className="t-mono"><span style={{ color: 'var(--status-outage)' }}>3.21s</span><span className="fg-qui" style={{ fontSize: 11 }}> p95</span></span>
              <span className="t-mono"><span style={{ color: 'var(--status-degraded)' }}>1.82s</span><span className="fg-qui" style={{ fontSize: 11 }}> avg</span></span>
              <span className="t-mono"><span className="fg-pri">87</span><span className="fg-qui" style={{ fontSize: 11 }}> /min</span></span>
            </div>
          </div>
          <div style={{ height: 180, position: 'relative' }}>
            <LiveWave width={780} height={180} beats={4} spike={0.75} status="outage"/>
            <span className="t-mono" style={{ position: 'absolute', top: 10, left: 14, fontSize: 10, color: 'var(--fg-quiet)', letterSpacing: '0.08em' }}>RTT · ms</span>
          </div>
        </div>

        {/* region map */}
        <div className="pulse-card" style={{ gridColumn: '2 / 3', padding: 16 }}>
          <div className="t-h4" style={{ fontSize: 13, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Regions <span className="t-mono fg-qui" style={{ fontSize: 11, fontWeight: 400 }}>4 monitoring</span></span>
            <span className="t-mono" style={{ fontSize: 11, color: 'var(--status-outage)' }}>3/4 reporting</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { name: 'us-east-1',   status: 'outage',   code: '503', t: '— ' },
              { name: 'us-west-2',   status: 'outage',   code: '503', t: '— ' },
              { name: 'eu-west-1',   status: 'outage',   code: '503', t: '— ' },
              { name: 'ap-south-1',  status: 'op',       code: '200', t: '186ms' },
            ].map(r => (
              <div key={r.name} style={{
                padding: 10, borderRadius: 6,
                background: r.status === 'outage' ? 'var(--status-outage-bg)' : 'var(--status-op-bg)',
                border: `1px solid ${r.status === 'outage' ? 'oklch(0.50 0.15 22 / 0.4)' : 'oklch(0.45 0.13 152 / 0.4)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span className={`pulse-dot ${r.status}`} style={{ width: 6, height: 6, boxShadow: 'none' }}/>
                  <span className="t-mono fg-pri" style={{ fontSize: 11 }}>{r.name}</span>
                </div>
                <div className="t-mono" style={{ fontSize: 14, color: r.status === 'outage' ? 'var(--status-outage)' : 'var(--status-op)' }}>
                  {r.code} <span style={{ color: 'var(--fg-tertiary)', fontSize: 11 }}>· {r.t}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* runbook */}
        <div className="pulse-card" style={{ gridColumn: '1 / 2', padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span className="t-h4" style={{ fontSize: 13 }}>Runbook · webhook-503</span>
            <span className="t-mono fg-qui" style={{ fontSize: 11 }}>2 / 5 complete</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { done: true,  text: 'Acknowledge page & open war-room', who: 'sam · 13:39' },
              { done: true,  text: 'Confirm via curl from outside Pulse infra', who: 'sam · 13:42' },
              { done: false, text: 'Roll back deploy d4f2a1 (last green)', current: true },
              { done: false, text: 'Drain queue worker pool, restart' },
              { done: false, text: 'Post customer-facing update on status.pulse.dev' },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 6,
                background: s.current ? 'var(--pulse-brand-faint)' : 'var(--bg-raised)',
                border: `1px solid ${s.current ? 'var(--pulse-brand-quiet)' : 'var(--border-subtle)'}`,
              }}>
                <span style={{
                  width: 16, height: 16, borderRadius: 4, flex: '0 0 auto',
                  background: s.done ? 'var(--pulse-brand)' : 'transparent',
                  border: `1px solid ${s.done ? 'var(--pulse-brand)' : 'var(--border-default)'}`,
                  display: 'grid', placeItems: 'center',
                }}>
                  {s.done && <Icon name="check" size={10} color="var(--pulse-on-brand)"/>}
                </span>
                <span style={{ flex: 1, fontSize: 13, color: s.done ? 'var(--fg-tertiary)' : 'var(--fg-primary)', textDecoration: s.done ? 'line-through' : 'none' }}>
                  {s.text}
                </span>
                {s.who && <span className="t-mono fg-qui" style={{ fontSize: 10 }}>{s.who}</span>}
                {s.current && <span className="t-mono" style={{ fontSize: 10, padding: '1px 6px', borderRadius: 999, background: 'var(--pulse-brand-faint)', color: 'var(--pulse-brand)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>now</span>}
              </div>
            ))}
          </div>
        </div>

        {/* comms feed */}
        <div className="pulse-card" style={{ gridColumn: '2 / 3', gridRow: '2 / 4', padding: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="t-h4" style={{ fontSize: 13 }}>Comms</span>
              <span className="t-mono fg-qui" style={{ fontSize: 11 }}>· #ops-alerts</span>
            </div>
            <button className="pulse-btn sm ghost"><Icon name="ext" size={11}/>Open Slack</button>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { who: 'pulse-bot', t: '13:38', system: true, text: '🔴 incident opened · webhook-503 · 3/3 regions failing' },
              { who: 'sam',  t: '13:39', text: 'On it — opening war-room' },
              { who: 'sam',  t: '13:42', text: 'reproduced from my laptop: connection accepted, then 503 after ~30s' },
              { who: 'maya', t: '13:44', text: 'looks like the queue worker pool. metrics show stuck connections climbing since 13:30' },
              { who: 'pulse-bot', t: '13:51', system: true, text: '⚠️ pulse-cdn now degraded · likely related' },
              { who: 'sam',  t: '13:55', text: 'rolling back d4f2a1 now. eta 4 min.' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {m.system ? (
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--bg-overlay)', display: 'grid', placeItems: 'center' }}>
                    <Logo size={12} withWordmark={false}/>
                  </div>
                ) : (
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: m.who === 'sam' ? 'oklch(0.55 0.1 280)' : 'oklch(0.6 0.12 30)', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 600, color: 'var(--fg-on-accent)' }}>{m.who[0].toUpperCase()}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: m.system ? 'var(--fg-tertiary)' : 'var(--fg-primary)' }}>{m.who}</span>
                    <span className="t-mono fg-qui" style={{ fontSize: 10 }}>{m.t}</span>
                  </div>
                  <div className="t-sm" style={{ color: m.system ? 'var(--fg-tertiary)' : 'var(--fg-secondary)', marginTop: 1 }}>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: 12, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input className="pulse-input" placeholder="Post update to #ops-alerts + status page..." style={{ height: 30, fontSize: 12 }}/>
              <button className="pulse-btn sm primary">Post</button>
            </div>
          </div>
        </div>

        {/* check log */}
        <div className="pulse-card" style={{ gridColumn: '1 / 2', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="t-h4" style={{ fontSize: 13 }}>Recent checks · pulse-webhooks</span>
            <span className="t-mono fg-qui" style={{ fontSize: 11 }}>30s interval</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', padding: '4px 0' }}>
            {[
              { t: '14:02:08', region: 'us-east-1', code: 503, ms: '—',    err: 'upstream timeout' },
              { t: '14:02:08', region: 'us-west-2', code: 503, ms: '—',    err: 'upstream timeout' },
              { t: '14:02:08', region: 'eu-west-1', code: 503, ms: '—',    err: 'upstream timeout' },
              { t: '14:02:08', region: 'ap-south-1',code: 200, ms: '186' },
              { t: '14:01:38', region: 'us-east-1', code: 503, ms: '—',    err: 'upstream timeout' },
              { t: '14:01:38', region: 'us-west-2', code: 503, ms: '—',    err: 'upstream timeout' },
              { t: '14:01:38', region: 'eu-west-1', code: 200, ms: '2418', degraded: true },
              { t: '14:01:38', region: 'ap-south-1',code: 200, ms: '178' },
            ].map((c, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '88px 88px 56px 70px 1fr', gap: 12, padding: '4px 16px', alignItems: 'center', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                <span className="fg-qui">{c.t}</span>
                <span className="fg-sec">{c.region}</span>
                <span style={{ color: c.code >= 500 ? 'var(--status-outage)' : c.degraded ? 'var(--status-degraded)' : 'var(--status-op)' }}>{c.code}</span>
                <span className="fg-pri">{c.ms}{c.ms !== '—' && 'ms'}</span>
                <span className="fg-ter" style={{ fontSize: 11 }}>{c.err || '—'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  </div>
);

/* ============================================================
   INTEGRATIONS
   ============================================================ */
const integrations = [
  { id: 'slack',     name: 'Slack',           desc: 'Channel + DM alerts, rich incident cards.', cat: 'Chat',     fg: '#E01E5A', connected: true,  channels: '#ops-alerts · #status' },
  { id: 'discord',   name: 'Discord',         desc: 'Webhook posts to a channel or thread.',    cat: 'Chat',      fg: '#5865F2', connected: true,  channels: 'ops · status' },
  { id: 'pagerduty', name: 'PagerDuty',       desc: 'Page on-call rotations with severity.',    cat: 'On-call',   fg: '#06AC38', connected: false },
  { id: 'opsgenie',  name: 'Opsgenie',        desc: 'Route alerts through schedules.',          cat: 'On-call',   fg: '#172B4D', connected: false },
  { id: 'webhook',   name: 'Webhooks',        desc: 'POST JSON to any endpoint. Signed.',       cat: 'Custom',    fg: 'var(--pulse-brand)', connected: true, channels: '2 endpoints' },
  { id: 'email',     name: 'Email',           desc: 'Per-user routing + digest mode.',          cat: 'Notify',    fg: '#7C7CC2', connected: true,  channels: '3 recipients' },
  { id: 'sms',       name: 'SMS · Twilio',    desc: 'Critical-only by default. Pro plan.',      cat: 'Notify',    fg: '#F22F46', connected: false, pro: true },
  { id: 'telegram',  name: 'Telegram',        desc: 'Bot posts to a channel.',                  cat: 'Chat',      fg: '#26A5E4', connected: false },
  { id: 'teams',     name: 'Microsoft Teams', desc: 'Adaptive cards in any channel.',           cat: 'Chat',      fg: '#5059C9', connected: false },
  { id: 'datadog',   name: 'Datadog',         desc: 'Mirror Pulse metrics into Datadog.',       cat: 'Observability', fg: '#632CA6', connected: false, pro: true },
  { id: 'grafana',   name: 'Grafana Cloud',   desc: 'Pulse as a Grafana data source.',          cat: 'Observability', fg: '#F46800', connected: false, pro: true },
  { id: 'github',    name: 'GitHub',          desc: 'Open issues on incident, link PRs.',       cat: 'Workflow',  fg: '#8b949e', connected: false },
];

const IntegrationTile = ({ it }) => (
  <div className="pulse-card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, minHeight: 160 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: it.fg.startsWith('#') ? it.fg + '22' : 'var(--pulse-brand-faint)',
        display: 'grid', placeItems: 'center',
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, background: it.fg }}/>
      </div>
      {it.connected ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, padding: '2px 7px', borderRadius: 999, background: 'var(--status-op-bg)', color: 'var(--status-op)', border: '1px solid oklch(0.45 0.13 152 / 0.4)', fontFamily: 'var(--font-mono)' }}>
          <span className="pulse-dot op" style={{ width: 5, height: 5, boxShadow: 'none' }}/>Connected
        </span>
      ) : it.pro ? (
        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 999, background: 'var(--pulse-brand-faint)', color: 'var(--pulse-brand)', border: '1px solid var(--pulse-brand-quiet)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>PRO</span>
      ) : null}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontWeight: 500, fontSize: 14 }}>{it.name}</div>
      <div className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 1 }}>{it.cat}</div>
      <div className="t-sm fg-sec" style={{ marginTop: 8 }}>{it.desc}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
      {it.channels ? (
        <span className="t-mono fg-ter" style={{ fontSize: 11 }}>{it.channels}</span>
      ) : <span/>}
      <button className={`pulse-btn sm ${it.connected ? 'ghost' : ''}`}>{it.connected ? 'Configure' : 'Connect'}</button>
    </div>
  </div>
);

const IntegrationsArtboard = () => (
  <div className="pulse-app" style={{ display: 'flex', height: '100%' }}>
    <Sidebar active="integrations"/>
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar
        title="Integrations"
        crumb={<><span>Settings</span><Icon name="chev" size={10}/><span style={{ color: 'var(--fg-secondary)' }}>Integrations</span></>}
        actions={<>
          <button className="pulse-btn"><Icon name="plug" size={12}/>Build custom</button>
          <button className="pulse-btn primary"><Icon name="plus" size={12}/>New integration</button>
        </>}
      />
      <div style={{ flex: 1, overflow: 'hidden', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* summary strip */}
        <div className="pulse-card" style={{ padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {[
            { label: 'Connected', value: '4', sub: 'of 12 available' },
            { label: 'Last alert routed', value: '13:38', sub: 'webhook-503 → 3 channels' },
            { label: 'Delivery rate · 24h', value: '99.6%', sub: '212 / 213 succeeded' },
            { label: 'On-call schedule', value: 'sam', sub: 'until tomorrow 09:00' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '4px 16px', borderLeft: i ? '1px solid var(--border-subtle)' : 'none' }}>
              <div className="t-eyebrow">{s.label}</div>
              <div className="t-mono fg-pri" style={{ fontSize: 22, marginTop: 4 }}>{s.value}</div>
              <div className="t-sm fg-qui" style={{ marginTop: 2 }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="t-mono fg-ter" style={{ fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' }}>FILTER</span>
          {['All','Chat','On-call','Notify','Observability','Custom'].map((c, i) => (
            <button key={c} className={`pulse-btn sm ${i === 0 ? '' : 'ghost'}`}>{c}</button>
          ))}
          <div style={{ flex: 1 }}/>
          <span className="t-mono fg-qui" style={{ fontSize: 11 }}>{integrations.length} integrations</span>
        </div>

        {/* grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, overflow: 'auto' }}>
          {integrations.map(it => <IntegrationTile key={it.id} it={it}/>)}
        </div>
      </div>
    </main>
  </div>
);

Object.assign(window, { WarRoomArtboard, IntegrationsArtboard });

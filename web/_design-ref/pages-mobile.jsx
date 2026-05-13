/* pages-mobile.jsx — Mobile dashboard, service detail, lock-screen push, mobile war-room */

const phoneShell = {
  background: 'var(--bg-canvas)',
  color: 'var(--fg-primary)',
  fontFamily: 'var(--font-sans)',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
};

const MobileHeader = ({ title, subtitle, right, sub }) => (
  <header style={{
    paddingTop: 56, padding: '56px 18px 12px',
    display: 'flex', flexDirection: 'column', gap: 6,
    background: 'var(--bg-canvas)',
    borderBottom: '1px solid var(--border-subtle)',
    position: 'relative', overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 28, opacity: 0.18, pointerEvents: 'none' }}>
      <LiveWave width={400} height={28} beats={4} spike={0.3} showFill={false} showMarker={false}/>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Logo size={16}/>
      {right}
    </div>
    <div style={{ position: 'relative' }}>
      <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
      {subtitle && <div className="t-sm fg-ter" style={{ marginTop: 2 }}>{subtitle}</div>}
    </div>
    {sub}
  </header>
);

const MobileTabBar = ({ active = 'services' }) => (
  <nav style={{
    position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
    background: 'oklch(0.16 0.008 240 / 0.9)',
    backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--border-subtle)',
    padding: '8px 24px 28px',
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4,
  }}>
    {[
      ['services','Services','list'],
      ['statuspages','Status','globe'],
      ['alerts','Alerts','bell'],
      ['settings','Settings','cog'],
    ].map(([k, label, icon]) => (
      <div key={k} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        color: active === k ? 'var(--pulse-brand)' : 'var(--fg-tertiary)',
      }}>
        <Icon name={icon} size={18}/>
        <span style={{ fontSize: 10, fontWeight: 500 }}>{label}</span>
      </div>
    ))}
  </nav>
);

/* ============================================================
   1. MOBILE DASHBOARD
   ============================================================ */
const mobileServices = [
  { name: 'pulse-api',       url: 'api.pulse.dev',       status: 'op',       uptime: '99.998%', resp: '142ms', last: '12s', seed: 3 },
  { name: 'pulse-dashboard', url: 'app.pulse.dev',       status: 'op',       uptime: '99.982%', resp: '268ms', last: '8s',  seed: 7 },
  { name: 'pulse-webhooks',  url: 'hooks.pulse.dev',     status: 'outage',   uptime: '98.412%', resp: '1.8s',  last: '3s',  seed: 1 },
  { name: 'pulse-cdn',       url: 'cdn.pulse.dev',       status: 'degraded', uptime: '99.804%', resp: '412ms', last: '5s',  seed: 5 },
  { name: 'docs',            url: 'docs.pulse.dev',      status: 'op',       uptime: '99.999%', resp: '88ms',  last: '11s', seed: 9 },
  { name: 'auth',            url: 'auth.pulse.dev',      status: 'op',       uptime: '99.961%', resp: '196ms', last: '7s',  seed: 13 },
];

const MobileDashboard = () => (
  <div style={phoneShell}>
    <MobileHeader
      title="Services"
      subtitle="6 monitors · 1 incident"
      right={<button className="pulse-btn sm" style={{ width: 28, height: 28, padding: 0, justifyContent: 'center', borderRadius: 999 }}>
        <Icon name="plus" size={13}/>
      </button>}
      sub={
        <div style={{ display: 'flex', gap: 6, marginTop: 10, position: 'relative' }}>
          <button className="pulse-btn sm" style={{ height: 28 }}>All <span className="t-mono fg-qui" style={{ marginLeft: 4 }}>6</span></button>
          <button className="pulse-btn sm ghost" style={{ height: 28, color: 'var(--status-outage)' }}>Down <span className="t-mono" style={{ marginLeft: 4 }}>1</span></button>
          <button className="pulse-btn sm ghost" style={{ height: 28, color: 'var(--status-degraded)' }}>Degraded <span className="t-mono" style={{ marginLeft: 4 }}>1</span></button>
        </div>
      }
    />
    <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* incident banner */}
      <div style={{
        padding: 12, borderRadius: 10,
        background: 'var(--status-outage-bg)', border: '1px solid oklch(0.50 0.15 22 / 0.5)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span className="pulse-dot outage" style={{ width: 10, height: 10 }}/>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Active incident · webhooks</div>
          <div className="t-mono fg-ter" style={{ fontSize: 11 }}>started 24 min ago</div>
        </div>
        <Icon name="chev" size={12} color="var(--fg-tertiary)"/>
      </div>
      {mobileServices.map(s => (
        <div key={s.name} className="pulse-card" style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={`pulse-dot ${s.status}`}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{s.name}</div>
              <div className="t-mono fg-qui" style={{ fontSize: 11 }}>{s.url}</div>
            </div>
            <Icon name="chev" size={11} color="var(--fg-quiet)"/>
          </div>
          <UptimeBar height={16} seed={s.seed}/>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="t-mono" style={{ fontSize: 11 }}>
              <span className="fg-qui">uptime · </span>
              <span style={{ color: s.status === 'op' ? 'var(--fg-secondary)' : s.status === 'outage' ? 'var(--status-outage)' : 'var(--status-degraded)' }}>{s.uptime}</span>
            </span>
            <span className="t-mono fg-sec" style={{ fontSize: 11 }}>
              <span className="fg-qui">resp · </span>{s.resp}
            </span>
            <span className="t-mono fg-qui" style={{ fontSize: 11 }}>{s.last}</span>
          </div>
        </div>
      ))}
    </div>
    <MobileTabBar active="services"/>
  </div>
);

/* ============================================================
   2. MOBILE SERVICE DETAIL
   ============================================================ */
const MobileServiceDetail = () => (
  <div style={phoneShell}>
    <header style={{ padding: '56px 18px 0', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <Icon name="chev" size={12} color="var(--fg-tertiary)" style={{ transform: 'rotate(180deg)' }}/>
        <span className="t-mono fg-ter" style={{ fontSize: 11 }}>Services</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>pulse-webhooks</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
        <StatusBadge status="outage" size="sm"/>
        <span className="t-mono fg-qui" style={{ fontSize: 11 }}>hooks.pulse.dev · 30s · 4 regions</span>
      </div>
    </header>

    <div style={{ flex: 1, overflow: 'auto', padding: '16px 14px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* metrics row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        <div className="pulse-card" style={{ padding: 12 }}>
          <div className="t-eyebrow">UPTIME · 90d</div>
          <div className="t-mono" style={{ fontSize: 22, marginTop: 4 }}>98.412<span className="fg-qui" style={{ fontSize: 12 }}>%</span></div>
        </div>
        <div className="pulse-card" style={{ padding: 12 }}>
          <div className="t-eyebrow">AVG · 24h</div>
          <div className="t-mono" style={{ fontSize: 22, marginTop: 4, color: 'var(--status-outage)' }}>1.82<span className="fg-qui" style={{ fontSize: 12 }}>s</span></div>
        </div>
        <div className="pulse-card" style={{ padding: 12 }}>
          <div className="t-eyebrow">P95 · 24h</div>
          <div className="t-mono" style={{ fontSize: 22, marginTop: 4, color: 'var(--status-degraded)' }}>3.20<span className="fg-qui" style={{ fontSize: 12 }}>s</span></div>
        </div>
        <div className="pulse-card" style={{ padding: 12 }}>
          <div className="t-eyebrow">MTTR · 30d</div>
          <div className="t-mono" style={{ fontSize: 22, marginTop: 4 }}>6<span className="fg-qui" style={{ fontSize: 12 }}>min</span></div>
        </div>
      </div>

      {/* live wave */}
      <div className="pulse-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="t-h4" style={{ fontSize: 12 }}>Response · live</span>
          <span className="t-mono" style={{ fontSize: 11, color: 'var(--status-outage)' }}>1.82s avg</span>
        </div>
        <div style={{ height: 100 }}>
          <LiveWave width={400} height={100} beats={3} spike={0.7} status="outage"/>
        </div>
      </div>

      {/* uptime tabs */}
      <div style={{ display: 'flex', gap: 4, padding: 3, borderRadius: 8, background: 'var(--bg-base)', border: '1px solid var(--border-subtle)' }}>
        {['24h','7d','90d'].map((t, i) => (
          <button key={t} className={`pulse-btn sm ${i === 2 ? '' : 'ghost'}`} style={{ flex: 1, height: 26 }}>{t}</button>
        ))}
      </div>

      <div className="pulse-card" style={{ padding: 14 }}>
        <div className="t-h4" style={{ fontSize: 13, marginBottom: 10 }}>Uptime · 90 days</div>
        <UptimeBar height={32} seed={1}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="t-mono fg-qui" style={{ fontSize: 10 }}>Feb 12</span>
          <span className="t-mono fg-qui" style={{ fontSize: 10 }}>today</span>
        </div>
      </div>

      <div className="pulse-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span className="t-h4" style={{ fontSize: 13 }}>Recent incidents</span>
          <span className="t-mono fg-qui" style={{ fontSize: 11 }}>3</span>
        </div>
        <IncidentTimeline items={[
          { time: '13:38 UTC · today',     status: 'outage',   statusLabel: 'investigating', title: 'Webhook delivery failing' },
          { time: 'May 10 · 22:18',        status: 'degraded', statusLabel: 'resolved',      title: 'Elevated p95 in eu-west' },
          { time: 'May 04 · 02:00',        status: 'maint',    statusLabel: 'scheduled',     title: 'Postgres failover' },
        ]}/>
      </div>
    </div>
    <MobileTabBar active="services"/>
  </div>
);

/* ============================================================
   3. LOCK SCREEN PUSH
   ============================================================ */
const MobileLockScreen = () => (
  <div style={{
    height: '100%', position: 'relative',
    background: 'radial-gradient(ellipse 80% 60% at 50% 0%, oklch(0.22 0.05 22 / 0.6), oklch(0.12 0.015 240) 60%), oklch(0.10 0.012 240)',
    color: '#fff', fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column',
    padding: '76px 14px 60px',
  }}>
    {/* date/time */}
    <div style={{ textAlign: 'center', marginBottom: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 400, opacity: 0.7, letterSpacing: 0.5 }}>Wednesday, May 13</div>
      <div style={{ fontSize: 72, fontWeight: 200, letterSpacing: '-0.02em', lineHeight: 1, marginTop: 2, fontFeatureSettings: '"ss01"' }}>3:38</div>
    </div>

    {/* the notification — critical */}
    <div style={{
      borderRadius: 18,
      background: 'oklch(0.22 0.04 22 / 0.55)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid oklch(0.50 0.15 22 / 0.6)',
      padding: 14, display: 'flex', flexDirection: 'column', gap: 8,
      boxShadow: '0 12px 36px oklch(0.20 0.10 22 / 0.5)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)', display: 'grid', placeItems: 'center' }}>
          <Logo size={20} withWordmark={false}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>PULSE</span>
            <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: 4, background: 'oklch(0.50 0.15 22 / 0.5)', color: '#fff', letterSpacing: '0.08em' }}>CRITICAL</span>
          </div>
          <div style={{ fontSize: 11, opacity: 0.65 }}>now</div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>pulse-webhooks is down</div>
        <div style={{ fontSize: 13, opacity: 0.82, lineHeight: 1.4 }}>
          3 of 4 regions returning 503. Detected 38 seconds ago. You're on-call.
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button className="pulse-btn sm" style={{ flex: 1, height: 30, background: 'oklch(1 0 0 / 0.12)', color: '#fff', border: 'none', justifyContent: 'center' }}>Snooze 5m</button>
        <button className="pulse-btn sm primary" style={{ flex: 1, height: 30, justifyContent: 'center' }}>Acknowledge</button>
      </div>
    </div>

    {/* one earlier notification */}
    <div style={{
      marginTop: 10,
      borderRadius: 16,
      background: 'oklch(1 0 0 / 0.08)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
      opacity: 0.85,
    }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: 'oklch(0.18 0.04 84)', display: 'grid', placeItems: 'center' }}>
        <Logo size={14} withWordmark={false}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600 }}>Pulse · pulse-cdn degraded</div>
        <div style={{ fontSize: 11, opacity: 0.7 }}>3 min ago · p95 climbing</div>
      </div>
    </div>

    <div style={{ flex: 1 }}/>

    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 32px', opacity: 0.5, fontSize: 11 }}>
      <span>🔦</span>
      <span>📷</span>
    </div>
  </div>
);

/* ============================================================
   4. MOBILE WAR-ROOM
   ============================================================ */
const MobileWarRoom = () => (
  <div style={phoneShell}>
    {/* hot header */}
    <header style={{
      paddingTop: 56, padding: '56px 16px 14px',
      background: 'linear-gradient(180deg, var(--status-outage-bg), transparent)',
      borderBottom: '1px solid oklch(0.50 0.15 22 / 0.5)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, top: 40, opacity: 0.35, pointerEvents: 'none' }}>
        <LiveWave width={400} height={80} beats={3} spike={0.7} status="outage" showFill={false} showMarker={false}/>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="chev" size={11} color="var(--fg-tertiary)" style={{ transform: 'rotate(180deg)' }}/>
          <span className="t-mono fg-ter" style={{ fontSize: 11 }}>Alerts</span>
        </div>
        <StatusBadge status="outage" label="ACTIVE" size="sm"/>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>Webhook delivery failing</div>
        <div className="t-mono fg-ter" style={{ fontSize: 11, marginTop: 4 }}>inc_8b3e9c2 · pulse-webhooks</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 14 }}>
          <div className="t-mono" style={{ fontSize: 26, color: 'var(--status-outage)', fontWeight: 500 }}>00:24:17</div>
          <div className="t-eyebrow">DURATION</div>
        </div>
      </div>
    </header>

    <div style={{ flex: 1, overflow: 'auto', padding: '14px 14px 100px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* region grid */}
      <div className="pulse-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="t-h4" style={{ fontSize: 13 }}>Regions</span>
          <span className="t-mono" style={{ fontSize: 11, color: 'var(--status-outage)' }}>3/4 failing</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {[
            { name: 'us-east-1',  status: 'outage', code: '503' },
            { name: 'us-west-2',  status: 'outage', code: '503' },
            { name: 'eu-west-1',  status: 'outage', code: '503' },
            { name: 'ap-south-1', status: 'op',     code: '200' },
          ].map(r => (
            <div key={r.name} style={{
              padding: 8, borderRadius: 6,
              background: r.status === 'outage' ? 'var(--status-outage-bg)' : 'var(--status-op-bg)',
              border: `1px solid ${r.status === 'outage' ? 'oklch(0.50 0.15 22 / 0.4)' : 'oklch(0.45 0.13 152 / 0.4)'}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span className={`pulse-dot ${r.status}`} style={{ width: 5, height: 5, boxShadow: 'none' }}/>
                <span className="t-mono" style={{ fontSize: 10, color: 'var(--fg-secondary)' }}>{r.name}</span>
              </div>
              <div className="t-mono" style={{ fontSize: 14, color: r.status === 'outage' ? 'var(--status-outage)' : 'var(--status-op)', marginTop: 2 }}>{r.code}</div>
            </div>
          ))}
        </div>
      </div>

      {/* runbook */}
      <div className="pulse-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="t-h4" style={{ fontSize: 13 }}>Runbook</span>
          <span className="t-mono fg-qui" style={{ fontSize: 11 }}>2 / 5</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {[
            { done: true,  text: 'Acknowledge & open war-room' },
            { done: true,  text: 'Confirm via curl' },
            { done: false, text: 'Roll back deploy d4f2a1', current: true },
            { done: false, text: 'Drain queue worker pool' },
            { done: false, text: 'Post status update' },
          ].map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '6px 8px',
              borderRadius: 5,
              background: s.current ? 'var(--pulse-brand-faint)' : 'transparent',
              border: `1px solid ${s.current ? 'var(--pulse-brand-quiet)' : 'transparent'}`,
            }}>
              <span style={{
                width: 14, height: 14, borderRadius: 3, flex: '0 0 auto',
                background: s.done ? 'var(--pulse-brand)' : 'transparent',
                border: `1px solid ${s.done ? 'var(--pulse-brand)' : 'var(--border-default)'}`,
                display: 'grid', placeItems: 'center',
              }}>
                {s.done && <Icon name="check" size={9} color="var(--pulse-on-brand)"/>}
              </span>
              <span style={{ flex: 1, fontSize: 12, color: s.done ? 'var(--fg-tertiary)' : 'var(--fg-primary)', textDecoration: s.done ? 'line-through' : 'none' }}>{s.text}</span>
              {s.current && <span className="t-mono" style={{ fontSize: 9, padding: '1px 5px', borderRadius: 999, background: 'var(--pulse-brand-faint)', color: 'var(--pulse-brand)', letterSpacing: '0.08em' }}>NOW</span>}
            </div>
          ))}
        </div>
      </div>

      {/* comms preview */}
      <div className="pulse-card" style={{ padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span className="t-h4" style={{ fontSize: 13 }}>Comms · #ops-alerts</span>
          <Icon name="ext" size={11} color="var(--fg-tertiary)"/>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { who: 'maya', t: '13:44', text: 'looks like queue worker pool. stuck connections climbing since 13:30' },
            { who: 'sam',  t: '13:55', text: 'rolling back d4f2a1 now. eta 4 min.' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: m.who === 'sam' ? 'oklch(0.55 0.1 280)' : 'oklch(0.6 0.12 30)', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 600, color: 'var(--fg-on-accent)', flex: '0 0 auto' }}>{m.who[0].toUpperCase()}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: 5, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11, fontWeight: 500 }}>{m.who}</span>
                  <span className="t-mono fg-qui" style={{ fontSize: 9 }}>{m.t}</span>
                </div>
                <div className="t-sm fg-sec" style={{ fontSize: 12, marginTop: 1 }}>{m.text}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* sticky bottom action bar */}
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 5,
      padding: '10px 14px 34px',
      background: 'oklch(0.16 0.008 240 / 0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex', gap: 8,
    }}>
      <button className="pulse-btn" style={{ flex: 1, justifyContent: 'center', height: 40 }}>Snooze</button>
      <button className="pulse-btn primary" style={{ flex: 1.5, justifyContent: 'center', height: 40 }}>
        <Icon name="check" size={12}/>Mark resolved
      </button>
    </div>
  </div>
);

Object.assign(window, { MobileDashboard, MobileServiceDetail, MobileLockScreen, MobileWarRoom });

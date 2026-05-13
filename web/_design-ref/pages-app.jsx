/* pages-app.jsx — Dashboard, Service detail, Onboarding modal */

/* ---------- Shared chrome ---------- */
const Sidebar = ({ active = 'services' }) => (
  <aside style={{
    width: 220, background: 'var(--bg-base)', borderRight: '1px solid var(--border-subtle)',
    padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 6,
  }}>
    <div style={{ padding: '4px 8px 10px' }}><Logo/></div>
    <button className="pulse-btn" style={{ justifyContent: 'space-between', width: '100%', background: 'var(--bg-input)', height: 28 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <Icon name="search" size={13}/>
        <span className="fg-ter t-sm">Search...</span>
      </span>
      <span className="pulse-kbd">⌘K</span>
    </button>
    <div style={{ height: 8 }}/>
    {[
      ['home','Overview','home'],
      ['services','Services','list'],
      ['statuspages','Status pages','globe'],
      ['alerts','Alerts','bell'],
      ['integrations','Integrations','plug'],
    ].map(([k, label, icon]) => (
      <div key={k} className={`pulse-nav-item${active === k ? ' active' : ''}`}>
        <Icon name={icon}/>{label}
        {k === 'alerts' && <span className="t-mono" style={{ marginLeft: 'auto', fontSize: 10, padding: '1px 5px', borderRadius: 999, background: 'var(--status-degraded-bg)', color: 'var(--status-degraded)' }}>1</span>}
      </div>
    ))}
    <div style={{ flex: 1 }}/>
    <div className="pulse-nav-item"><Icon name="cog"/>Settings</div>
    <hr className="pulse-hr" style={{ margin: '8px 0' }}/>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'oklch(0.55 0.1 30)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600, color: 'var(--fg-on-accent)' }}>RT</div>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2, minWidth: 0 }}>
        <span style={{ fontSize: 12, fontWeight: 500 }}>Rivertide</span>
        <span className="t-mono fg-qui" style={{ fontSize: 10 }}>Pro · 12/25 monitors</span>
      </div>
    </div>
  </aside>
);

const Topbar = ({ title, crumb, actions, wave = true }) => (
  <div style={{
    position: 'relative',
    height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-canvas)',
  }}>
    {wave && (
      <div style={{ position: 'absolute', inset: 0, opacity: 0.25, pointerEvents: 'none', maskImage: 'linear-gradient(90deg, transparent 0%, black 25%, black 75%, transparent 100%)' }}>
        <LiveWave width={1200} height={56} beats={6} spike={0.35} showFill={false} showMarker={false}/>
      </div>
    )}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative' }}>
      {crumb && <div className="t-mono fg-qui" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>{crumb}</div>}
      <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-0.01em' }}>{title}</div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative' }}>{actions}</div>
  </div>
);

/* ============================================================
   DASHBOARD
   ============================================================ */
const services = [
  { name: 'pulse-api',         url: 'https://api.pulse.dev/health', status: 'op',       uptime: 99.998, p95: 142, last: '12s ago', seed: 3 },
  { name: 'pulse-dashboard',   url: 'https://app.pulse.dev',        status: 'op',       uptime: 99.982, p95: 268, last: '8s ago',  seed: 7 },
  { name: 'pulse-webhooks',    url: 'https://hooks.pulse.dev',      status: 'outage',   uptime: 98.412, p95: 1820,last: '3s ago',  seed: 1 },
  { name: 'pulse-cdn',         url: 'https://cdn.pulse.dev',        status: 'degraded', uptime: 99.804, p95: 412, last: '5s ago',  seed: 5 },
  { name: 'docs.pulse.dev',    url: 'https://docs.pulse.dev',       status: 'op',       uptime: 99.999, p95: 88,  last: '11s ago', seed: 9 },
  { name: 'status.pulse.dev',  url: 'https://status.pulse.dev',     status: 'op',       uptime: 100.000,p95: 64,  last: '14s ago', seed: 11 },
  { name: 'auth.pulse.dev',    url: 'https://auth.pulse.dev',       status: 'op',       uptime: 99.961, p95: 196, last: '7s ago',  seed: 13 },
  { name: 'billing-service',   url: 'https://billing.internal',     status: 'paused',   uptime: null,   p95: null,last: 'paused',   seed: 15 },
];

const DashboardArtboard = () => (
  <div className="pulse-app" style={{ display: 'flex', height: '100%' }}>
    <Sidebar active="services"/>
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar
        title="Services"
        actions={<>
          <button className="pulse-btn"><Icon name="filter" size={12}/>Filter</button>
          <button className="pulse-btn"><Icon name="region" size={12}/>All regions<Icon name="chev" size={10}/></button>
          <button className="pulse-btn primary"><Icon name="plus" size={12}/>Add monitor</button>
        </>}
      />
      <div style={{ flex: 1, overflow: 'hidden', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MetricCard label="Monitors" value="12" unit="/25" delta={null} spark={false}/>
          <MetricCard label="Up" value="10" delta="" deltaDir="up" deltaColor="op" sparkSeed={3}/>
          <MetricCard label="Incidents · 24h" value="2" delta="1" deltaDir="down" deltaColor="op" sparkColor="var(--status-degraded)" sparkSeed={5}/>
          <MetricCard label="Avg response" value="208" unit="ms" delta="12" deltaDir="up" deltaColor="outage" sparkSeed={9}/>
        </div>

        <div className="pulse-card" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="t-h4">All services</span>
              <span className="t-mono fg-qui" style={{ fontSize: 11 }}>· 8 monitors</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="pulse-btn sm">Live</button>
              <button className="pulse-btn sm ghost">Paused</button>
              <button className="pulse-btn sm ghost">All</button>
            </div>
          </div>
          <table className="pulse-table">
            <thead>
              <tr>
                <th style={{ width: 28 }}></th>
                <th>Service</th>
                <th style={{ width: 240 }}>Uptime · 90d</th>
                <th>Response · 24h</th>
                <th style={{ width: 80 }}>p95</th>
                <th style={{ width: 90 }}>Last check</th>
                <th style={{ width: 28 }}></th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.name}>
                  <td><span className={`pulse-dot ${s.status}`}/></td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{s.name}</div>
                    <div className="t-mono fg-qui" style={{ fontSize: 11 }}>{s.url}</div>
                  </td>
                  <td>
                    {s.status === 'paused' ? (
                      <span className="t-mono fg-qui" style={{ fontSize: 11 }}>—</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <UptimeBar height={18} seed={s.seed}/>
                        <span className="t-mono fg-ter" style={{ fontSize: 10 }}>{s.uptime?.toFixed(3)}%</span>
                      </div>
                    )}
                  </td>
                  <td>{s.status !== 'paused' && <Sparkline width={140} height={26} seed={s.seed + 20}
                    color={s.status === 'outage' ? 'var(--status-outage)' : s.status === 'degraded' ? 'var(--status-degraded)' : 'var(--pulse-accent)'}/>}</td>
                  <td><span className="t-mono" style={{ fontSize: 12, color: s.p95 > 500 ? 'var(--status-outage)' : s.p95 > 300 ? 'var(--status-degraded)' : 'var(--fg-secondary)' }}>{s.p95 ? `${s.p95}ms` : '—'}</span></td>
                  <td><span className="t-mono fg-ter" style={{ fontSize: 11 }}>{s.last}</span></td>
                  <td><button className="pulse-btn ghost sm" style={{ padding: '0 4px' }}><Icon name="more"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
);

/* ============================================================
   SERVICE DETAIL
   ============================================================ */
const ServiceDetailArtboard = () => (
  <div className="pulse-app" style={{ display: 'flex', height: '100%' }}>
    <Sidebar active="services"/>
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <Topbar
        title={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
          pulse-webhooks
          <StatusBadge status="outage"/>
        </span>}
        crumb={<><span>Services</span><Icon name="chev" size={10}/><span style={{ color: 'var(--fg-secondary)' }}>pulse-webhooks</span></>}
        actions={<>
          <button className="pulse-btn"><Icon name="ext" size={12}/>Open URL</button>
          <button className="pulse-btn"><Icon name="bell" size={12}/>Pause alerts</button>
          <button className="pulse-btn"><Icon name="cog" size={12}/>Settings</button>
        </>}
      />
      <div style={{ flex: 1, overflow: 'hidden', padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12 }}>
          <Icon name="globe" size={13} color="var(--fg-tertiary)"/>
          <span className="t-mono fg-sec">GET</span>
          <span className="t-mono fg-pri">https://hooks.pulse.dev/v1/deliver</span>
          <span className="t-mono fg-qui">·</span>
          <span className="t-mono fg-ter">every 30s · 4 regions</span>
          <span style={{ flex: 1 }}/>
          <span className="t-mono fg-qui">monitor · mon_8b3e9c2</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <MetricCard label="Uptime · 90d"   value="98.412" unit="%"  delta="0.6"  deltaDir="down" deltaColor="outage" sparkSeed={1}/>
          <MetricCard label="Avg response"   value="1.82"   unit="s"  delta="1.4"  deltaDir="up"   deltaColor="outage" sparkColor="var(--status-outage)" sparkSeed={2}/>
          <MetricCard label="p95 response"   value="3.20"   unit="s"  delta="2.1"  deltaDir="up"   deltaColor="outage" sparkColor="var(--status-degraded)" sparkSeed={6}/>
          <MetricCard label="MTTR · 30d"     value="6"      unit="min" delta="2"   deltaDir="up"   deltaColor="outage" sparkColor="var(--status-degraded)" sparkSeed={8}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, minHeight: 0 }}>
          <div className="pulse-card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <div className="t-h4">Uptime</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="pulse-btn sm ghost">24h</button>
                <button className="pulse-btn sm ghost">7d</button>
                <button className="pulse-btn sm">90d</button>
              </div>
            </div>
            <UptimeBar height={48} seed={1}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <span className="t-mono fg-qui" style={{ fontSize: 10 }}>Feb 12, 2026</span>
              <span className="t-mono fg-qui" style={{ fontSize: 10 }}>May 13, 2026</span>
            </div>
            <hr className="pulse-hr" style={{ margin: '14px 0' }}/>
            <div className="t-h4" style={{ marginBottom: 8 }}>Response time</div>
            <ResponseChart width={620} height={170} seed={3} color="var(--status-outage)"/>
          </div>

          <div className="pulse-card" style={{ padding: 18, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="t-h4" style={{ marginBottom: 12 }}>Incident history</div>
            <div style={{ overflow: 'hidden' }}>
              <IncidentTimeline items={[
                { time: '13:38 UTC · today',    status: 'outage',   statusLabel: 'investigating', title: 'Webhook delivery failing', body: 'Detected 503s from queue worker pool. On-call paged.' },
                { time: '09:02 UTC · yesterday',status: 'op',       statusLabel: 'resolved',      title: 'Brief 5xx spike — auto-resolved' },
                { time: 'May 10 · 22:18',       status: 'degraded', statusLabel: 'resolved',      title: 'Elevated p95 in eu-west', body: '11-minute degradation. Single region.' },
                { time: 'May 04 · 02:00',       status: 'maint',    statusLabel: 'scheduled',     title: 'Postgres failover · 5 min window' },
              ]}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
);

/* ============================================================
   ONBOARDING MODAL
   ============================================================ */
const OnboardingArtboard = () => (
  <div className="pulse-app" style={{ display: 'grid', placeItems: 'center', padding: 24, height: '100%', background: 'oklch(0.14 0.008 240)' }}>
    <div className="surf-overlay" style={{
      width: '100%', maxWidth: 480, borderRadius: 14, border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-pop)', overflow: 'hidden',
    }}>
      <div style={{ padding: '20px 22px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="t-eyebrow" style={{ marginBottom: 4 }}>STEP 1 OF 3</div>
          <div className="t-h3">Add your first monitor</div>
        </div>
        <button className="pulse-btn ghost sm" style={{ padding: '0 6px', fontSize: 16, color: 'var(--fg-tertiary)' }}>×</button>
      </div>
      <hr className="pulse-hr"/>
      <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="t-mono fg-ter" style={{ fontSize: 11, letterSpacing: '0.05em' }}>URL</label>
          <div style={{ position: 'relative' }}>
            <span className="t-mono fg-qui" style={{ position: 'absolute', left: 10, top: 9, fontSize: 12 }}>GET</span>
            <input className="pulse-input t-mono" defaultValue="https://api.yourapp.com/health" style={{ paddingLeft: 42, fontSize: 13 }}/>
          </div>
          <span className="t-xs fg-qui">We follow redirects and accept 2xx as healthy.</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label className="t-mono fg-ter" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Name</label>
          <input className="pulse-input" defaultValue="Production API"/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="t-mono fg-ter" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Check interval</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['30s','1m','5m','15m'].map((v, i) => (
                <button key={v} className={`pulse-btn sm ${i === 0 ? '' : 'ghost'}`} style={{ flex: 1 }}>{v}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label className="t-mono fg-ter" style={{ fontSize: 11, letterSpacing: '0.05em' }}>Regions</label>
            <div style={{ display: 'flex', gap: 4 }}>
              {['us-e','us-w','eu','ap'].map((v, i) => (
                <button key={v} className={`pulse-btn sm ${i < 3 ? '' : 'ghost'}`} style={{ flex: 1, gap: 4 }}>
                  {i < 3 && <Icon name="check" size={10} color="var(--pulse-accent)"/>}{v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="surf-raised" style={{ borderRadius: 8, padding: 12, border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-mono fg-ter" style={{ fontSize: 11, letterSpacing: '0.05em' }}>ALERT WHEN</span>
            <span className="t-mono fg-qui" style={{ fontSize: 11 }}>2 of 3 checks fail</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--pulse-accent)', display: 'grid', placeItems: 'center' }}><Icon name="check" size={10} color="var(--fg-on-accent)"/></span>
              Email <span className="fg-qui">— alex@pulse.dev</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--pulse-accent)', display: 'grid', placeItems: 'center' }}><Icon name="check" size={10} color="var(--fg-on-accent)"/></span>
              Slack <span className="fg-qui">— #ops-alerts</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--fg-tertiary)' }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, border: '1px solid var(--border-default)' }}/>
              SMS <span className="fg-qui">— Pro feature</span>
            </label>
          </div>
        </div>
      </div>
      <hr className="pulse-hr"/>
      <div style={{ padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 18, height: 3, borderRadius: 2, background: i === 0 ? 'var(--pulse-accent)' : 'var(--border-subtle)' }}/>)}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="pulse-btn ghost">Skip</button>
          <button className="pulse-btn primary">Run first check <Icon name="bolt" size={11}/></button>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { DashboardArtboard, ServiceDetailArtboard, OnboardingArtboard });

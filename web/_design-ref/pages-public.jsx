/* pages-public.jsx — Marketing landing + public status page */

/* ============================================================
   LANDING PAGE
   ============================================================ */
const LandingArtboard = () => (
  <div className="pulse-app" style={{ height: '100%', overflow: 'auto' }}>
    {/* nav */}
    <nav style={{
      height: 60, padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <Logo size={20}/>
        <span className="t-mono fg-qui" style={{ fontSize: 11, padding: '2px 6px', border: '1px solid var(--border-subtle)', borderRadius: 4 }}>v2 · beta</span>
        <div style={{ display: 'flex', gap: 18, marginLeft: 16 }}>
          {['Product','Status pages','Pricing','Docs','Changelog'].map(l => (
            <a key={l} className="t-sm fg-sec" style={{ cursor: 'pointer' }}>{l}</a>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <a className="t-sm fg-sec" style={{ cursor: 'pointer' }}>Sign in</a>
        <button className="pulse-btn primary">Start free</button>
      </div>
    </nav>

    {/* hero */}
    <section style={{ padding: '72px 32px 56px', maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px', borderRadius: 999, border: '1px solid var(--border-subtle)', background: 'var(--bg-base)', marginBottom: 24 }}>
        <span className="pulse-dot op"/>
        <span className="t-mono fg-sec" style={{ fontSize: 12 }}>All Pulse systems operational · 99.998% uptime · 30d</span>
      </div>
      <h1 className="t-display" style={{ margin: 0, maxWidth: 820 }}>
        Uptime monitoring<br/>that <span style={{ color: 'var(--pulse-accent)' }}>doesn't shout</span> at you.
      </h1>
      <p className="t-body fg-sec" style={{ marginTop: 18, maxWidth: 560, fontSize: 16, lineHeight: 1.55 }}>
        HTTP checks every 30s from four regions, public status pages on your domain,
        and alerts that only fire when something is actually wrong. Built for indie devs and small teams.
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 28, alignItems: 'center' }}>
        <button className="pulse-btn primary lg">Start monitoring — free<Icon name="chev" size={12} color="var(--fg-on-accent)"/></button>
        <button className="pulse-btn lg">View live demo</button>
        <span className="t-sm fg-qui" style={{ marginLeft: 8 }}>No credit card · 10 monitors free forever</span>
      </div>

      {/* hero — signature live wave panel */}
      <div className="pulse-card" style={{ marginTop: 56, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span className="t-mono fg-ter" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-dot op" style={{ width: 6, height: 6, boxShadow: 'none' }}/>LIVE FEED
            </span>
            <span className="t-h4" style={{ fontSize: 14 }}>api.acme.dev</span>
            <StatusBadge status="op" size="sm"/>
          </div>
          <div style={{ display: 'flex', gap: 28 }}>
            <div style={{ textAlign: 'right' }}><div className="t-mono fg-pri" style={{ fontSize: 18 }}>99.998<span className="fg-qui" style={{ fontSize: 11 }}>%</span></div><div className="t-eyebrow">UPTIME · 30d</div></div>
            <div style={{ textAlign: 'right' }}><div className="t-mono fg-pri" style={{ fontSize: 18 }}>142<span className="fg-qui" style={{ fontSize: 11 }}>ms</span></div><div className="t-eyebrow">AVG · 24h</div></div>
            <div style={{ textAlign: 'right' }}><div className="t-mono fg-pri" style={{ fontSize: 18 }}>0</div><div className="t-eyebrow">INCIDENTS</div></div>
          </div>
        </div>
        <div style={{ position: 'relative', height: 160, background: 'linear-gradient(180deg, var(--bg-base), oklch(0.16 0.008 240))' }}>
          <LiveWave width={1140} height={160} beats={5} spike={0.55} status="op"/>
          <span className="t-mono" style={{ position: 'absolute', top: 12, left: 18, fontSize: 10, color: 'var(--fg-quiet)', letterSpacing: '0.08em' }}>RESPONSE TIME · last 60s</span>
          <span className="t-mono fg-qui" style={{ position: 'absolute', bottom: 8, right: 18, fontSize: 10 }}>now ▸ 142ms · us-east-1</span>
        </div>
        <div style={{ padding: '14px 20px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 18 }}>
          <UptimeBar height={20} seed={4}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 24 }}>
            <span className="t-mono fg-qui" style={{ fontSize: 10 }}>90 days</span>
            <span className="t-mono fg-qui" style={{ fontSize: 10 }}>today</span>
          </div>
        </div>
      </div>
    </section>

    {/* logos / trust */}
    <section style={{ padding: '8px 32px 40px', maxWidth: 1180, margin: '0 auto' }}>
      <div className="t-eyebrow" style={{ textAlign: 'center', marginBottom: 18 }}>TRUSTED BY 4,200+ SMALL TEAMS</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.55, padding: '0 40px' }}>
        {['Rivertide','Halfmoon','Stagework','Notari','Lumen','Patchgrid'].map(b => (
          <span key={b} className="t-mono" style={{ fontSize: 14, color: 'var(--fg-tertiary)', letterSpacing: '-0.01em' }}>{b}</span>
        ))}
      </div>
    </section>

    {/* features */}
    <section style={{ padding: '32px 32px 64px', maxWidth: 1180, margin: '0 auto' }}>
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>FEATURES</div>
      <h2 className="t-h1" style={{ margin: 0, maxWidth: 700 }}>Built around three honest jobs.</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 36 }}>
        {[
          {
            icon: 'globe',
            title: 'Check from 4 regions',
            body: 'Every 30s from us-east, us-west, eu-west, and ap-south. We only alert when 2 of 3 agree a service is down — no false pages from flaky internet.',
            footer: <UptimeBar height={14} seed={2}/>,
          },
          {
            icon: 'chart',
            title: 'Status pages on your domain',
            body: 'status.yourapp.com, no Pulse branding, embeddable widget. Subscribers get email/RSS updates the moment you post.',
            footer: <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="t-mono fg-sec" style={{ fontSize: 11 }}>status.yourapp.com</span>
              <span className="pulse-dot op"/>
            </div>,
          },
          {
            icon: 'bell',
            title: 'Alerts you can read at 3am',
            body: 'Slack, Discord, email, webhooks, SMS (Pro). Group flapping checks into a single incident. Auto-resolves when checks recover.',
            footer: <div className="t-mono fg-sec" style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="pulse-dot outage"/>503 · webhooks · 13:38 UTC
            </div>,
          },
        ].map(f => (
          <div key={f.title} className="pulse-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)', display: 'grid', placeItems: 'center', color: 'var(--pulse-accent)' }}>
              <Icon name={f.icon} size={16}/>
            </div>
            <div className="t-h4" style={{ fontSize: 16 }}>{f.title}</div>
            <div className="t-sm fg-sec" style={{ flex: 1 }}>{f.body}</div>
            <div style={{ paddingTop: 10, borderTop: '1px solid var(--border-subtle)' }}>{f.footer}</div>
          </div>
        ))}
      </div>
    </section>

    {/* pricing */}
    <section style={{ padding: '32px 32px 96px', maxWidth: 1180, margin: '0 auto' }}>
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>PRICING</div>
      <h2 className="t-h1" style={{ margin: 0 }}>Two plans. No seats.</h2>
      <p className="t-body fg-sec" style={{ marginTop: 8, maxWidth: 500 }}>Free tier is genuinely free — no trial, no card. Pro is one flat fee for the whole team.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 32, maxWidth: 820 }}>
        {/* Free */}
        <div className="pulse-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-h3">Free</span>
            <span className="t-mono fg-qui" style={{ fontSize: 11 }}>for indie devs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="t-mono" style={{ fontSize: 40, fontWeight: 500 }}>$0</span>
            <span className="t-mono fg-ter">/forever</span>
          </div>
          <button className="pulse-btn" style={{ width: '100%', justifyContent: 'center' }}>Start free</button>
          <hr className="pulse-hr"/>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            {[
              '10 HTTP monitors',
              '3-minute check interval',
              '1 region',
              'Email alerts',
              '1 public status page · Pulse subdomain',
              '90 days of history',
            ].map(f => (
              <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon name="check" size={11} color="var(--pulse-accent)"/>
                <span className="fg-sec">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Pro */}
        <div className="pulse-card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, position: 'relative', border: '1px solid var(--pulse-accent-quiet)' }}>
          <span style={{ position: 'absolute', top: -10, right: 16, background: 'var(--pulse-accent)', color: 'var(--fg-on-accent)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 999, letterSpacing: '0.08em' }}>POPULAR</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="t-h3">Pro</span>
            <span className="t-mono fg-qui" style={{ fontSize: 11 }}>for small teams</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span className="t-mono" style={{ fontSize: 40, fontWeight: 500 }}>$19</span>
            <span className="t-mono fg-ter">/month, flat</span>
          </div>
          <button className="pulse-btn primary" style={{ width: '100%', justifyContent: 'center' }}>Start 14-day trial</button>
          <hr className="pulse-hr"/>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
            {[
              'Unlimited HTTP & TCP monitors',
              '30-second check interval',
              '4 regions, multi-region quorum',
              'Slack, Discord, SMS, webhooks',
              'Status pages on your domain · no branding',
              'Unlimited team seats',
              '2 years of history',
            ].map(f => (
              <li key={f} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Icon name="check" size={11} color="var(--pulse-accent)"/>
                <span className="fg-sec">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  </div>
);

/* ============================================================
   PUBLIC STATUS PAGE
   ============================================================ */
const StatusPageArtboard = () => {
  const components = [
    { name: 'API',              desc: 'Public REST API · api.acme.dev',         status: 'op',       uptime: 99.998, seed: 3 },
    { name: 'Dashboard',        desc: 'Web app · app.acme.dev',                 status: 'op',       uptime: 99.982, seed: 7 },
    { name: 'Webhook delivery', desc: 'Outbound webhooks to customer endpoints',status: 'outage',   uptime: 98.412, seed: 1 },
    { name: 'Asset CDN',        desc: 'Static assets · cdn.acme.dev',           status: 'degraded', uptime: 99.804, seed: 5 },
    { name: 'Authentication',   desc: 'OAuth & sessions',                       status: 'op',       uptime: 99.961, seed: 13 },
  ];
  const worst = components.some(c => c.status === 'outage') ? 'outage'
              : components.some(c => c.status === 'degraded') ? 'degraded' : 'op';
  const headline = { op: 'All systems operational', degraded: 'Partial degradation', outage: 'Active incident in progress' }[worst];
  return (
    <div className="pulse-app" style={{ height: '100%', overflow: 'auto' }}>
      <div style={{ maxWidth: 880, margin: '0 auto', padding: '40px 32px 64px' }}>
        {/* header */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 7, background: 'oklch(0.55 0.1 30)', display: 'grid', placeItems: 'center', color: 'var(--fg-on-accent)', fontWeight: 700, fontSize: 13 }}>A</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>Acme</div>
              <div className="t-mono fg-qui" style={{ fontSize: 11 }}>status.acme.dev</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="pulse-btn sm"><Icon name="bell" size={11}/>Subscribe</button>
            <button className="pulse-btn sm ghost">History</button>
          </div>
        </header>

        {/* big status banner */}
        <div className="pulse-card" style={{
          padding: 22, display: 'flex', alignItems: 'center', gap: 18,
          border: `1px solid ${worst === 'outage' ? 'oklch(0.50 0.15 22 / 0.5)' : worst === 'degraded' ? 'oklch(0.50 0.12 84 / 0.5)' : 'oklch(0.45 0.13 152 / 0.5)'}`,
          background: `${worst === 'outage' ? 'var(--status-outage-bg)' : worst === 'degraded' ? 'var(--status-degraded-bg)' : 'var(--status-op-bg)'}`,
        }}>
          <span className={`pulse-dot ${worst}`} style={{ width: 14, height: 14, boxShadow: '0 0 0 6px ' + (worst === 'outage' ? 'var(--status-outage-bg)' : worst === 'degraded' ? 'var(--status-degraded-bg)' : 'var(--status-op-bg)') }}/>
          <div style={{ flex: 1 }}>
            <div className="t-h2" style={{ fontSize: 22 }}>{headline}</div>
            <div className="t-sm fg-sec" style={{ marginTop: 2 }}>Updated May 13, 2026 · 14:02 UTC · refreshes every 60s</div>
          </div>
          <div className="t-mono" style={{ fontSize: 13, color: 'var(--fg-secondary)', textAlign: 'right' }}>
            <div style={{ fontSize: 24, color: 'var(--fg-primary)' }}>99.842<span className="fg-qui" style={{ fontSize: 13 }}>%</span></div>
            <div className="t-eyebrow">UPTIME · 90d</div>
          </div>
        </div>

        {/* components */}
        <section style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="t-h3">Components</h3>
            <span className="t-mono fg-qui" style={{ fontSize: 11 }}>last 90 days</span>
          </div>
          <div className="pulse-card" style={{ padding: 0 }}>
            {components.map((c, i) => (
              <div key={c.name} style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: i < components.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <span className={`pulse-dot ${c.status}`}/>
                <div style={{ width: 200 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</div>
                  <div className="t-sm fg-qui">{c.desc}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <UptimeBar height={22} seed={c.seed}/>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div className="t-mono" style={{ fontSize: 13 }}>{c.uptime.toFixed(2)}%</div>
                  <div className="t-mono fg-qui" style={{ fontSize: 10 }}>{c.status === 'op' ? 'operational' : c.status}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* active incident */}
        <section style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 className="t-h3">Active incident</h3>
            <a className="t-mono fg-ter" style={{ fontSize: 11, cursor: 'pointer' }}>View full history →</a>
          </div>
          <div className="pulse-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <StatusBadge status="outage" label="Investigating" size="sm"/>
              <span className="t-mono fg-qui" style={{ fontSize: 11 }}>started 14:02 UTC · 24 min ago</span>
            </div>
            <div className="t-h3" style={{ fontSize: 18 }}>Webhook delivery is failing</div>
            <p className="t-sm fg-sec" style={{ marginTop: 6, maxWidth: 620 }}>
              We're seeing elevated 503 responses from our queue worker pool. Outbound webhooks may be delayed
              or fail. The dashboard and API are unaffected. Engineers are investigating.
            </p>
            <div style={{ marginTop: 16 }}>
              <IncidentTimeline items={[
                { time: '14:18 UTC', status: 'degraded', statusLabel: 'identified', title: 'Root cause identified', body: 'Stuck connection pool in queue worker. Rolling restart in progress.' },
                { time: '14:08 UTC', status: 'outage',   statusLabel: 'investigating', title: 'Engineers paged', body: 'On-call acknowledged. Looking at metrics now.' },
                { time: '14:02 UTC', status: 'outage',   statusLabel: 'detected',     title: 'Automated detection', body: '3 consecutive failures across 3 regions.' },
              ]}/>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: 40, paddingTop: 18, borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
          <span className="t-mono fg-qui" style={{ fontSize: 11 }}>© Acme · status page powered by Pulse</span>
          <span className="t-mono fg-qui" style={{ fontSize: 11 }}>Atom · RSS · JSON</span>
        </footer>
      </div>
    </div>
  );
};

Object.assign(window, { LandingArtboard, StatusPageArtboard });

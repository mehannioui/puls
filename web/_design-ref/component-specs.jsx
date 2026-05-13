/* component-specs.jsx — Component spec artboards */

const SpecHeader = ({ eyebrow, title, desc }) => (
  <div style={{ marginBottom: 18 }}>
    <div className="t-eyebrow" style={{ marginBottom: 4 }}>{eyebrow}</div>
    <div className="t-h3">{title}</div>
    {desc && <div className="t-sm fg-ter" style={{ marginTop: 4, maxWidth: 520 }}>{desc}</div>}
  </div>
);

const Cell = ({ label, children, style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
    <span className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{children}</div>
  </div>
);

/* ---------- Status badge spec ---------- */
const BadgeSpecArtboard = () => (
  <div className="pulse-app" style={{ padding: 28, height: '100%', overflow: 'hidden' }}>
    <SpecHeader eyebrow="02 · Component" title="Status badge" desc="Pill with leading dot. Five states. Available in sm (18px) and md (22px). The op state pulses on live surfaces."/>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, rowGap: 22 }}>
      <Cell label="md · five states">
        <StatusBadge status="op"/>
        <StatusBadge status="degraded"/>
        <StatusBadge status="outage"/>
        <StatusBadge status="maint"/>
        <StatusBadge status="paused"/>
      </Cell>
      <Cell label="sm">
        <StatusBadge status="op"   size="sm"/>
        <StatusBadge status="degraded" size="sm"/>
        <StatusBadge status="outage" size="sm"/>
      </Cell>
      <Cell label="dot only (inline w/ text)">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span className="pulse-dot op"/> api.pulse.dev
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span className="pulse-dot degraded"/> dashboard
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
          <span className="pulse-dot outage"/> webhooks
        </span>
      </Cell>
      <Cell label="custom label">
        <StatusBadge status="op" label="200 · 142ms"/>
        <StatusBadge status="outage" label="503 · timeout"/>
      </Cell>
    </div>

    <div className="pulse-card" style={{ padding: 14, marginTop: 22 }}>
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>Usage</div>
      <pre className="t-mono" style={{ margin: 0, fontSize: 11, lineHeight: 1.55, color: 'var(--fg-secondary)' }}>{`<StatusBadge :status="'op'" />            <!-- Operational -->
<StatusBadge :status="'degraded'" />      <!-- Degraded -->
<StatusBadge :status="'outage'" />        <!-- Outage -->
<StatusBadge :status="'maint'" />         <!-- Maintenance -->`}</pre>
    </div>
  </div>
);

/* ---------- Uptime bar spec ---------- */
const UptimeSpecArtboard = () => (
  <div className="pulse-app" style={{ padding: 28, height: '100%', overflow: 'hidden' }}>
    <SpecHeader eyebrow="02 · Component" title="Uptime bar — 90 days"
      desc="One segment per day. Color encodes the worst event observed in that day. Segment flexes to container; min-width 3px. Heights: 18 / 28 / 40."/>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <span className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>40px · full detail</span>
          <span className="t-mono fg-ter" style={{ fontSize: 11 }}>99.982% · 90d</span>
        </div>
        <UptimeBar height={40} seed={7}/>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
          <span className="t-mono fg-qui" style={{ fontSize: 10 }}>90 days ago</span>
          <span className="t-mono fg-qui" style={{ fontSize: 10 }}>today</span>
        </div>
      </div>

      <div>
        <div className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>28px · default</div>
        <UptimeBar seed={4}/>
      </div>

      <div>
        <div className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>18px · inline</div>
        <UptimeBar height={18} seed={9}/>
      </div>

      <div className="pulse-card" style={{ padding: 14 }}>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Legend</div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          {[
            ['op','Operational'],['degraded','Degraded (>1 timeout in window)'],
            ['outage','Outage (3+ consecutive failures)'],['maint','Scheduled maintenance'],['nodata','No data']
          ].map(([k,v]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ width: 14, height: 14, borderRadius: 2, background: k === 'nodata' ? 'var(--bg-overlay)' : `var(--status-${k})` }}/>
              <span className="fg-sec">{v}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ---------- Metric card spec ---------- */
const MetricCardSpecArtboard = () => (
  <div className="pulse-app" style={{ padding: 28, height: '100%', overflow: 'hidden' }}>
    <SpecHeader eyebrow="02 · Component" title="Metric card"
      desc="Eyebrow label, big mono value, optional delta indicator, optional sparkline. Cards align on a 4-up grid; collapse to 2-up on narrow screens."/>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      <MetricCard label="Uptime · 30d" value="99.982" unit="%" delta="0.04" deltaDir="up" deltaColor="op" sparkSeed={2}/>
      <MetricCard label="Avg response" value="142" unit="ms" delta="8.1" deltaDir="down" deltaColor="op" sparkSeed={5}/>
      <MetricCard label="Incidents · 24h" value="1" delta="2" deltaDir="down" deltaColor="op" sparkColor="var(--status-degraded)" sparkSeed={8}/>
      <MetricCard label="p95 response" value="312" unit="ms" delta="14" deltaDir="up" deltaColor="outage" sparkColor="var(--status-degraded)" sparkSeed={11}/>
    </div>

    <div className="pulse-card" style={{ padding: 14, marginTop: 18 }}>
      <div className="t-eyebrow" style={{ marginBottom: 8 }}>Anatomy</div>
      <div className="t-sm fg-sec" style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 14px' }}>
        <span className="t-mono fg-qui">label</span><span>11px mono, uppercase, 0.12em tracking, --fg-tertiary</span>
        <span className="t-mono fg-qui">value</span><span>26px mono, weight 500, tight</span>
        <span className="t-mono fg-qui">delta</span><span>11px mono, paired arrow icon, semantic color</span>
        <span className="t-mono fg-qui">spark</span><span>180×28, 1.2px line, 0.12 fill, brand color (or status hue)</span>
      </div>
    </div>
  </div>
);

/* ---------- Timeline spec ---------- */
const TimelineSpecArtboard = () => (
  <div className="pulse-app" style={{ padding: 28, height: '100%', overflow: 'hidden' }}>
    <SpecHeader eyebrow="02 · Component" title="Incident timeline"
      desc="Reverse-chronological feed. Each event has a status-colored dot on a vertical rail, mono timestamp, status pill, headline, and an optional body."/>
    <div className="pulse-card" style={{ padding: 18 }}>
      <IncidentTimeline items={[
        { time: '14:02 UTC · today', status: 'op', statusLabel: 'resolved', title: 'API latency back to baseline', body: 'p95 returned under 300ms after upstream provider restored capacity. Auto-resolved.' },
        { time: '13:41 UTC · today', status: 'degraded', title: 'Elevated response times on /api/v1/*', body: 'p95 spiked to 980ms. Affected ~12% of requests from us-east region.' },
        { time: '13:38 UTC · today', status: 'outage', statusLabel: 'investigating', title: 'Webhook delivery failing', body: 'Detected 503s from queue worker pool. Paged on-call.' },
        { time: 'Mar 12 · 09:14',    status: 'maint', statusLabel: 'scheduled', title: 'Database failover · 5 min window', body: 'Planned read-only window for Postgres major version upgrade.' },
      ]}/>
    </div>
  </div>
);

/* ---------- LiveWave spec ---------- */
const WaveSpecArtboard = () => (
  <div className="pulse-app" style={{ padding: 28, height: '100%', overflow: 'hidden' }}>
    <SpecHeader eyebrow="02 · Signature" title="Live waveform"
      desc="Pulse's signature ambient element. ECG-style scrolling path that ties the brand to the product's name. Appears in the topbar (subtle), service detail (functional), and incident war-room (loud). Inherits status color."/>

    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>chrome · 32px · ambient</div>
        <div style={{ height: 32, background: 'var(--bg-canvas)', borderRadius: 6, overflow: 'hidden' }}>
          <LiveWave width={520} height={32} beats={4} spike={0.3} showFill={false} showMarker={false}/>
        </div>
      </div>
      <div>
        <div className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>panel · 80px · operational</div>
        <div style={{ height: 80, background: 'var(--bg-canvas)', borderRadius: 8, overflow: 'hidden' }}>
          <LiveWave width={520} height={80} beats={4} spike={0.55} status="op"/>
        </div>
      </div>
      <div>
        <div className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>panel · 80px · degraded</div>
        <div style={{ height: 80, background: 'var(--bg-canvas)', borderRadius: 8, overflow: 'hidden' }}>
          <LiveWave width={520} height={80} beats={4} spike={0.65} status="degraded"/>
        </div>
      </div>
      <div>
        <div className="t-mono fg-qui" style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>panel · 80px · outage</div>
        <div style={{ height: 80, background: 'var(--bg-canvas)', borderRadius: 8, overflow: 'hidden' }}>
          <LiveWave width={520} height={80} beats={4} spike={0.75} status="outage"/>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { BadgeSpecArtboard, UptimeSpecArtboard, MetricCardSpecArtboard, TimelineSpecArtboard, WaveSpecArtboard });

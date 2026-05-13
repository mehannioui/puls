/* primitives.jsx — Pulse design system primitives
   Exports: StatusDot, StatusBadge, UptimeBar, Sparkline, MetricCard,
   IncidentTimeline, Icon, MiniChart, Logo
*/

const { useState, useMemo } = React;

/* ---------- Icons (line, 14px) ---------- */
const ICONS = {
  pulse: <path d="M1 8 H4 L6 3 L10 13 L12 8 H15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>,
  home:  <path d="M2 7 L8 2 L14 7 V14 H10 V10 H6 V14 H2 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>,
  list:  <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 4h9M5 8h9M5 12h9"/><circle cx="2.5" cy="4" r=".6" fill="currentColor"/><circle cx="2.5" cy="8" r=".6" fill="currentColor"/><circle cx="2.5" cy="12" r=".6" fill="currentColor"/></g>,
  globe: <g fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="5.5"/><path d="M2.5 8h11M8 2.5c2 2 2 9 0 11M8 2.5c-2 2-2 9 0 11"/></g>,
  bell:  <path d="M8 2 C6 2 4.5 3.5 4.5 6 V9 L3 11h10L11.5 9V6C11.5 3.5 10 2 8 2 Z M6.5 13a1.5 1.5 0 0 0 3 0" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>,
  plug:  <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"><path d="M5 2v3M11 2v3M3.5 5h9v3a4.5 4.5 0 0 1-9 0z"/><path d="M8 12.5V14.5"/></g>,
  cog:   <g fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.6 3.4l-1.4 1.4M4.8 11.2l-1.4 1.4M12.6 12.6l-1.4-1.4M4.8 4.8L3.4 3.4"/></g>,
  search:<g fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5l3 3"/></g>,
  plus:  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>,
  arrowUp: <path d="M8 13V3M4 7l4-4 4 4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>,
  arrowDown:<path d="M8 3v10M4 9l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round"/>,
  check: <path d="M3 8.5l3.5 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>,
  copy:  <g fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M3 11V3a1 1 0 0 1 1-1h7"/></g>,
  ext:   <g fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 3h4v4M13 3l-6 6M7 4H3v9h9V9"/></g>,
  more:  <g fill="currentColor"><circle cx="3" cy="8" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="13" cy="8" r="1.2"/></g>,
  filter:<path d="M2 3h12l-4.5 6v4l-3 1.5V9z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>,
  bolt:  <path d="M9 2 L3 9 H7 L7 14 L13 7 H9 Z" fill="currentColor"/>,
  chev:  <path d="M5 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>,
  chart: <g fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M2 14V2"/><path d="M2 14h12"/><path d="M5 11l3-4 2 2 4-5"/></g>,
  ssl:   <g fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5 7V4.5a3 3 0 0 1 6 0V7"/></g>,
  region:<g fill="none" stroke="currentColor" strokeWidth="1.4"><circle cx="8" cy="8" r="6"/><path d="M8 2v12M2 8h12M8 2c2 2 2 10 0 12M8 2c-2 2-2 10 0 12"/></g>,
  shield:<path d="M8 2 L13 4 V8 C13 11 10.5 13 8 14 C5.5 13 3 11 3 8 V4 Z" fill="none" stroke="currentColor" strokeWidth="1.4"/>,
};
const Icon = ({ name, size = 14, color, style }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ color, flex: '0 0 auto', ...style }} aria-hidden>{ICONS[name]}</svg>
);

/* ---------- Logo ---------- */
const Logo = ({ size = 18, withWordmark = true, color }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: color || 'var(--fg-primary)' }}>
    <svg width={size} height={size} viewBox="0 0 24 24">
      <rect x="1" y="1" width="22" height="22" rx="6" fill="var(--bg-raised)" stroke="var(--border-default)"/>
      <path d="M3 12 H7 L9.5 6 L14 18 L16.5 12 H21" fill="none" stroke="var(--pulse-brand)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
    {withWordmark && <span style={{ fontWeight: 600, fontSize: size * 0.9, letterSpacing: '-0.01em' }}>Pulse</span>}
  </span>
);

/* ---------- LiveWave — signature ambient waveform ----------
   Static path data (mostly flat with periodic ECG-style beats).
   The path is doubled and scroll-animated, so it reads as a live
   feed without us re-rendering JS frames.
*/
function buildWavePath(width, height, opts = {}) {
  const { beats = 4, spike = 0.55, dipBefore = 0.10 } = opts;
  const mid = height / 2;
  const beatStep = width / beats;
  let d = `M0,${mid}`;
  for (let i = 0; i < beats; i++) {
    const x0 = i * beatStep;
    // gentle drift baseline
    d += ` L${x0 + beatStep * 0.20},${mid + (i % 2 ? -1 : 1) * 1}`;
    d += ` L${x0 + beatStep * 0.30},${mid}`;
    // ECG beat
    const cx = x0 + beatStep * 0.42;
    d += ` L${cx - beatStep * 0.025},${mid}`;
    d += ` L${cx - beatStep * 0.015},${mid + height * dipBefore}`;
    d += ` L${cx},${mid - height * spike}`;
    d += ` L${cx + beatStep * 0.015},${mid + height * dipBefore * 0.6}`;
    d += ` L${cx + beatStep * 0.030},${mid}`;
    d += ` L${x0 + beatStep},${mid}`;
  }
  return d;
}

const LiveWave = ({
  width = 720, height = 64,
  status = 'op',                  // 'op' | 'degraded' | 'outage'
  beats = 4,
  showFill = true,
  showMarker = true,
  scroll = true,
  spike = 0.55,
}) => {
  const d = buildWavePath(width, height, { beats, spike });
  // doubled path so the animation loops seamlessly
  const dDouble = d + ` M${width},${height/2} ` + buildWavePath(width, height, { beats, spike }).slice(1);
  return (
    <svg className={`pulse-wave ${status}`} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden>
      {/* grid */}
      <g opacity="0.4">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1={(width / 8) * i} x2={(width / 8) * i} y1="0" y2={height} stroke="var(--border-subtle)" strokeWidth="0.5"/>
        ))}
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="2 4"/>
      </g>
      {/* scrolling path */}
      <g className={scroll ? 'wave-scroll' : ''}>
        {showFill && <path className="wave-fill" d={`${d} L${width},${height} L0,${height} Z`}/>}
        <path className="wave-line" d={dDouble}/>
      </g>
      {showMarker && <>
        <circle className="wave-glow"   cx={width - 12} cy={height/2} r="14"/>
        <circle className="wave-marker" cx={width - 12} cy={height/2} r="3"/>
      </>}
    </svg>
  );
};

/* ---------- Status ---------- */
const StatusBadge = ({ status = 'op', label, size = 'md' }) => {
  const labels = { op: 'Operational', degraded: 'Degraded', outage: 'Outage', maint: 'Maintenance', paused: 'Paused' };
  return (
    <span className={`pulse-badge ${status}`} style={size === 'sm' ? { height: 18, fontSize: 11 } : {}}>
      <span className={`pulse-dot ${status}`} style={{ width: size === 'sm' ? 6 : 7, height: size === 'sm' ? 6 : 7, boxShadow: 'none' }}/>
      {label || labels[status]}
    </span>
  );
};

/* ---------- Uptime bar (90-day) ---------- */
// deterministic pseudo-data
function makeUptime(seed = 1, days = 90) {
  const out = [];
  let r = seed;
  for (let i = 0; i < days; i++) {
    r = (r * 9301 + 49297) % 233280;
    const v = r / 233280;
    let status = 'op';
    if (v < 0.012) status = 'outage';
    else if (v < 0.05) status = 'degraded';
    out.push({ day: i, status, uptime: status === 'op' ? 100 : status === 'degraded' ? 99.2 : 92.4 });
  }
  return out;
}

const UptimeBar = ({ data, days = 90, height = 28, seed = 3 }) => {
  const segs = data || makeUptime(seed, days);
  return (
    <div className="pulse-uptime" style={{ height }}>
      {segs.map((s, i) => <div key={i} className={`seg ${s.status}`} title={`Day -${segs.length - i}`}/>)}
    </div>
  );
};

/* ---------- Sparkline ---------- */
function makeSeries(seed = 1, n = 32, base = 180, amp = 40) {
  const out = []; let r = seed;
  for (let i = 0; i < n; i++) {
    r = (r * 9301 + 49297) % 233280;
    out.push(base + (r / 233280 - 0.5) * amp + Math.sin(i * 0.6) * 8);
  }
  return out;
}

const Sparkline = ({ data, width = 96, height = 24, color = 'var(--pulse-accent)', fill = true, seed = 2 }) => {
  const series = data || makeSeries(seed, 32);
  const min = Math.min(...series), max = Math.max(...series);
  const range = max - min || 1;
  const step = width / (series.length - 1);
  const pts = series.map((v, i) => [i * step, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const dFill = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      {fill && <path d={dFill} fill={color} opacity="0.12"/>}
      <path d={d} fill="none" stroke={color} strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
};

/* ---------- Metric card ---------- */
const MetricCard = ({ label, value, unit, delta, deltaDir = 'up', deltaColor = 'op', spark = true, sparkSeed = 1, sparkColor = 'var(--pulse-accent)' }) => (
  <div className="pulse-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="t-eyebrow">{label}</span>
      {delta && (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontFamily: 'var(--font-mono)', fontSize: 11,
          color: deltaColor === 'op' ? 'var(--status-op)' : deltaColor === 'outage' ? 'var(--status-outage)' : 'var(--fg-tertiary)' }}>
          <Icon name={deltaDir === 'up' ? 'arrowUp' : 'arrowDown'} size={10}/>{delta}
        </span>
      )}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span className="t-mono" style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-0.01em' }}>{value}</span>
      {unit && <span className="t-mono fg-ter" style={{ fontSize: 13 }}>{unit}</span>}
    </div>
    {spark && <div style={{ marginTop: 2 }}><Sparkline width={180} height={28} seed={sparkSeed} color={sparkColor}/></div>}
  </div>
);

/* ---------- Mini line+grid chart (response time) ---------- */
const ResponseChart = ({ width = 720, height = 200, seed = 11, color = 'var(--pulse-accent)' }) => {
  const data = makeSeries(seed, 90, 220, 80);
  const min = Math.min(...data) - 20, max = Math.max(...data) + 20;
  const range = max - min;
  const pad = { l: 36, r: 8, t: 12, b: 22 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => [pad.l + i * step, pad.t + h - ((v - min) / range) * h]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const dFill = `${d} L${pad.l + w},${pad.t + h} L${pad.l},${pad.t + h} Z`;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => min + range * (1 - t));
  return (
    <svg width={width} height={height}>
      {/* grid */}
      <g className="chart-grid">
        {yTicks.map((_, i) => (
          <line key={i} x1={pad.l} x2={pad.l + w} y1={pad.t + (h * i) / 4} y2={pad.t + (h * i) / 4}/>
        ))}
      </g>
      {/* y labels */}
      <g fontSize="10" fill="var(--fg-quiet)" fontFamily="var(--font-mono)">
        {yTicks.map((v, i) => (
          <text key={i} x={pad.l - 6} y={pad.t + (h * i) / 4 + 3} textAnchor="end">{Math.round(v)}</text>
        ))}
      </g>
      {/* line */}
      <path d={dFill} fill={color} opacity="0.1"/>
      <path d={d} fill="none" stroke={color} strokeWidth="1.4"/>
      {/* p95 line */}
      <line x1={pad.l} x2={pad.l + w} y1={pad.t + h * 0.28} y2={pad.t + h * 0.28} stroke="var(--status-degraded)" strokeDasharray="3 3" strokeWidth="1" opacity="0.6"/>
      <text x={pad.l + w - 4} y={pad.t + h * 0.28 - 4} textAnchor="end" fontSize="10" fontFamily="var(--font-mono)" fill="var(--status-degraded)">p95 312ms</text>
      {/* x labels */}
      <g fontSize="10" fill="var(--fg-quiet)" fontFamily="var(--font-mono)">
        {['90d','60d','30d','now'].map((l, i) => (
          <text key={l} x={pad.l + (w * i) / 3} y={height - 4}>{l}</text>
        ))}
      </g>
    </svg>
  );
};

/* ---------- Incident timeline ---------- */
const IncidentTimeline = ({ items }) => (
  <ol style={{ listStyle: 'none', margin: 0, padding: 0, position: 'relative' }}>
    <span style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 1, background: 'var(--border-subtle)' }}/>
    {items.map((it, i) => (
      <li key={i} style={{ position: 'relative', paddingLeft: 26, paddingBottom: i === items.length - 1 ? 0 : 18 }}>
        <span className={`pulse-dot ${it.status}`} style={{ position: 'absolute', left: 3, top: 6, boxShadow: '0 0 0 3px var(--bg-base)' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <span className="t-mono fg-ter" style={{ fontSize: 11 }}>{it.time}</span>
          <span className="t-mono" style={{
            fontSize: 10, padding: '1px 6px', borderRadius: 999,
            color: it.status === 'op' ? 'var(--status-op)' : it.status === 'outage' ? 'var(--status-outage)' : 'var(--status-degraded)',
            background: it.status === 'op' ? 'var(--status-op-bg)' : it.status === 'outage' ? 'var(--status-outage-bg)' : 'var(--status-degraded-bg)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
          }}>{it.statusLabel || it.status}</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--fg-primary)' }}>{it.title}</div>
        {it.body && <div className="t-sm fg-ter" style={{ marginTop: 2 }}>{it.body}</div>}
      </li>
    ))}
  </ol>
);

Object.assign(window, {
  Icon, Logo, StatusBadge, UptimeBar, Sparkline, MetricCard, ResponseChart, IncidentTimeline,
  LiveWave, makeUptime, makeSeries,
});

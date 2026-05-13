/* tokens.jsx — Color palette + Type scale artboards */

const Swatch = ({ name, value, varName, fg = 'var(--fg-primary)', textOnSwatch }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <div style={{
      height: 64, borderRadius: 8, background: value, border: '1px solid var(--border-subtle)',
      display: 'flex', alignItems: 'flex-end', padding: 8,
    }}>
      {textOnSwatch && <span className="t-mono" style={{ fontSize: 11, color: textOnSwatch }}>{textOnSwatch}</span>}
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--fg-primary)' }}>{name}</span>
      <span className="t-mono fg-ter" style={{ fontSize: 11 }}>{varName}</span>
    </div>
  </div>
);

const ColorTokensArtboard = () => (
  <div className="pulse-app" style={{ padding: 32, height: '100%', overflow: 'hidden' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 4 }}>01 · Foundations</div>
        <div className="t-h2">Color</div>
        <div className="t-sm fg-ter" style={{ marginTop: 4, maxWidth: 560 }}>
          Cool-neutral dark palette tuned in oklch. Three surface levels, three text levels, four status hues.
          Use the brand accent sparingly — it doubles as the operational status color.
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Surface</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <Swatch name="Canvas"  varName="--bg-canvas"  value="var(--bg-canvas)"/>
          <Swatch name="Base"    varName="--bg-base"    value="var(--bg-base)"/>
          <Swatch name="Raised"  varName="--bg-raised"  value="var(--bg-raised)"/>
          <Swatch name="Overlay" varName="--bg-overlay" value="var(--bg-overlay)"/>
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Border & Text</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          <Swatch name="Subtle"   varName="--border-subtle"  value="var(--border-subtle)"/>
          <Swatch name="Default"  varName="--border-default" value="var(--border-default)"/>
          <Swatch name="Strong"   varName="--border-strong"  value="var(--border-strong)"/>
          <Swatch name="Primary"  varName="--fg-primary"     value="var(--fg-primary)"   textOnSwatch="Aa"/>
          <Swatch name="Secondary"varName="--fg-secondary"   value="var(--fg-secondary)" textOnSwatch="Aa"/>
          <Swatch name="Tertiary" varName="--fg-tertiary"    value="var(--fg-tertiary)"  textOnSwatch="Aa"/>
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 10 }}>Status & Brand</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 14 }}>
          <Swatch name="Brand · Pulse aqua" varName="--pulse-brand" value="var(--pulse-brand)"/>
          <Swatch name="Operational" varName="--status-op" value="var(--status-op)"/>
          <Swatch name="Degraded" varName="--status-degraded" value="var(--status-degraded)"/>
          <Swatch name="Outage"   varName="--status-outage"   value="var(--status-outage)"/>
          <Swatch name="Maintenance" varName="--status-maint" value="var(--status-maint)"/>
          <Swatch name="Paused"   varName="--status-paused"   value="var(--status-paused)"/>
        </div>
        <div className="t-sm fg-ter" style={{ marginTop: 10, maxWidth: 620 }}>
          Brand and operational are deliberately split. Brand (cyan-teal) carries product identity — logo, primary CTA,
          live waveform, focus rings. Status colors live in their own semantic world. They sit ~43° apart in hue
          so they read as different things, never compete for the eye.
        </div>
      </div>

      <div className="pulse-card" style={{ padding: 14, marginTop: 4 }}>
        <div className="t-eyebrow" style={{ marginBottom: 8 }}>Tailwind config</div>
        <pre className="t-mono" style={{
          margin: 0, fontSize: 11, lineHeight: 1.55, color: 'var(--fg-secondary)', whiteSpace: 'pre-wrap',
        }}>{`// tailwind.config.ts → theme.extend.colors
canvas:  'var(--bg-canvas)',
base:    'var(--bg-base)',
raised:  'var(--bg-raised)',
brand:   { DEFAULT: 'var(--pulse-brand)', quiet: 'var(--pulse-brand-quiet)' },
status:  { op: 'var(--status-op)', degraded: 'var(--status-degraded)', outage: 'var(--status-outage)', maint: 'var(--status-maint)' },`}</pre>
      </div>
    </div>
  </div>
);

/* ---------- Type ---------- */
const TypeRow = ({ size, label, sample, mono }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 120px', alignItems: 'baseline', gap: 18, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
    <span className="t-mono fg-ter" style={{ fontSize: 11 }}>{label}</span>
    <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontSize: size.px, lineHeight: size.lh, fontWeight: size.w, letterSpacing: size.tr || '-0.012em' }}>
      {sample}
    </span>
    <span className="t-mono fg-qui" style={{ fontSize: 11, textAlign: 'right' }}>{size.px}/{Math.round(size.px * size.lh)}px · {size.w}</span>
  </div>
);

const TypeTokensArtboard = () => (
  <div className="pulse-app" style={{ padding: 32, height: '100%', overflow: 'hidden' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div>
        <div className="t-eyebrow" style={{ marginBottom: 4 }}>01 · Foundations</div>
        <div className="t-h2">Type</div>
        <div className="t-sm fg-ter" style={{ marginTop: 4, maxWidth: 560 }}>
          Geist Sans for UI, Geist Mono for everything numeric: metrics, durations, IDs, timestamps, code.
          Mono numerals tabular by default (cv11 + ss06).
        </div>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 4 }}>Sans · Geist</div>
        <TypeRow label="display" size={{ px: 52, lh: 1.05, w: 600, tr: '-0.025em' }} sample="Uptime, by default."/>
        <TypeRow label="h1"      size={{ px: 38, lh: 1.1,  w: 600 }} sample="All systems operational"/>
        <TypeRow label="h2"      size={{ px: 28, lh: 1.2,  w: 600 }} sample="Production API"/>
        <TypeRow label="h3"      size={{ px: 20, lh: 1.3,  w: 600 }} sample="Recent incidents"/>
        <TypeRow label="body"    size={{ px: 14, lh: 1.5,  w: 400 }} sample="HTTP checks run every 30s from 4 regions. We alert on two consecutive failures so you don't get paged for a hiccup."/>
        <TypeRow label="small"   size={{ px: 13, lh: 1.45, w: 400 }} sample="Last checked 12 seconds ago"/>
        <TypeRow label="xs"      size={{ px: 12, lh: 1.4,  w: 400 }} sample="Updated Mar 14, 2026 — 14:02 UTC"/>
      </div>

      <div>
        <div className="t-eyebrow" style={{ marginBottom: 4 }}>Mono · Geist Mono</div>
        <TypeRow label="metric"   size={{ px: 28, lh: 1.1,  w: 500 }} sample="99.982%" mono/>
        <TypeRow label="data"     size={{ px: 14, lh: 1.4,  w: 400 }} sample="GET /api/v1/health · 200 · 142ms" mono/>
        <TypeRow label="eyebrow"  size={{ px: 11, lh: 1.4,  w: 500, tr: '0.12em' }} sample="UPTIME · 30 DAYS" mono/>
      </div>
    </div>
  </div>
);

Object.assign(window, { ColorTokensArtboard, TypeTokensArtboard });

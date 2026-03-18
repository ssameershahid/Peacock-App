import { useState } from "react";

const colors = {
  primary: { forest: "#1B3C34", forestLight: "#245045", forestDark: "#142D27" },
  accent: { amber: "#D4842A", amberLight: "#E89B4A", amberDark: "#B56E1E", amberMuted: "#F2C68A" },
  neutral: { white: "#FFFFFF", cream: "#F8F5F0", warmGray50: "#F3F1EC", warmGray100: "#E8E5DF", warmGray200: "#D4D1CB", warmGray300: "#B0ADA7", warmGray400: "#8A8782", warmGray500: "#6B6862", warmGray600: "#4A4844", warmGray900: "#1A1917" },
  semantic: { success: "#2D7A4F", error: "#C4382A", warning: "#D4842A", info: "#2A6B8C" },
  surface: { sage: "#E4EAE4", sageDark: "#C8D4C8", mintLight: "#EDF2ED" }
};

const typography = {
  display: { family: "'Instrument Serif', 'Playfair Display', 'Georgia', serif", note: "Used for all display headings. The marketing site uses a warm editorial serif with distinctive italic variants." },
  body: { family: "'DM Sans', 'Plus Jakarta Sans', 'Outfit', system-ui, sans-serif", note: "Clean geometric sans-serif. Modern, highly legible, with a friendly warmth." },
  sizes: {
    "display-xl": { size: "56px", lineHeight: "1.1", weight: "400", tracking: "-0.02em", use: "Hero headlines" },
    "display-lg": { size: "40px", lineHeight: "1.15", weight: "400", tracking: "-0.015em", use: "Section headings" },
    "display-md": { size: "32px", lineHeight: "1.2", weight: "400", tracking: "-0.01em", use: "Card titles, subheadings" },
    "display-sm": { size: "24px", lineHeight: "1.3", weight: "400", tracking: "0", use: "Small headings" },
    "body-lg": { size: "18px", lineHeight: "1.6", weight: "400", tracking: "0", use: "Lead paragraphs" },
    "body-md": { size: "16px", lineHeight: "1.6", weight: "400", tracking: "0", use: "Body text" },
    "body-sm": { size: "14px", lineHeight: "1.5", weight: "400", tracking: "0", use: "Captions, metadata" },
    "label": { size: "12px", lineHeight: "1.4", weight: "500", tracking: "0.08em", use: "Overlines, tags (uppercase)" },
  }
};

const spacing = { 1: "4px", 2: "8px", 3: "12px", 4: "16px", 5: "20px", 6: "24px", 8: "32px", 10: "40px", 12: "48px", 16: "64px", 20: "80px", 24: "96px", 32: "128px" };
const radii = { sm: "8px", md: "12px", lg: "16px", xl: "20px", pill: "999px" };

function ColorSwatch({ name, hex, dark }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
      <div style={{ width: 48, height: 48, borderRadius: 8, backgroundColor: hex, border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: typography.body.family, fontSize: 14, fontWeight: 500, color: colors.neutral.warmGray900 }}>{name}</div>
        <div style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, color: colors.neutral.warmGray400 }}>{hex}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 32, marginTop: 56, borderBottom: `1px solid ${colors.neutral.warmGray100}`, paddingBottom: 16 }}>
      <h2 style={{ fontFamily: typography.display.family, fontSize: 32, fontWeight: 400, color: colors.primary.forest, margin: 0, lineHeight: 1.2 }}>{children}</h2>
      {sub && <p style={{ fontFamily: typography.body.family, fontSize: 15, color: colors.neutral.warmGray400, margin: "8px 0 0", lineHeight: 1.5 }}>{sub}</p>}
    </div>
  );
}

function ButtonDemo({ variant, children, size = "md" }) {
  const [hovered, setHovered] = useState(false);
  const styles = {
    primary: { backgroundColor: hovered ? colors.primary.forestLight : colors.primary.forest, color: "#fff", border: "none" },
    secondary: { backgroundColor: hovered ? colors.neutral.warmGray50 : "transparent", color: colors.primary.forest, border: `1.5px solid ${colors.primary.forest}` },
    ghost: { backgroundColor: hovered ? colors.neutral.warmGray50 : "transparent", color: colors.primary.forest, border: "1.5px solid transparent" },
    amber: { backgroundColor: hovered ? colors.accent.amberLight : colors.accent.amber, color: "#fff", border: "none" },
  };
  const sizeStyles = {
    sm: { padding: "8px 20px", fontSize: 13 },
    md: { padding: "12px 28px", fontSize: 15 },
    lg: { padding: "16px 36px", fontSize: 16 },
  };
  return (
    <button onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={{ ...styles[variant], ...sizeStyles[size], fontFamily: typography.body.family, fontWeight: 500, borderRadius: radii.pill, cursor: "pointer", transition: "all 0.2s ease", letterSpacing: "0.01em", display: "inline-flex", alignItems: "center", gap: 8 }}>
      {children}
    </button>
  );
}

function CardDemo({ type }) {
  const imgPlaceholder = (w, h, label) => (
    <div style={{ width: "100%", height: h, backgroundColor: colors.surface.sage, borderRadius: type === "journey" ? `${radii.lg} ${radii.lg} 0 0` : radii.lg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(27,60,52,0.7) 100%)" }} />
      <span style={{ fontFamily: typography.body.family, fontSize: 13, color: colors.neutral.warmGray300, position: "relative", zIndex: 1 }}>{label}</span>
    </div>
  );

  if (type === "journey") return (
    <div style={{ borderRadius: radii.lg, overflow: "hidden", backgroundColor: colors.neutral.white, boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)", maxWidth: 260 }}>
      <div style={{ position: "relative" }}>
        {imgPlaceholder("100%", 180, "Tour image")}
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 2 }}>
          <div style={{ fontFamily: typography.display.family, fontSize: 20, color: "#fff", fontWeight: 400 }}>Colombo</div>
          <div style={{ fontFamily: typography.body.family, fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>Gateway to Sri Lanka</div>
        </div>
      </div>
      <div style={{ padding: "16px 16px 20px" }}>
        <div style={{ fontFamily: typography.body.family, fontSize: 13, color: colors.neutral.warmGray400 }}>3 days · Cultural</div>
        <div style={{ fontFamily: typography.body.family, fontSize: 15, fontWeight: 600, color: colors.primary.forest, marginTop: 8 }}>From £45/day</div>
      </div>
    </div>
  );

  if (type === "vehicle") return (
    <div style={{ borderRadius: radii.lg, border: `1.5px solid ${colors.neutral.warmGray100}`, padding: 20, maxWidth: 200, textAlign: "center", cursor: "pointer", transition: "all 0.2s", backgroundColor: colors.neutral.white }}>
      <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 100, height: 60, backgroundColor: colors.neutral.warmGray50, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: colors.neutral.warmGray300, fontFamily: typography.body.family }}>Vehicle img</span>
        </div>
      </div>
      <div style={{ fontFamily: typography.body.family, fontSize: 15, fontWeight: 600, color: colors.neutral.warmGray900, marginTop: 8 }}>Car</div>
      <div style={{ fontFamily: typography.body.family, fontSize: 13, color: colors.neutral.warmGray400, marginTop: 2 }}>1–3 passengers</div>
      <div style={{ fontFamily: typography.body.family, fontSize: 16, fontWeight: 600, color: colors.primary.forest, marginTop: 8 }}>£45/day</div>
    </div>
  );

  return null;
}

function TabDemo() {
  const [active, setActive] = useState(0);
  const tabs = ["Book a tour", "Custom journey", "Airport transfer"];
  return (
    <div style={{ display: "flex", gap: 8, backgroundColor: colors.neutral.warmGray50, padding: 4, borderRadius: radii.pill }}>
      {tabs.map((t, i) => (
        <button key={i} onClick={() => setActive(i)} style={{ padding: "10px 24px", borderRadius: radii.pill, border: "none", cursor: "pointer", fontFamily: typography.body.family, fontSize: 14, fontWeight: 500, transition: "all 0.2s", backgroundColor: active === i ? colors.primary.forest : "transparent", color: active === i ? "#fff" : colors.neutral.warmGray500, letterSpacing: "0.01em" }}>
          {t}
        </button>
      ))}
    </div>
  );
}

function InputDemo({ label, placeholder, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ maxWidth: 320 }}>
      {label && <label style={{ fontFamily: typography.body.family, fontSize: 13, fontWeight: 500, color: colors.neutral.warmGray600, display: "block", marginBottom: 6 }}>{label}</label>}
      <input type={type} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ width: "100%", padding: "12px 16px", borderRadius: radii.md, border: `1.5px solid ${focused ? colors.primary.forest : colors.neutral.warmGray200}`, fontFamily: typography.body.family, fontSize: 15, color: colors.neutral.warmGray900, outline: "none", transition: "border-color 0.2s", backgroundColor: colors.neutral.white, boxSizing: "border-box" }} />
    </div>
  );
}

function BadgeDemo({ children, variant = "default" }) {
  const styles = {
    default: { bg: colors.surface.sage, color: colors.primary.forest },
    amber: { bg: "#FEF3E2", color: colors.accent.amberDark },
    success: { bg: "#E8F5E9", color: colors.semantic.success },
    error: { bg: "#FDECEA", color: colors.semantic.error },
  };
  const s = styles[variant];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 12px", borderRadius: radii.pill, backgroundColor: s.bg, color: s.color, fontFamily: typography.body.family, fontSize: 12, fontWeight: 500, letterSpacing: "0.02em" }}>
      {children}
    </span>
  );
}

function StepperDemo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {[1, 2, 3].map((n, i) => (
        <div key={n} style={{ display: "flex", alignItems: "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: i === 0 ? colors.primary.forest : i === 1 ? colors.neutral.warmGray100 : colors.neutral.warmGray50, color: i === 0 ? "#fff" : colors.neutral.warmGray400, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: typography.body.family, fontSize: 14, fontWeight: 600 }}>{n}</div>
          {i < 2 && <div style={{ width: 60, height: 2, backgroundColor: i === 0 ? colors.primary.forest : colors.neutral.warmGray100, margin: "0 8px" }} />}
        </div>
      ))}
    </div>
  );
}

export default function PeacockDesignSystem() {
  return (
    <div style={{ fontFamily: typography.body.family, color: colors.neutral.warmGray900, backgroundColor: colors.neutral.white, maxWidth: 900, margin: "0 auto", padding: "40px 32px 80px" }}>
      
      {/* Header */}
      <div style={{ marginBottom: 48, paddingBottom: 32, borderBottom: `2px solid ${colors.primary.forest}` }}>
        <div style={{ fontFamily: typography.body.family, fontSize: 12, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: colors.accent.amber, marginBottom: 8 }}>Design system</div>
        <h1 style={{ fontFamily: typography.display.family, fontSize: 48, fontWeight: 400, color: colors.primary.forest, margin: 0, lineHeight: 1.1 }}>
          Peacock Drivers
        </h1>
        <p style={{ fontFamily: typography.body.family, fontSize: 17, color: colors.neutral.warmGray400, margin: "12px 0 0", lineHeight: 1.5, maxWidth: 600 }}>
          Comprehensive design system extracted from the marketing site. Use this as the canonical reference for building the web app at app.peacockdrivers.com.
        </p>
      </div>

      {/* === COLORS === */}
      <SectionTitle sub="The palette centres on deep forest green (peacock-inspired) with warm amber accents and soft neutral backgrounds.">Colour palette</SectionTitle>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, marginBottom: 32 }}>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 16 }}>Primary</div>
          <ColorSwatch name="Forest" hex="#1B3C34" />
          <ColorSwatch name="Forest light" hex="#24504A" />
          <ColorSwatch name="Forest dark" hex="#142D27" />
        </div>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 16 }}>Accent</div>
          <ColorSwatch name="Amber" hex="#D4842A" />
          <ColorSwatch name="Amber light" hex="#E89B4A" />
          <ColorSwatch name="Amber muted" hex="#F2C68A" />
        </div>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 16 }}>Surfaces</div>
          <ColorSwatch name="White" hex="#FFFFFF" />
          <ColorSwatch name="Cream" hex="#F8F5F0" />
          <ColorSwatch name="Sage" hex="#E4EAE4" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 16 }}>Neutrals</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
            <ColorSwatch name="Gray 50" hex="#F3F1EC" />
            <ColorSwatch name="Gray 100" hex="#E8E5DF" />
            <ColorSwatch name="Gray 200" hex="#D4D1CB" />
            <ColorSwatch name="Gray 300" hex="#B0ADA7" />
            <ColorSwatch name="Gray 400" hex="#8A8782" />
            <ColorSwatch name="Gray 500" hex="#6B6862" />
            <ColorSwatch name="Gray 600" hex="#4A4844" />
            <ColorSwatch name="Gray 900" hex="#1A1917" />
          </div>
        </div>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 13, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 16 }}>Semantic</div>
          <ColorSwatch name="Success" hex="#2D7A4F" />
          <ColorSwatch name="Error" hex="#C4382A" />
          <ColorSwatch name="Warning" hex="#D4842A" />
          <ColorSwatch name="Info" hex="#2A6B8C" />
        </div>
      </div>

      {/* Section backgrounds demo */}
      <div style={{ marginTop: 32, display: "flex", gap: 0, borderRadius: radii.lg, overflow: "hidden", border: `1px solid ${colors.neutral.warmGray100}` }}>
        {[{ bg: "#FFFFFF", label: "White sections" }, { bg: "#F8F5F0", label: "Cream sections" }, { bg: "#E4EAE4", label: "Sage cards" }, { bg: "#1B3C34", label: "Dark CTA", color: "#fff" }].map(s => (
          <div key={s.label} style={{ flex: 1, height: 80, backgroundColor: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: typography.body.family, fontSize: 11, color: s.color || colors.neutral.warmGray500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* === TYPOGRAPHY === */}
      <SectionTitle sub="Editorial serif for display, geometric sans for everything else. The serif gives warmth; the sans gives clarity.">Typography</SectionTitle>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 40 }}>
        <div style={{ padding: 24, backgroundColor: colors.neutral.warmGray50, borderRadius: radii.lg }}>
          <div style={{ fontFamily: typography.body.family, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 12 }}>Display font</div>
          <div style={{ fontFamily: typography.display.family, fontSize: 36, color: colors.primary.forest, lineHeight: 1.15 }}>Instrument Serif</div>
          <div style={{ fontFamily: typography.display.family, fontSize: 36, color: colors.primary.forest, lineHeight: 1.15, fontStyle: "italic" }}>with italic variants</div>
          <p style={{ fontFamily: typography.body.family, fontSize: 13, color: colors.neutral.warmGray400, marginTop: 12, lineHeight: 1.5 }}>{typography.display.note}</p>
        </div>
        <div style={{ padding: 24, backgroundColor: colors.neutral.warmGray50, borderRadius: radii.lg }}>
          <div style={{ fontFamily: typography.body.family, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 12 }}>Body font</div>
          <div style={{ fontFamily: typography.body.family, fontSize: 36, fontWeight: 400, color: colors.primary.forest, lineHeight: 1.15 }}>DM Sans</div>
          <div style={{ fontFamily: typography.body.family, fontSize: 36, fontWeight: 600, color: colors.primary.forest, lineHeight: 1.15 }}>Medium & Semibold</div>
          <p style={{ fontFamily: typography.body.family, fontSize: 13, color: colors.neutral.warmGray400, marginTop: 12, lineHeight: 1.5 }}>{typography.body.note}</p>
        </div>
      </div>

      {/* Type scale */}
      <div style={{ borderRadius: radii.lg, border: `1px solid ${colors.neutral.warmGray100}`, overflow: "hidden" }}>
        {Object.entries(typography.sizes).map(([key, val], i) => (
          <div key={key} style={{ display: "flex", alignItems: "baseline", padding: "16px 24px", borderBottom: i < Object.keys(typography.sizes).length - 1 ? `1px solid ${colors.neutral.warmGray100}` : "none", gap: 24, backgroundColor: i % 2 === 0 ? "transparent" : colors.neutral.warmGray50 }}>
            <div style={{ width: 100, flexShrink: 0 }}>
              <code style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: colors.neutral.warmGray400, backgroundColor: colors.neutral.warmGray100, padding: "2px 6px", borderRadius: 4 }}>{key}</code>
            </div>
            <div style={{ flex: 1, fontFamily: key.startsWith("display") ? typography.display.family : typography.body.family, fontSize: val.size, fontWeight: val.weight, lineHeight: val.lineHeight, letterSpacing: val.tracking, color: colors.neutral.warmGray900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {key.startsWith("label") ? <span style={{ textTransform: "uppercase" }}>How it works</span> : key.startsWith("display") ? "See our amazing journeys" : "Explore Sri Lanka with a private driver and vehicle"}
            </div>
            <div style={{ width: 130, textAlign: "right", flexShrink: 0, fontFamily: "'SF Mono', monospace", fontSize: 11, color: colors.neutral.warmGray300 }}>{val.size} / {val.lineHeight}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 16, backgroundColor: "#FEF3E2", borderRadius: radii.md }}>
        <p style={{ fontFamily: typography.body.family, fontSize: 13, color: colors.accent.amberDark, margin: 0, lineHeight: 1.5 }}>
          <strong>Key pattern from the marketing site:</strong> Headings often feature one word in <em>italic</em> for emphasis — e.g. "See our amazing <em>journeys</em>", "Witness Sri Lanka's art of <em>hospitality</em>". Carry this into the app for section headings.
        </p>
      </div>

      {/* === BUTTONS === */}
      <SectionTitle sub="Pill-shaped buttons throughout. Primary forest green, secondary outline, ghost for tertiary actions.">Buttons</SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 12 }}>Primary</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <ButtonDemo variant="primary" size="lg">Book a journey</ButtonDemo>
            <ButtonDemo variant="primary" size="md">Continue</ButtonDemo>
            <ButtonDemo variant="primary" size="sm">View tour</ButtonDemo>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 12 }}>Secondary & ghost</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <ButtonDemo variant="secondary" size="md">Learn more</ButtonDemo>
            <ButtonDemo variant="ghost" size="md">Cancel</ButtonDemo>
            <ButtonDemo variant="amber" size="md">Pay now — £450</ButtonDemo>
          </div>
        </div>
      </div>

      {/* === TABS === */}
      <SectionTitle sub="Product selector tabs from the homepage. Green pill active state on neutral track.">Tabs & navigation</SectionTitle>
      <TabDemo />

      {/* === INPUTS === */}
      <SectionTitle sub="Clean inputs with subtle borders. Forest green focus ring. Generous padding for touch targets.">Form inputs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <InputDemo label="Email address" placeholder="you@example.com" type="email" />
        <InputDemo label="Number of travellers" placeholder="2" type="number" />
      </div>

      {/* === STEPPER === */}
      <SectionTitle sub="Used in the checkout flow (Contact → Review → Pay) and CYO wizard.">Progress stepper</SectionTitle>
      <StepperDemo />

      {/* === BADGES === */}
      <SectionTitle sub="Status badges for booking states, tour tags, and metadata.">Badges & tags</SectionTitle>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <BadgeDemo>Cultural</BadgeDemo>
        <BadgeDemo>Wildlife</BadgeDemo>
        <BadgeDemo>Beach</BadgeDemo>
        <BadgeDemo variant="success">Confirmed</BadgeDemo>
        <BadgeDemo variant="amber">Pending</BadgeDemo>
        <BadgeDemo variant="error">Cancelled</BadgeDemo>
      </div>

      {/* === CARDS === */}
      <SectionTitle sub="Tour cards follow the homepage pattern: image with overlay text, metadata below. Vehicle cards are selectable.">Cards</SectionTitle>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <CardDemo type="journey" />
        <CardDemo type="vehicle" />
      </div>

      {/* === SPACING & RADII === */}
      <SectionTitle sub="Generous spacing. The site breathes — sections have 80–96px vertical padding.">Spacing & radii</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 16 }}>Spacing scale</div>
          {Object.entries(spacing).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
              <code style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: colors.neutral.warmGray400, width: 40 }}>sp-{key}</code>
              <div style={{ width: parseInt(val), height: 8, backgroundColor: colors.primary.forest, borderRadius: 2, opacity: 0.6, maxWidth: "100%" }} />
              <span style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: colors.neutral.warmGray300 }}>{val}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontFamily: typography.body.family, fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: colors.neutral.warmGray400, marginBottom: 16 }}>Border radii</div>
          {Object.entries(radii).map(([key, val]) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 56, height: 56, border: `2px solid ${colors.primary.forest}`, borderRadius: val, opacity: 0.5 }} />
              <div>
                <code style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: colors.neutral.warmGray400 }}>{key}</code>
                <div style={{ fontFamily: "'SF Mono', monospace", fontSize: 11, color: colors.neutral.warmGray300 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === VEHICLES === */}
      <SectionTitle sub="The 5 vehicle types with their actual images from the client. All Toyota except the large bus (King Long).">Vehicle fleet</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
        {[
          { name: "Car", model: "Toyota Prius", pax: "1–3", file: "car.jpg" },
          { name: "Minivan", model: "Toyota HiAce", pax: "4–6", file: "Minivan.jpg" },
          { name: "Large Van", model: "Toyota HiAce HR", pax: "7–10", file: "Large_Minivan.jpg" },
          { name: "Small Bus", model: "Toyota Coaster", pax: "11–20", file: "Small_bus.jpg" },
          { name: "Medium Bus", model: "King Long", pax: "21–30+", file: "Medium_Bus.jpg" },
        ].map(v => (
          <div key={v.name} style={{ textAlign: "center", padding: 12, borderRadius: radii.lg, border: `1px solid ${colors.neutral.warmGray100}` }}>
            <div style={{ height: 60, backgroundColor: colors.neutral.warmGray50, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: colors.neutral.warmGray300, fontFamily: typography.body.family }}>{v.file}</span>
            </div>
            <div style={{ fontFamily: typography.body.family, fontSize: 14, fontWeight: 600, color: colors.neutral.warmGray900 }}>{v.name}</div>
            <div style={{ fontFamily: typography.body.family, fontSize: 11, color: colors.neutral.warmGray400 }}>{v.model}</div>
            <div style={{ fontFamily: typography.body.family, fontSize: 11, color: colors.primary.forest, fontWeight: 500, marginTop: 4 }}>{v.pax} pax</div>
          </div>
        ))}
      </div>

      {/* === PATTERNS === */}
      <SectionTitle sub="Recurring patterns extracted from the marketing site that must carry into the app.">UI patterns</SectionTitle>
      
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Section overline + serif heading", desc: "Small uppercase sans label above every serif heading. e.g. 'HOW IT WORKS' above 'How Peacock Drivers works'." },
          { title: "Italic emphasis word", desc: "One word per heading in serif italic for editorial warmth. 'See our amazing journeys', 'art of hospitality'." },
          { title: "Alternating section backgrounds", desc: "Sections alternate between white (#FFF) and cream (#F8F5F0). Dark forest green for final CTA." },
          { title: "Image cards with overlay", desc: "Tour/journey cards use full-bleed images with gradient overlay and white text at the bottom." },
          { title: "Pill buttons everywhere", desc: "No squared buttons. Everything is border-radius: 999px. Primary green, secondary outline." },
          { title: "Trust bar", desc: "Logos (Travel+Leisure, Condé Nast, VOGUE, Luxury Planner) in a horizontal row. Subtle, grayscale." },
          { title: "Generous section spacing", desc: "80–96px vertical padding between sections. The design breathes. Never cramped." },
          { title: "Amber progress indicators", desc: "Orange/amber used for progress bars (When to go section) and active states on secondary elements." },
        ].map((p, i) => (
          <div key={i} style={{ padding: 20, borderRadius: radii.lg, backgroundColor: i % 2 === 0 ? colors.surface.mintLight : colors.neutral.warmGray50 }}>
            <div style={{ fontFamily: typography.body.family, fontSize: 14, fontWeight: 600, color: colors.neutral.warmGray900, marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontFamily: typography.body.family, fontSize: 13, color: colors.neutral.warmGray500, lineHeight: 1.5 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* === TAILWIND CONFIG === */}
      <SectionTitle sub="Copy-paste ready Tailwind CSS configuration for the Replit build.">Tailwind config</SectionTitle>
      <div style={{ backgroundColor: colors.neutral.warmGray900, borderRadius: radii.lg, padding: 24, overflow: "auto" }}>
        <pre style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, color: "#E8E5DF", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#E4EAE4',
          100: '#C8D4C8',
          200: '#8BAF8B',
          300: '#4E7A5E',
          400: '#24504A',
          500: '#1B3C34',
          600: '#142D27',
          700: '#0F211D',
          800: '#0A1613',
          900: '#050B09',
        },
        amber: {
          50: '#FEF3E2',
          100: '#F2C68A',
          200: '#E89B4A',
          300: '#D4842A',
          400: '#B56E1E',
          500: '#965A18',
        },
        cream: '#F8F5F0',
        sage: '#E4EAE4',
        warm: {
          50: '#F3F1EC',
          100: '#E8E5DF',
          200: '#D4D1CB',
          300: '#B0ADA7',
          400: '#8A8782',
          500: '#6B6862',
          600: '#4A4844',
          900: '#1A1917',
        },
      },
      fontFamily: {
        display: ['Instrument Serif', 'Playfair Display', 'Georgia', 'serif'],
        body: ['DM Sans', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'pill': '999px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },
    },
  },
}`}</pre>
      </div>

      {/* === CSS VARIABLES === */}
      <div style={{ marginTop: 24, backgroundColor: colors.neutral.warmGray900, borderRadius: radii.lg, padding: 24, overflow: "auto" }}>
        <pre style={{ fontFamily: "'SF Mono', 'Fira Code', monospace", fontSize: 12, color: "#E8E5DF", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{`/* globals.css — CSS custom properties */
:root {
  /* Colors */
  --color-forest: #1B3C34;
  --color-forest-light: #24504A;
  --color-forest-dark: #142D27;
  --color-amber: #D4842A;
  --color-amber-light: #E89B4A;
  --color-cream: #F8F5F0;
  --color-sage: #E4EAE4;
  --color-white: #FFFFFF;
  --color-text: #1A1917;
  --color-text-secondary: #6B6862;
  --color-text-muted: #8A8782;
  --color-border: #E8E5DF;
  --color-border-hover: #D4D1CB;
  
  /* Typography */
  --font-display: 'Instrument Serif', 'Playfair Display', Georgia, serif;
  --font-body: 'DM Sans', 'Plus Jakarta Sans', system-ui, sans-serif;
  
  /* Spacing */
  --section-padding: 80px;
  --container-max: 1200px;
  --container-padding: 24px;
  
  /* Radii */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
  
  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 200ms ease;
  --transition-slow: 300ms ease;
}

/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');`}</pre>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 64, padding: 32, backgroundColor: colors.primary.forest, borderRadius: radii.xl, textAlign: "center" }}>
        <div style={{ fontFamily: typography.display.family, fontSize: 28, color: "#fff", lineHeight: 1.2 }}>
          Ready to <em>build</em>
        </div>
        <p style={{ fontFamily: typography.body.family, fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 8, maxWidth: 400, margin: "8px auto 0" }}>
          This design system is the canonical reference for the Peacock Drivers web app. Open in Replit and start with Sprint 1.
        </p>
      </div>
    </div>
  );
}

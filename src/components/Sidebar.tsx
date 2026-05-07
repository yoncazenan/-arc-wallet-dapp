"use client";

const menuItems = [
  { id: "dashboard", icon: "⬡", label: "Dashboard" },
  { id: "wallet", icon: "◈", label: "Wallet" },
  { id: "send", icon: "↗", label: "Send / Receive" },
  { id: "swap", icon: "⇄", label: "Swap" },
  { id: "streams", icon: "⟳", label: "Streams" },
  { id: "split", icon: "⊞", label: "Split Pay" },
  { id: "invoice", icon: "▤", label: "Invoices" },
  { id: "settings", icon: "◎", label: "Settings" },
];

interface SidebarProps {
  active: string;
  setActive: (id: string) => void;
  connected: boolean;
  address: string;
  onConnect: () => void;
}

export default function Sidebar({ active, setActive, connected, address, onConnect }: SidebarProps) {
  return (
    <aside style={{
      position: "fixed", left: 0, top: 0, height: "100vh", width: "240px",
      background: "linear-gradient(180deg, #0d0d1a 0%, #0a0a0f 100%)",
      borderRight: "1px solid #1a1a2e", display: "flex", flexDirection: "column", zIndex: 50,
    }}>
      {/* Logo */}
      <div style={{ padding: "24px", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px", height: "40px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", fontWeight: "bold",
          }}>◈</div>
          <div>
            <div style={{ color: "#fff", fontWeight: "700", fontSize: "16px", lineHeight: "1" }}>Arc Finance</div>
            <div style={{ color: "#3b82f6", fontSize: "11px", marginTop: "3px", fontWeight: "600" }}>Testnet</div>
          </div>
        </div>
      </div>

      <div style={{ height: "1px", background: "#1a1a2e", margin: "0 16px 16px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 12px", overflowY: "auto" }}>
        <div style={{ fontSize: "10px", fontWeight: "700", color: "#374151", padding: "0 12px", marginBottom: "8px", letterSpacing: "0.1em" }}>
          NAVIGATION
        </div>
        {menuItems.map((item) => (
          <button key={item.id} onClick={() => setActive(item.id)} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "12px",
            padding: "11px 14px", borderRadius: "12px", marginBottom: "4px",
            border: active === item.id ? "1px solid rgba(59,130,246,0.35)" : "1px solid transparent",
            background: active === item.id
              ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.18))"
              : "transparent",
            color: active === item.id ? "#ffffff" : "#6b7280",
            cursor: "pointer", textAlign: "left", transition: "all 0.2s",
          }}>
            <span style={{ fontSize: "16px", width: "20px", textAlign: "center" }}>{item.icon}</span>
            <span style={{ fontSize: "13px", fontWeight: "500" }}>{item.label}</span>
            {active === item.id && (
              <span style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#3b82f6" }} />
            )}
          </button>
        ))}
      </nav>

      <div style={{ height: "1px", background: "#1a1a2e", margin: "0 16px 16px" }} />

      {/* Network */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{
          padding: "8px 12px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", flexShrink: 0 }} />
          <span style={{ color: "#10b981", fontSize: "11px", fontWeight: "500" }}>Arc Testnet</span>
          <span style={{ marginLeft: "auto", color: "#374151", fontSize: "11px" }}>5042002</span>
        </div>
      </div>

      {/* Connect */}
      <div style={{ padding: "0 16px 20px" }}>
        <button onClick={onConnect} style={{
          width: "100%", padding: "12px 16px", borderRadius: "12px",
          fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s",
          background: connected
            ? "rgba(16,185,129,0.15)"
            : "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          border: connected ? "1px solid rgba(16,185,129,0.3)" : "none",
          color: connected ? "#10b981" : "#ffffff",
        }}>
          {connected ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet"}
        </button>
      </div>
    </aside>
  );
}
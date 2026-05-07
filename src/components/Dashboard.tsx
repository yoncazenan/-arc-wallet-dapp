"use client";

const stats = [
  { label: "Total Balance", value: "$0.00", sub: "USDC + EURC", color: "#3b82f6", icon: "◈" },
  { label: "Sent", value: "$0.00", sub: "This month", color: "#8b5cf6", icon: "↑" },
  { label: "Received", value: "$0.00", sub: "This month", color: "#10b981", icon: "↓" },
  { label: "Transactions", value: "0", sub: "Total", color: "#f59e0b", icon: "⇄" },
];

const recentTx = [
  { type: "Sent", address: "0x1234...5678", amount: "-50 USDC", time: "2 hours ago", color: "#ef4444" },
  { type: "Received", address: "0xabcd...efgh", amount: "+100 USDC", time: "5 hours ago", color: "#10b981" },
  { type: "Swap", address: "USDC → EURC", amount: "25 USDC", time: "1 day ago", color: "#8b5cf6" },
];

const quickActions = [
  { label: "Send USDC", icon: "↑", color: "#3b82f6" },
  { label: "Swap Tokens", icon: "⇄", color: "#8b5cf6" },
  { label: "Create Invoice", icon: "▤", color: "#10b981" },
  { label: "Get Test USDC", icon: "◈", color: "#f59e0b", href: "https://faucet.circle.com" },
];

export default function Dashboard({ connected, address }: { connected: boolean; address: string }) {
  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Dashboard</h2>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>
            Arc Testnet • {connected ? `${address.slice(0, 8)}...${address.slice(-6)}` : "No wallet connected"}
          </p>
        </div>
        <div style={{
          padding: "8px 16px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px",
          background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)",
        }}>
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
          <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>Live</span>
        </div>
      </div>

      {/* Network Bar */}
      <div style={{
        padding: "12px 20px", borderRadius: "12px", marginBottom: "24px",
        background: "#0d0d1a", border: "1px solid #1a1a2e",
        display: "flex", alignItems: "center", gap: "20px",
      }}>
        {[
          { label: "Network", value: "Arc Testnet Online", color: "#10b981" },
          { label: "Chain ID", value: "2151908" },
          { label: "Block", value: "#1,284,910" },
          { label: "TPS", value: "~2,400" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {i > 0 && <div style={{ width: "1px", height: "16px", background: "#1a1a2e" }} />}
            <div>
              <span style={{ color: "#6b7280", fontSize: "11px" }}>{item.label}: </span>
              <span style={{ color: item.color || "#fff", fontSize: "12px", fontWeight: "600" }}>{item.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{
            padding: "20px", borderRadius: "16px", position: "relative", overflow: "hidden",
            background: "#0d0d1a", border: "1px solid #1a1a2e",
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0, width: "80px", height: "80px",
              borderRadius: "50%", background: stat.color, opacity: 0.08,
              transform: "translate(30%, -30%)",
            }} />
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px", marginBottom: "12px",
              background: `${stat.color}20`, color: stat.color,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
            }}>{stat.icon}</div>
            <div style={{ color: "#6b7280", fontSize: "11px", marginBottom: "4px", fontWeight: "500" }}>{stat.label}</div>
            <div style={{ color: "#fff", fontSize: "24px", fontWeight: "700" }}>{stat.value}</div>
            <div style={{ color: stat.color, fontSize: "11px", marginTop: "4px" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "16px" }}>
        
        {/* Recent Transactions */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: 0 }}>Recent Transactions</h3>
            <button style={{
              background: "rgba(59,130,246,0.1)", color: "#3b82f6",
              border: "none", padding: "4px 12px", borderRadius: "8px", fontSize: "12px", cursor: "pointer",
            }}>View All</button>
          </div>
          {recentTx.map((tx, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "16px", padding: "12px 0",
              borderBottom: i < recentTx.length - 1 ? "1px solid #1a1a2e" : "none",
            }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: `${tx.color}20`, color: tx.color,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "700",
              }}>
                {tx.type === "Sent" ? "↑" : tx.type === "Received" ? "↓" : "⇄"}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: "13px", fontWeight: "500" }}>{tx.type}</div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>{tx.address}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: tx.color, fontSize: "13px", fontWeight: "700" }}>{tx.amount}</div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>{tx.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>Quick Actions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {quickActions.map((action) => (
              <a key={action.label} href={action.href || "#"} target={action.href ? "_blank" : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: "12px", padding: "12px",
                  borderRadius: "10px", background: "#0a0a0f", border: "1px solid #1a1a2e",
                  textDecoration: "none", cursor: "pointer",
                }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: `${action.color}20`, color: action.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px",
                }}>{action.icon}</div>
                <span style={{ color: "#fff", fontSize: "13px", flex: 1 }}>{action.label}</span>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>→</span>
              </a>
            ))}
          </div>

          {/* Faucet */}
          <div style={{
            marginTop: "16px", padding: "16px", borderRadius: "12px",
            background: "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.12))",
            border: "1px solid rgba(59,130,246,0.2)",
          }}>
            <div style={{ color: "#fff", fontSize: "12px", fontWeight: "600", marginBottom: "4px" }}>Arc Testnet Faucet</div>
            <div style={{ color: "#6b7280", fontSize: "11px", marginBottom: "12px" }}>Get free test tokens</div>
            <a href="https://faucet.circle.com" target="_blank" style={{
              display: "block", textAlign: "center", padding: "8px",
              borderRadius: "8px", fontSize: "12px", fontWeight: "600", color: "#fff",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", textDecoration: "none",
            }}>Open Faucet →</a>
          </div>
        </div>
      </div>
    </div>
  );
}
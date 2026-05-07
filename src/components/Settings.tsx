"use client";
import { useState } from "react";

export default function Settings({ connected, address }: { connected: boolean; address: string }) {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState("en");
  const [currency, setCurrency] = useState("USD");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Settings</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Manage your application preferences</p>
      </div>

      <div style={{ maxWidth: "520px", display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Wallet */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>Wallet</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Status</span>
              <span style={{
                padding: "4px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "700",
                background: connected ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: connected ? "#10b981" : "#ef4444",
              }}>{connected ? "Connected" : "Disconnected"}</span>
            </div>
            {connected && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Address</span>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#fff", fontSize: "12px", fontFamily: "monospace" }}>
                    {address.slice(0, 8)}...{address.slice(-6)}
                  </span>
                  <button onClick={handleCopy} style={{
                    padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "600",
                    cursor: "pointer", border: "none", transition: "all 0.2s",
                    background: copied ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)",
                    color: copied ? "#10b981" : "#3b82f6",
                  }}>{copied ? "✓ Copied" : "Copy"}</button>
                </div>
              </div>
            )}
            {[
              { label: "Network", value: "Arc Testnet" },
              { label: "Chain ID", value: "2151908" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>{row.label}</span>
                <span style={{ color: "#fff", fontSize: "13px", fontFamily: "monospace" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>Preferences</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Notifications */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontSize: "13px", fontWeight: "500" }}>Notifications</div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>Transaction confirmations</div>
              </div>
              <button onClick={() => setNotifications(!notifications)} style={{
                width: "44px", height: "24px", borderRadius: "12px", border: "none",
                cursor: "pointer", position: "relative", transition: "all 0.2s",
                background: notifications ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "#1a1a2e",
              }}>
                <span style={{
                  position: "absolute", top: "3px", width: "18px", height: "18px",
                  borderRadius: "50%", background: "#fff", transition: "all 0.2s",
                  left: notifications ? "23px" : "3px",
                }} />
              </button>
            </div>

            {/* Language */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontSize: "13px", fontWeight: "500" }}>Language</div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>Interface language</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["en", "tr"].map((l) => (
                  <button key={l} onClick={() => setLanguage(l)} style={{
                    padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                    cursor: "pointer", border: "none", transition: "all 0.2s",
                    background: language === l ? "rgba(59,130,246,0.2)" : "transparent",
                    outline: language === l ? "1px solid rgba(59,130,246,0.5)" : "1px solid #1a1a2e",
                    color: language === l ? "#3b82f6" : "#6b7280",
                  }}>{l === "en" ? "English" : "Türkçe"}</button>
                ))}
              </div>
            </div>

            {/* Currency */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#fff", fontSize: "13px", fontWeight: "500" }}>Currency</div>
                <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>Display currency</div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["USD", "EUR", "TRY"].map((c) => (
                  <button key={c} onClick={() => setCurrency(c)} style={{
                    padding: "6px 12px", borderRadius: "8px", fontSize: "12px", fontWeight: "600",
                    cursor: "pointer", border: "none", transition: "all 0.2s",
                    background: currency === c ? "rgba(59,130,246,0.2)" : "transparent",
                    outline: currency === c ? "1px solid rgba(59,130,246,0.5)" : "1px solid #1a1a2e",
                    color: currency === c ? "#3b82f6" : "#6b7280",
                  }}>{c}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>About</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Version", value: "1.0.0", color: "#fff" },
              { label: "Network", value: "Arc Testnet", color: "#3b82f6" },
              { label: "Powered by", value: "Circle App Kit", color: "#fff" },
              { label: "Explorer", value: "testnet.arcscan.app", color: "#3b82f6" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>{row.label}</span>
                <span style={{ color: row.color, fontSize: "13px", fontWeight: "500" }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
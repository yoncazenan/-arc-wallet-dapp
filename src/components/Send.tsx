"use client";
import { useState } from "react";

export default function Send({ connected }: { connected: boolean }) {
  const [tab, setTab] = useState<"send" | "receive">("send");
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [token, setToken] = useState("USDC");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleSend = async () => {
    if (!connected) { setStatus("Please connect your wallet first!"); return; }
    if (!address || !amount) { setStatus("Please fill in all fields!"); return; }
    if (parseFloat(amount) <= 0) { setStatus("Amount must be greater than 0!"); return; }
    setLoading(true);
    setStatus("Waiting for MetaMask approval...");
    setTxHash("");
    try {
      const { sendUSDC, sendEURC } = await import("@/lib/blockchain");
      const hash = token === "USDC" ? await sendUSDC(address, amount) : await sendEURC(address, amount);
      setTxHash(hash);
      setStatus("✅ Transaction confirmed!");
      setAddress(""); setAmount("");
    } catch (err: any) {
      setStatus(err.message?.includes("rejected") ? "❌ Rejected by user." : `❌ Error: ${err.message?.slice(0, 80)}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Send / Receive</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Real USDC and EURC transfers on Arc Testnet</p>
      </div>

      <div style={{ display: "inline-flex", gap: "4px", padding: "4px", borderRadius: "12px", background: "#0d0d1a", border: "1px solid #1a1a2e", marginBottom: "24px" }}>
        {["send", "receive"].map((t) => (
          <button key={t} onClick={() => setTab(t as "send" | "receive")} style={{
            padding: "8px 24px", borderRadius: "8px", fontSize: "13px", fontWeight: "600",
            cursor: "pointer", border: "none",
            background: tab === t ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "transparent",
            color: tab === t ? "#fff" : "#6b7280",
          }}>{t === "send" ? "Send" : "Receive"}</button>
        ))}
      </div>

      {tab === "send" ? (
        <div style={{ maxWidth: "480px" }}>
          <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>TOKEN</div>
              <div style={{ display: "flex", gap: "8px" }}>
                {["USDC", "EURC"].map((t) => (
                  <button key={t} onClick={() => setToken(t)} style={{
                    padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                    background: token === t ? "rgba(59,130,246,0.2)" : "transparent",
                    border: token === t ? "1px solid rgba(59,130,246,0.5)" : "1px solid #1a1a2e",
                    color: token === t ? "#3b82f6" : "#6b7280",
                  }}>{t}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>RECIPIENT ADDRESS</div>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." style={{
                width: "100%", padding: "12px 16px", borderRadius: "10px",
                background: "#0a0a0f", border: "1px solid #1a1a2e",
                color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box",
              }} />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>AMOUNT</div>
              <div style={{ position: "relative" }}>
                <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" style={{
                  width: "100%", padding: "12px 56px 12px 16px", borderRadius: "10px",
                  background: "#0a0a0f", border: "1px solid #1a1a2e",
                  color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box",
                }} />
                <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>{token}</span>
              </div>
            </div>

            <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", display: "flex", justifyContent: "space-between", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
              <span style={{ color: "#6b7280", fontSize: "12px" }}>Network</span>
              <span style={{ color: "#3b82f6", fontSize: "12px", fontWeight: "600" }}>Arc Testnet</span>
            </div>

            {status && (
              <div style={{
                padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px",
                background: status.includes("✅") ? "rgba(16,185,129,0.1)" : status.includes("❌") ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
                color: status.includes("✅") ? "#10b981" : status.includes("❌") ? "#ef4444" : "#3b82f6",
                border: `1px solid ${status.includes("✅") ? "rgba(16,185,129,0.2)" : status.includes("❌") ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}`,
              }}>{status}</div>
            )}

            {txHash && (
              <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" style={{
                display: "block", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px",
                background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)",
                color: "#10b981", fontSize: "12px", textDecoration: "none",
              }}>🔗 View on Explorer: {txHash.slice(0, 24)}...</a>
            )}

            <button onClick={handleSend} disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}>{loading ? "Processing..." : `Send ${token} →`}</button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: "480px" }}>
          <div style={{ padding: "32px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e", textAlign: "center" }}>
            <div style={{ width: "200px", height: "200px", margin: "0 auto 20px", borderRadius: "16px", background: "#0a0a0f", border: "1px solid #1a1a2e", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {connected ? (
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${typeof window !== "undefined" ? (window as any).ethereum?.selectedAddress || "" : ""}`} alt="QR" style={{ borderRadius: "8px" }} />
              ) : (
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Connect wallet for QR</span>
              )}
            </div>
            <div style={{ color: "#fff", fontWeight: "600", marginBottom: "8px" }}>Your Wallet Address</div>
            <div style={{ padding: "10px 16px", borderRadius: "8px", fontFamily: "monospace", background: "#0a0a0f", color: "#6b7280", fontSize: "11px", marginBottom: "16px", wordBreak: "break-all" }}>
              {connected ? (typeof window !== "undefined" ? (window as any).ethereum?.selectedAddress : "") : "No wallet connected"}
            </div>
            <button onClick={() => { if (typeof window !== "undefined" && (window as any).ethereum?.selectedAddress) navigator.clipboard.writeText((window as any).ethereum.selectedAddress); }} style={{
              padding: "10px 24px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer",
            }}>Copy Address</button>
          </div>
        </div>
      )}
    </div>
  );
}
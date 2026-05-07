"use client";
import { useState } from "react";

export default function Swap({ connected }: { connected: boolean }) {
  const [fromToken, setFromToken] = useState("USDC");
  const [toToken, setToToken] = useState("EURC");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleSwap = async () => {
    if (!connected) { setStatus("Please connect your wallet first!"); return; }
    if (!amount) { setStatus("Please enter an amount!"); return; }
    if (parseFloat(amount) <= 0) { setStatus("Amount must be greater than 0!"); return; }
    setLoading(true);
    setStatus("Waiting for MetaMask approval...");
    setTxHash("");
    try {
      const { getSigner, CONTRACTS, ERC20_ABI } = await import("@/lib/blockchain");
      const { ethers } = await import("ethers");
      const signer = await getSigner();

      if (fromToken === "USDC") {
        // USDC → EURC: USDC native gönder, EURC al (simülasyon — gerçek DEX olmadığı için transfer)
        const tx = await signer.sendTransaction({
          to: await signer.getAddress(),
          value: ethers.parseUnits(amount, 18),
        });
        await tx.wait();
        setTxHash(tx.hash);
      } else {
        // EURC → USDC
        const eurc = new ethers.Contract(CONTRACTS.EURC, ERC20_ABI, signer);
        const tx = await eurc.transfer(await signer.getAddress(), ethers.parseUnits(amount, 6));
        await tx.wait();
        setTxHash(tx.hash);
      }
      setStatus("✅ Swap completed!");
      setAmount("");
    } catch (err: any) {
      setStatus(err.message?.includes("rejected") ? "❌ Rejected by user." : `❌ Error: ${err.message?.slice(0, 80)}`);
    }
    setLoading(false);
  };

  const handleFlip = () => {
    setFromToken(toToken);
    setToToken(fromToken);
  };

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Swap</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Exchange USDC ↔ EURC on Arc Testnet</p>
      </div>

      <div style={{ maxWidth: "480px" }}>
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>

          {/* From */}
          <div style={{ padding: "16px", borderRadius: "12px", marginBottom: "8px", background: "#0a0a0f", border: "1px solid #1a1a2e" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>YOU PAY</span>
              <span style={{ color: "#6b7280", fontSize: "11px" }}>Balance: —</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <input value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00" type="number" style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  color: "#fff", fontSize: "28px", fontWeight: "700",
                }} />
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)" }}>
                <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>{fromToken}</span>
              </div>
            </div>
          </div>

          {/* Flip */}
          <div style={{ display: "flex", justifyContent: "center", margin: "4px 0" }}>
            <button onClick={handleFlip} style={{
              width: "40px", height: "40px", borderRadius: "12px", border: "none",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              color: "#fff", fontSize: "18px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>⇅</button>
          </div>

          {/* To */}
          <div style={{ padding: "16px", borderRadius: "12px", marginBottom: "16px", background: "#0a0a0f", border: "1px solid #1a1a2e" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>YOU RECEIVE</span>
              <span style={{ color: "#6b7280", fontSize: "11px" }}>Balance: —</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: 1, color: "#6b7280", fontSize: "28px", fontWeight: "700" }}>
                {amount ? (parseFloat(amount) * 0.98).toFixed(4) : "0.00"}
              </div>
              <div style={{ padding: "8px 14px", borderRadius: "10px", background: "rgba(139,92,246,0.15)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <span style={{ color: "#fff", fontWeight: "700", fontSize: "14px" }}>{toToken}</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div style={{ marginBottom: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { label: "Exchange Rate", value: `1 ${fromToken} ≈ 0.98 ${toToken}` },
              { label: "Slippage", value: "0.5%", color: "#10b981" },
              { label: "Network", value: "Arc Testnet", color: "#3b82f6" },
            ].map((row) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>{row.label}</span>
                <span style={{ color: row.color || "#fff", fontSize: "12px", fontWeight: "600" }}>{row.value}</span>
              </div>
            ))}
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

          <button onClick={handleSwap} disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
            color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}>{loading ? "Processing..." : "Swap Tokens →"}</button>
        </div>
      </div>
    </div>
  );
}
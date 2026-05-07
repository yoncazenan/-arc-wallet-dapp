"use client";
import { useState, useEffect } from "react";

interface Participant {
  address: string;
  paid: boolean;
}

interface SplitData {
  total: string;
  token: string;
  participants: Participant[];
  perPerson: string;
  creatorAddress: string;
  createdAt: number;
}

export default function SplitPay({ connected }: { connected: boolean }) {
  const [total, setTotal] = useState("");
  const [token, setToken] = useState("USDC");
  const [participants, setParticipants] = useState<Participant[]>([
    { address: "", paid: false },
    { address: "", paid: false },
  ]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [splitCreated, setSplitCreated] = useState(false);
  const [payLink, setPayLink] = useState("");
  const [splitData, setSplitData] = useState<SplitData | null>(null);

  // Gelen ödeme isteği (hash'ten)
  const [incomingPayment, setIncomingPayment] = useState<{
    to: string; amount: string; token: string;
  } | null>(null);
  const [payStatus, setPayStatus] = useState("");
  const [payLoading, setPayLoading] = useState(false);

  // Sayfa açılışında: hash veya localStorage kontrol et
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Hash'ten gelen ödeme linki: #pay=split&to=...&amount=...&token=...
    const hash = window.location.hash;
    if (hash.startsWith("#pay=split")) {
      const params = new URLSearchParams(hash.slice(1));
      const to = params.get("to");
      const amount = params.get("amount");
      const tokenParam = params.get("token");
      if (to && amount && tokenParam) {
        setIncomingPayment({ to, amount, token: tokenParam });
        return;
      }
    }

    // localStorage'dan kayıtlı split var mı?
    const saved = localStorage.getItem("arc_split_active");
    if (saved) {
      try {
        const parsed: SplitData = JSON.parse(saved);
        // 24 saatten eski değilse yükle
        if (Date.now() - parsed.createdAt < 24 * 60 * 60 * 1000) {
          setSplitData(parsed);
          setTotal(parsed.total);
          setToken(parsed.token);
          setParticipants(parsed.participants);
          setSplitCreated(true);
          const base = window.location.origin + window.location.pathname;
          const link = `${base}#pay=split&to=${parsed.creatorAddress}&amount=${parsed.perPerson}&token=${parsed.token}`;
          setPayLink(link);
        } else {
          localStorage.removeItem("arc_split_active");
        }
      } catch {
        localStorage.removeItem("arc_split_active");
      }
    }
  }, []);

  const perPerson =
    participants.length > 0 && total
      ? (parseFloat(total) / participants.length).toFixed(4)
      : "0";

  const addParticipant = () =>
    setParticipants([...participants, { address: "", paid: false }]);

  const removeParticipant = (i: number) => {
    if (participants.length <= 2) return;
    setParticipants(participants.filter((_, idx) => idx !== i));
  };

  const updateAddress = (i: number, val: string) => {
    const updated = [...participants];
    updated[i].address = val;
    setParticipants(updated);
  };

  const handleCreateSplit = async () => {
    if (!connected) { setStatus("Please connect your wallet first!"); return; }
    if (!total || parseFloat(total) <= 0) { setStatus("Please enter a valid total amount!"); return; }
    setLoading(true);
    try {
      const addr = (window as any).ethereum?.selectedAddress || "";
      const base = window.location.origin + window.location.pathname;
      const link = `${base}#pay=split&to=${addr}&amount=${perPerson}&token=${token}`;

      const data: SplitData = {
        total,
        token,
        participants,
        perPerson,
        creatorAddress: addr,
        createdAt: Date.now(),
      };

      localStorage.setItem("arc_split_active", JSON.stringify(data));
      setSplitData(data);
      setPayLink(link);
      setSplitCreated(true);
      setStatus("✅ Split created! Share the link or QR with participants.");
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message?.slice(0, 60)}`);
    }
    setLoading(false);
  };

  const handlePayIncoming = async () => {
    if (!connected || !incomingPayment) return;
    setPayLoading(true);
    setPayStatus("Waiting for MetaMask approval...");
    try {
      const { sendUSDC, sendEURC } = await import("@/lib/blockchain");
      const hash =
        incomingPayment.token === "USDC"
          ? await sendUSDC(incomingPayment.to, incomingPayment.amount)
          : await sendEURC(incomingPayment.to, incomingPayment.amount);
      setPayStatus(`✅ Payment sent! TX: ${hash.slice(0, 24)}...`);
    } catch (err: any) {
      setPayStatus(
        err.message?.includes("rejected")
          ? "❌ Rejected."
          : `❌ Error: ${err.message?.slice(0, 60)}`
      );
    }
    setPayLoading(false);
  };

  const markPaid = (i: number) => {
    const updated = [...participants];
    updated[i].paid = true;
    setParticipants(updated);
    if (splitData) {
      const newData = { ...splitData, participants: updated };
      localStorage.setItem("arc_split_active", JSON.stringify(newData));
      setSplitData(newData);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(payLink);
    setStatus("✅ Link copied!");
    setTimeout(() => setStatus(""), 2000);
  };

  const resetSplit = () => {
    localStorage.removeItem("arc_split_active");
    setSplitCreated(false);
    setPayLink("");
    setStatus("");
    setTotal("");
    setSplitData(null);
    setParticipants([{ address: "", paid: false }, { address: "", paid: false }]);
    // hash'i temizle
    window.history.replaceState(null, "", window.location.pathname);
  };

  const paidCount = participants.filter((p) => p.paid).length;

  // ── Gelen ödeme ekranı ──────────────────────────────────────────────
  if (incomingPayment) {
    return (
      <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "440px", width: "100%", padding: "36px", borderRadius: "24px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px" }}>⊞</div>
            <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "700", margin: "0 0 6px" }}>Split Payment Request</h2>
            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Pay your share of a shared bill on Arc Testnet</p>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", background: "#0a0a0f", border: "1px solid #1a1a2e", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Your Share</span>
              <span style={{ color: "#fff", fontSize: "24px", fontWeight: "700" }}>
                {incomingPayment.amount} {incomingPayment.token}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Pay To</span>
              <span style={{ color: "#3b82f6", fontSize: "12px", fontFamily: "monospace" }}>
                {incomingPayment.to.slice(0, 12)}...{incomingPayment.to.slice(-8)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Network</span>
              <span style={{ color: "#10b981", fontSize: "13px", fontWeight: "600" }}>Arc Testnet</span>
            </div>
          </div>

          {payStatus && (
            <div style={{
              padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px",
              background: payStatus.includes("✅") ? "rgba(16,185,129,0.1)" : payStatus.includes("❌") ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
              color: payStatus.includes("✅") ? "#10b981" : payStatus.includes("❌") ? "#ef4444" : "#3b82f6",
              border: `1px solid ${payStatus.includes("✅") ? "rgba(16,185,129,0.2)" : payStatus.includes("❌") ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}`,
            }}>{payStatus}</div>
          )}

          {!connected ? (
            <div style={{ textAlign: "center", padding: "16px", borderRadius: "10px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", color: "#f59e0b", fontSize: "13px" }}>
              ⚠️ Connect your wallet using the sidebar button first
            </div>
          ) : (
            <button
              onClick={handlePayIncoming}
              disabled={payLoading || payStatus.includes("✅")}
              style={{
                width: "100%", padding: "15px", borderRadius: "12px", border: "none",
                background: payStatus.includes("✅") ? "rgba(16,185,129,0.2)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                color: payStatus.includes("✅") ? "#10b981" : "#fff",
                fontSize: "15px", fontWeight: "700", cursor: "pointer",
                opacity: payLoading ? 0.7 : 1,
              }}
            >
              {payLoading ? "Processing..." : payStatus.includes("✅") ? "✓ Paid!" : `Pay ${incomingPayment.amount} ${incomingPayment.token} →`}
            </button>
          )}

          <button
            onClick={() => { setIncomingPayment(null); window.history.replaceState(null, "", window.location.pathname); }}
            style={{ width: "100%", marginTop: "10px", padding: "11px", borderRadius: "10px", border: "1px solid #1a1a2e", background: "transparent", color: "#6b7280", fontSize: "13px", cursor: "pointer" }}
          >
            Go to Split Pay Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Ana Split Pay ekranı ────────────────────────────────────────────
  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Split Pay</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Split bills — everyone pays their share on-chain</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Sol */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>
            {splitCreated ? "Active Split" : "Create Split"}
          </h3>

          {/* Token */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>TOKEN</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["USDC", "EURC"].map((t) => (
                <button key={t} onClick={() => !splitCreated && setToken(t)} style={{
                  padding: "8px 20px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer",
                  background: token === t ? "rgba(59,130,246,0.2)" : "transparent",
                  border: token === t ? "1px solid rgba(59,130,246,0.5)" : "1px solid #1a1a2e",
                  color: token === t ? "#3b82f6" : "#6b7280",
                  opacity: splitCreated ? 0.6 : 1,
                }}>{t}</button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>TOTAL AMOUNT</div>
            <div style={{ position: "relative" }}>
              <input value={total} onChange={(e) => !splitCreated && setTotal(e.target.value)}
                placeholder="0.00" type="number" disabled={splitCreated} style={{
                  width: "100%", padding: "12px 56px 12px 16px", borderRadius: "10px",
                  background: "#0a0a0f", border: "1px solid #1a1a2e",
                  color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box",
                  opacity: splitCreated ? 0.6 : 1,
                }} />
              <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>{token}</span>
            </div>
          </div>

          {/* Participants */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em" }}>PARTICIPANTS ({participants.length})</div>
              {!splitCreated && (
                <button onClick={addParticipant} style={{ padding: "4px 12px", borderRadius: "6px", fontSize: "11px", fontWeight: "600", cursor: "pointer", border: "none", background: "rgba(59,130,246,0.2)", color: "#3b82f6" }}>+ Add</button>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {participants.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <input value={p.address} onChange={(e) => updateAddress(i, e.target.value)}
                    placeholder={`Participant ${i + 1} (0x...)`} disabled={splitCreated} style={{
                      flex: 1, padding: "10px 14px", borderRadius: "8px",
                      background: "#0a0a0f",
                      border: p.paid ? "1px solid rgba(16,185,129,0.4)" : "1px solid #1a1a2e",
                      color: "#fff", fontSize: "12px", outline: "none",
                      opacity: splitCreated ? 0.7 : 1,
                    }} />
                  {splitCreated ? (
                    <button onClick={() => !p.paid && markPaid(i)} style={{
                      padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", flexShrink: 0,
                      background: p.paid ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                      color: p.paid ? "#10b981" : "#f59e0b",
                      border: "none", cursor: p.paid ? "default" : "pointer",
                    }}>{p.paid ? "✓ Paid" : "Mark Paid"}</button>
                  ) : (
                    <button onClick={() => removeParticipant(i)} style={{
                      width: "30px", height: "30px", borderRadius: "6px", border: "none",
                      background: "rgba(239,68,68,0.15)", color: "#ef4444",
                      cursor: "pointer", fontSize: "16px", flexShrink: 0,
                    }}>×</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {total && (
            <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>Total</span>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>{total} {token}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>Participants</span>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>{participants.length} people</span>
              </div>
              <div style={{ height: "1px", background: "#1a1a2e", margin: "8px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280", fontSize: "12px", fontWeight: "700" }}>Per person</span>
                <span style={{ color: "#3b82f6", fontSize: "14px", fontWeight: "700" }}>{perPerson} {token}</span>
              </div>
            </div>
          )}

          {status && (
            <div style={{
              padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px",
              background: status.includes("✅") ? "rgba(16,185,129,0.1)" : status.includes("❌") ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
              color: status.includes("✅") ? "#10b981" : status.includes("❌") ? "#ef4444" : "#3b82f6",
              border: `1px solid ${status.includes("✅") ? "rgba(16,185,129,0.2)" : status.includes("❌") ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}`,
            }}>{status}</div>
          )}

          {!splitCreated ? (
            <button onClick={handleCreateSplit} disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: "10px", border: "none",
              background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
              color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}>{loading ? "Creating..." : "Create Split →"}</button>
          ) : (
            <button onClick={resetSplit} style={{
              width: "100%", padding: "13px", borderRadius: "10px",
              border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)",
              color: "#ef4444", fontSize: "14px", fontWeight: "600", cursor: "pointer",
            }}>🗑 Delete & New Split</button>
          )}
        </div>

        {/* Sağ */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
            <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>Share Payment Link</h3>

            {splitCreated ? (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <div style={{ padding: "12px", borderRadius: "12px", background: "#fff" }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(payLink)}`}
                      alt="QR"
                      style={{ display: "block", borderRadius: "4px" }}
                    />
                  </div>
                </div>

                <div style={{ padding: "10px 14px", borderRadius: "8px", background: "#0a0a0f", border: "1px solid #1a1a2e", marginBottom: "12px" }}>
                  <div style={{ color: "#6b7280", fontSize: "10px", fontWeight: "700", marginBottom: "4px", letterSpacing: "0.08em" }}>PAYMENT LINK</div>
                  <div style={{ color: "#3b82f6", fontSize: "11px", wordBreak: "break-all" }}>{payLink}</div>
                </div>

                <button onClick={copyLink} style={{
                  width: "100%", padding: "11px", borderRadius: "10px", border: "none",
                  background: "rgba(59,130,246,0.2)", color: "#3b82f6",
                  fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "12px",
                }}>📋 Copy Link</button>

                <div style={{ padding: "12px 16px", borderRadius: "10px", background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#6b7280", fontSize: "12px" }}>Collected</span>
                    <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "700" }}>{paidCount} / {participants.length} paid</span>
                  </div>
                  <div style={{ height: "6px", borderRadius: "3px", background: "#1a1a2e", overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: "3px",
                      background: "linear-gradient(90deg,#10b981,#3b82f6)",
                      width: `${participants.length > 0 ? (paidCount / participants.length) * 100 : 0}%`,
                      transition: "width 0.4s ease",
                    }} />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px", opacity: 0.3 }}>⊞</div>
                <div style={{ color: "#374151", fontSize: "13px" }}>Create a split to generate QR & link</div>
              </div>
            )}
          </div>

          <div style={{ padding: "20px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
            <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "14px", margin: "0 0 14px 0" }}>How It Works</h3>
            {[
              { icon: "①", text: "Enter total amount & add participants" },
              { icon: "②", text: "Share QR code or copy the payment link" },
              { icon: "③", text: "Each person opens link, connects wallet & pays" },
              { icon: "④", text: "Funds go directly to your wallet on-chain" },
            ].map((item) => (
              <div key={item.icon} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                <span style={{ color: "#3b82f6", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>{item.icon}</span>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
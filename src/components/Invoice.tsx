"use client";
import { useState, useEffect } from "react";

interface Invoice {
  id: string;
  from: string;
  to: string;
  amount: string;
  token: string;
  desc: string;
  status: "pending" | "paid";
  date: string;
  txHash?: string;
}

export default function InvoicePage({ connected }: { connected: boolean }) {
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [token, setToken] = useState("USDC");
  const [msg, setMsg] = useState("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [incomingInvoice, setIncomingInvoice] = useState<Invoice | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [payStatus, setPayStatus] = useState("");

  useEffect(() => {
    // Hash'ten gelen ödeme linki kontrol et
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#pay=invoice")) {
        const params = new URLSearchParams(hash.slice(1));
        const to = params.get("to");
        const amount = params.get("amount");
        const tokenParam = params.get("token");
        const id = params.get("id");
        const desc = params.get("desc");
        if (to && amount && tokenParam) {
          setIncomingInvoice({
            id: id || "INV",
            from: "",
            to,
            amount,
            token: tokenParam,
            desc: desc || "",
            status: "pending",
            date: new Date().toLocaleDateString(),
          });
          return;
        }
      }
    }

    // localStorage'dan fatura geçmişini yükle
    const saved = localStorage.getItem("arc_invoices");
    if (saved) {
      try { setInvoices(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveInvoices = (list: Invoice[]) => {
    setInvoices(list);
    localStorage.setItem("arc_invoices", JSON.stringify(list));
  };

  const handleCreate = () => {
    if (!connected) { setMsg("❌ Please connect your wallet first!"); return; }
    if (!amount || !desc) { setMsg("❌ Please fill in all fields!"); return; }

    const myAddr = (window as any).ethereum?.selectedAddress || "";
    const newInvoice: Invoice = {
      id: `INV-${Date.now()}`,
      from: myAddr,
      to: myAddr,  // para sana gelecek
      amount, token, desc,
      status: "pending",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };

    saveInvoices([newInvoice, ...invoices]);
    setTo(""); setAmount(""); setDesc("");
    setMsg("✅ Invoice created! Share the payment link.");
    setTimeout(() => setMsg(""), 4000);
  };

  const copyPayLink = (inv: Invoice) => {
    const base = window.location.origin + window.location.pathname;
    const link = `${base}#pay=invoice&to=${inv.from}&amount=${inv.amount}&token=${inv.token}&id=${inv.id}&desc=${encodeURIComponent(inv.desc)}`;
    navigator.clipboard.writeText(link);
    setMsg("✅ Payment link copied! Send to your client.");
    setTimeout(() => setMsg(""), 3000);
  };

  const handlePayIncoming = async () => {
    if (!connected || !incomingInvoice) return;
    setPayLoading(true);
    setPayStatus("Waiting for MetaMask approval...");
    try {
      const { sendUSDC, sendEURC } = await import("@/lib/blockchain");
      const hash = incomingInvoice.token === "USDC"
        ? await sendUSDC(incomingInvoice.to, incomingInvoice.amount)
        : await sendEURC(incomingInvoice.to, incomingInvoice.amount);
      setPayStatus(`✅ Payment sent! TX: ${hash.slice(0, 24)}...`);
    } catch (err: any) {
      setPayStatus(
        err.message?.includes("rejected") ? "❌ Rejected." : `❌ Error: ${err.message?.slice(0, 60)}`
      );
    }
    setPayLoading(false);
  };

  const handleDelete = (id: string) => {
    saveInvoices(invoices.filter(i => i.id !== id));
  };

  // ── Gelen fatura ödeme ekranı ──────────────────────────
  if (incomingInvoice) {
    return (
      <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ maxWidth: "440px", width: "100%", padding: "36px", borderRadius: "24px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "20px", background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 16px" }}>▤</div>
            <h2 style={{ color: "#fff", fontSize: "22px", fontWeight: "700", margin: "0 0 6px" }}>Invoice Payment</h2>
            <p style={{ color: "#6b7280", fontSize: "13px", margin: 0 }}>Pay this invoice on Arc Testnet</p>
          </div>

          <div style={{ padding: "20px", borderRadius: "14px", background: "#0a0a0f", border: "1px solid #1a1a2e", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Invoice</span>
              <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>{incomingInvoice.id}</span>
            </div>
            {incomingInvoice.desc && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                <span style={{ color: "#6b7280", fontSize: "13px" }}>Description</span>
                <span style={{ color: "#fff", fontSize: "13px" }}>{incomingInvoice.desc}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Amount</span>
              <span style={{ color: "#fff", fontSize: "24px", fontWeight: "700" }}>{incomingInvoice.amount} {incomingInvoice.token}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
              <span style={{ color: "#6b7280", fontSize: "13px" }}>Pay To</span>
              <span style={{ color: "#3b82f6", fontSize: "12px", fontFamily: "monospace" }}>
                {incomingInvoice.to.slice(0, 12)}...{incomingInvoice.to.slice(-8)}
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
              {payLoading ? "Processing..." : payStatus.includes("✅") ? "✓ Paid!" : `Pay ${incomingInvoice.amount} ${incomingInvoice.token} →`}
            </button>
          )}

          <button
            onClick={() => { setIncomingInvoice(null); window.history.replaceState(null, "", window.location.pathname); }}
            style={{ width: "100%", marginTop: "10px", padding: "11px", borderRadius: "10px", border: "1px solid #1a1a2e", background: "transparent", color: "#6b7280", fontSize: "13px", cursor: "pointer" }}
          >
            Go to Invoice Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Ana Invoice ekranı ─────────────────────────────────
  const pendingCount = invoices.filter(i => i.status === "pending").length;
  const paidCount = invoices.filter(i => i.status === "paid").length;

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Invoices</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Create invoices — clients pay via link on-chain</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Total", value: invoices.length, color: "#3b82f6" },
          { label: "Pending", value: pendingCount, color: "#f59e0b" },
          { label: "Paid", value: paidCount, color: "#10b981" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "16px 20px", borderRadius: "12px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
            <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "6px" }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: "24px", fontWeight: "700" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>

        {/* Create */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>New Invoice</h3>

          <div style={{ marginBottom: "16px" }}>
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
            <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>DESCRIPTION</div>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Logo design, consulting..." style={{
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

          {msg && (
            <div style={{
              padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", fontSize: "13px",
              background: msg.includes("✅") ? "rgba(16,185,129,0.1)" : msg.includes("❌") ? "rgba(239,68,68,0.1)" : "rgba(59,130,246,0.1)",
              color: msg.includes("✅") ? "#10b981" : msg.includes("❌") ? "#ef4444" : "#3b82f6",
              border: `1px solid ${msg.includes("✅") ? "rgba(16,185,129,0.2)" : msg.includes("❌") ? "rgba(239,68,68,0.2)" : "rgba(59,130,246,0.2)"}`,
            }}>{msg}</div>
          )}

          <button onClick={handleCreate} style={{
            width: "100%", padding: "13px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
          }}>Create Invoice & Get Link →</button>
        </div>

        {/* History */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e", maxHeight: "600px", overflowY: "auto" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>Invoice History</h3>

          {invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px", opacity: 0.3 }}>▤</div>
              <div style={{ color: "#374151", fontSize: "13px" }}>No invoices yet</div>
              <div style={{ color: "#374151", fontSize: "12px", marginTop: "6px" }}>Create one and share the link with your client</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {invoices.map((inv) => (
                <div key={inv.id} style={{
                  padding: "16px", borderRadius: "12px", background: "#0a0a0f",
                  border: inv.status === "paid" ? "1px solid rgba(16,185,129,0.2)" : "1px solid #1a1a2e",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div>
                      <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>{inv.id}</div>
                      <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>{inv.desc}</div>
                      <div style={{ color: "#374151", fontSize: "10px", marginTop: "2px" }}>{inv.date}</div>
                    </div>
                    <span style={{
                      padding: "3px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700",
                      background: inv.status === "paid" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
                      color: inv.status === "paid" ? "#10b981" : "#f59e0b",
                    }}>{inv.status === "paid" ? "✓ Paid" : "Pending"}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace" }}>
                      {inv.to.slice(0, 10)}...{inv.to.slice(-6)}
                    </div>
                    <div style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>{inv.amount} {inv.token}</div>
                  </div>

                  {inv.txHash && (
                    <a href={`https://testnet.arcscan.app/tx/${inv.txHash}`} target="_blank" style={{ color: "#3b82f6", fontSize: "11px", display: "block", marginBottom: "10px" }}>
                      TX: {inv.txHash.slice(0, 18)}... →
                    </a>
                  )}

                  <div style={{ display: "flex", gap: "8px" }}>
                    {inv.status === "pending" && (
                      <button onClick={() => copyPayLink(inv)} style={{
                        flex: 1, padding: "7px", borderRadius: "8px", border: "none",
                        background: "rgba(59,130,246,0.2)", color: "#3b82f6",
                        fontSize: "12px", fontWeight: "600", cursor: "pointer",
                      }}>🔗 Copy Payment Link</button>
                    )}
                    <button onClick={() => handleDelete(inv.id)} style={{
                      padding: "7px 12px", borderRadius: "8px", border: "none",
                      background: "rgba(239,68,68,0.1)", color: "#ef4444",
                      fontSize: "12px", cursor: "pointer",
                    }}>🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
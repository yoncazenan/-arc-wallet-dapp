"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import Send from "@/components/Send";
import Swap from "@/components/Swap";
import Invoice from "@/components/Invoice";
import Settings from "@/components/Settings";
import SplitPay from "@/components/SplitPay";

export default function Home() {
  const [active, setActive] = useState("dashboard");
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash.startsWith("#pay=split")) setActive("split");
      if (hash.startsWith("#pay=invoice")) setActive("invoice");
    }
  }, []);

  const handleConnect = async () => {
    if (connected) { setConnected(false); setAddress(""); return; }
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        await (window as any).ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: "0x4cef52",
            chainName: "Arc Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
            rpcUrls: ["https://arc-testnet.drpc.org"],
            blockExplorerUrls: ["https://testnet.arcscan.app"],
          }],
        });
        setAddress(accounts[0]);
        setConnected(true);
      } catch (err) { console.error(err); }
    } else {
      alert("MetaMask not found!");
    }
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard connected={connected} address={address} />;
      case "wallet":    return <WalletPage connected={connected} address={address} />;
      case "send":      return <Send connected={connected} />;
      case "swap":      return <Swap connected={connected} />;
      case "invoice":   return <Invoice connected={connected} />;
      case "settings":  return <Settings connected={connected} address={address} />;
      case "streams":   return <StreamsPage connected={connected} address={address} />;
      case "split":     return <SplitPay connected={connected} />;
      default:          return <Dashboard connected={connected} address={address} />;
    }
  };

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", overflow: "hidden", background: "#0a0a0f" }}>
      <Sidebar active={active} setActive={setActive} connected={connected} address={address} onConnect={handleConnect} />
      <main style={{ marginLeft: "240px", flex: 1, overflowY: "auto", background: "#0a0a0f" }}>
        {renderPage()}
      </main>
    </div>
  );
}

// ── Wallet Page ──────────────────────────────────────────────────────
function WalletPage({ connected, address }: { connected: boolean; address: string }) {
  const [copied, setCopied] = useState(false);
  const [usdcBal, setUsdcBal] = useState("0.0000");
  const [eurcBal, setEurcBal] = useState("0.0000");
  const [txList, setTxList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (connected && address) loadData(); }, [connected, address]);

  const loadData = async () => {
    setLoading(true);
    try {
      const { getUSDCBalance, getEURCBalance, getTransactionHistory } = await import("@/lib/blockchain");
      const [usdc, eurc, txs] = await Promise.all([
        getUSDCBalance(address),
        getEURCBalance(address),
        getTransactionHistory(address),
      ]);
      setUsdcBal(parseFloat(usdc).toFixed(4));
      setEurcBal(parseFloat(eurc).toFixed(4));
      setTxList(txs);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ marginBottom: "28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Wallet</h2>
          <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Real-time balances on Arc Testnet</p>
        </div>
        <button onClick={loadData} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "rgba(59,130,246,0.2)", color: "#3b82f6", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
          {loading ? "Loading..." : "↻ Refresh"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", maxWidth: "700px", marginBottom: "28px" }}>
        <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(135deg,rgba(59,130,246,0.15),rgba(139,92,246,0.15))", border: "1px solid rgba(59,130,246,0.3)" }}>
          <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600", marginBottom: "12px" }}>USDC Balance</div>
          <div style={{ color: "#fff", fontSize: "32px", fontWeight: "700" }}>{loading ? "..." : usdcBal}</div>
          <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "6px" }}>Native • Arc Testnet</div>
        </div>
        <div style={{ padding: "24px", borderRadius: "16px", background: "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(16,185,129,0.15))", border: "1px solid rgba(139,92,246,0.3)" }}>
          <div style={{ color: "#6b7280", fontSize: "12px", fontWeight: "600", marginBottom: "12px" }}>EURC Balance</div>
          <div style={{ color: "#fff", fontSize: "32px", fontWeight: "700" }}>{loading ? "..." : eurcBal}</div>
          <div style={{ color: "#6b7280", fontSize: "12px", marginTop: "6px" }}>ERC-20 • Arc Testnet</div>
        </div>
        <div style={{ gridColumn: "1/-1", padding: "20px 24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "10px", letterSpacing: "0.08em" }}>WALLET ADDRESS</div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ flex: 1, color: "#fff", fontFamily: "monospace", fontSize: "13px", wordBreak: "break-all" }}>
              {connected ? address : "No wallet connected"}
            </div>
            {connected && (
              <button onClick={() => { navigator.clipboard.writeText(address); setCopied(true); setTimeout(() => setCopied(false), 2000); }} style={{
                padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", border: "none", flexShrink: 0,
                background: copied ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)",
                color: copied ? "#10b981" : "#3b82f6",
              }}>{copied ? "✓ Copied" : "Copy"}</button>
            )}
          </div>
        </div>
      </div>

      {/* TX History */}
      <div style={{ maxWidth: "700px" }}>
        <h3 style={{ color: "#fff", fontSize: "16px", fontWeight: "600", marginBottom: "16px" }}>Transaction History</h3>
        <div style={{ borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e", overflow: "hidden" }}>
          {!connected ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#374151" }}>Connect wallet to see transactions</div>
          ) : loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Scanning blockchain...</div>
          ) : txList.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#374151" }}>No recent transactions found</div>
          ) : (
            txList.map((tx, i) => (
              <div key={tx.hash} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 20px", borderBottom: i < txList.length - 1 ? "1px solid #1a1a2e" : "none" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", background: tx.type === "sent" ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)" }}>
                  {tx.type === "sent" ? "↑" : "↓"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600", marginBottom: "2px" }}>{tx.type === "sent" ? "Sent" : "Received"}</div>
                  <div style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace" }}>{tx.hash.slice(0, 14)}...{tx.hash.slice(-8)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: tx.type === "sent" ? "#ef4444" : "#10b981" }}>
                    {tx.type === "sent" ? "-" : "+"}{parseFloat(tx.value).toFixed(4)} USDC
                  </div>
                  <div style={{ color: "#374151", fontSize: "11px", marginTop: "2px" }}>Block #{tx.blockNumber}</div>
                </div>
                <a href={`https://testnet.arcscan.app/tx/${tx.hash}`} target="_blank" style={{ color: "#3b82f6", fontSize: "18px", textDecoration: "none", flexShrink: 0 }}>→</a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Streams Page ─────────────────────────────────────────────────────
function StreamsPage({ connected, address }: { connected: boolean; address: string }) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [duration, setDuration] = useState("30");
  const [token, setToken] = useState("USDC");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [myStreams, setMyStreams] = useState<any[]>([]);
  const [streamsLoading, setStreamsLoading] = useState(false);

  useEffect(() => { if (connected && address) loadMyStreams(); }, [connected, address]);

  const loadMyStreams = async () => {
    setStreamsLoading(true);
    try {
      const { getStreamDetails, CONTRACTS } = await import("@/lib/blockchain");
      const { ethers } = await import("ethers");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const contract = new ethers.Contract(
        CONTRACTS.PAYMENT_STREAM,
        ["function getSenderStreams(address) view returns (uint256[])", "function getRecipientStreams(address) view returns (uint256[])"],
        provider
      );
      const sentIds: bigint[] = await contract.getSenderStreams(address);
      const recvIds: bigint[] = await contract.getRecipientStreams(address);
      const allIds = [...new Set([...sentIds.map(String), ...recvIds.map(String)])];
      const details = await Promise.all(allIds.map(id => getStreamDetails(Number(id)).then(d => ({ id: Number(id), ...d })).catch(() => null)));
      setMyStreams(details.filter(Boolean));
    } catch (err) { console.error(err); }
    setStreamsLoading(false);
  };

  const handleCreate = async () => {
    if (!connected) { setStatus("Please connect your wallet first!"); return; }
    if (!recipient || !amount) { setStatus("Please fill in all fields!"); return; }
    if (!recipient.startsWith("0x") || recipient.length !== 42) { setStatus("Invalid recipient address!"); return; }
    setLoading(true);
    setStatus("Waiting for MetaMask approval...");
    try {
      const { createStream, CONTRACTS } = await import("@/lib/blockchain");
      const tokenAddress = token === "USDC" ? CONTRACTS.USDC : CONTRACTS.EURC;
      const durationSeconds = parseInt(duration) * 24 * 60 * 60;
      const hash = await createStream(recipient, tokenAddress, amount, durationSeconds);
      setStatus(`✅ Stream created! TX: ${hash.slice(0, 22)}...`);
      setRecipient(""); setAmount("");
      setTimeout(() => loadMyStreams(), 3000);
    } catch (err: any) {
      if (err.message?.includes("rejected") || err.message?.includes("denied")) {
        setStatus("❌ Transaction rejected.");
      } else if (err.message?.includes("Insufficient")) {
        setStatus(`❌ ${err.message}`);
      } else {
        setStatus(`❌ Error: ${err.message?.slice(0, 80)}`);
      }
    }
    setLoading(false);
  };

  const handleWithdraw = async (streamId: number) => {
    setLoading(true);
    try {
      const { withdrawFromStream } = await import("@/lib/blockchain");
      const hash = await withdrawFromStream(streamId);
      setStatus(`✅ Withdrawn! TX: ${hash.slice(0, 22)}...`);
      setTimeout(() => loadMyStreams(), 3000);
    } catch (err: any) {
      setStatus(`❌ ${err.message?.slice(0, 80)}`);
    }
    setLoading(false);
  };

  const handleCancel = async (streamId: number) => {
    setLoading(true);
    try {
      const { cancelStream } = await import("@/lib/blockchain");
      const hash = await cancelStream(streamId);
      setStatus(`✅ Cancelled! TX: ${hash.slice(0, 22)}...`);
      setTimeout(() => loadMyStreams(), 3000);
    } catch (err: any) {
      setStatus(`❌ ${err.message?.slice(0, 80)}`);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "#0a0a0f" }}>
      <div style={{ marginBottom: "28px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#fff", margin: 0 }}>Payment Streams</h2>
        <p style={{ color: "#6b7280", fontSize: "13px", marginTop: "4px" }}>Automated recurring payments on Arc Testnet</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* New Stream */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>New Stream</h3>

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
            <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>RECIPIENT</div>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="0x..." style={{ width: "100%", padding: "12px 16px", borderRadius: "10px", background: "#0a0a0f", border: "1px solid #1a1a2e", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>TOTAL AMOUNT</div>
            <div style={{ position: "relative" }}>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" style={{ width: "100%", padding: "12px 56px 12px 16px", borderRadius: "10px", background: "#0a0a0f", border: "1px solid #1a1a2e", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              <span style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", fontSize: "12px", fontWeight: "600" }}>{token}</span>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <div style={{ color: "#6b7280", fontSize: "11px", fontWeight: "700", marginBottom: "8px", letterSpacing: "0.08em" }}>DURATION</div>
            <div style={{ display: "flex", gap: "8px" }}>
              {["7", "30", "90", "365"].map((d) => (
                <button key={d} onClick={() => setDuration(d)} style={{
                  padding: "8px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600", cursor: "pointer",
                  background: duration === d ? "rgba(59,130,246,0.2)" : "transparent",
                  border: duration === d ? "1px solid rgba(59,130,246,0.5)" : "1px solid #1a1a2e",
                  color: duration === d ? "#3b82f6" : "#6b7280",
                }}>{d}d</button>
              ))}
            </div>
          </div>

          {amount && (
            <div style={{ padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", background: "rgba(59,130,246,0.05)", border: "1px solid rgba(59,130,246,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>Rate</span>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>{(parseFloat(amount) / parseInt(duration)).toFixed(4)} {token}/day</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#6b7280", fontSize: "12px" }}>Duration</span>
                <span style={{ color: "#fff", fontSize: "12px", fontWeight: "600" }}>{duration} days</span>
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

          <button onClick={handleCreate} disabled={loading} style={{
            width: "100%", padding: "13px", borderRadius: "10px", border: "none",
            background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
            color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer", opacity: loading ? 0.7 : 1,
          }}>{loading ? "Processing..." : "Create Stream →"}</button>
        </div>

        {/* Info */}
        <div style={{ padding: "24px", borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e" }}>
          <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: "0 0 20px 0" }}>How It Works</h3>
          {[
            { icon: "①", title: "Create Stream", desc: "Lock USDC or EURC in the smart contract with recipient and duration" },
            { icon: "②", title: "Tokens Flow", desc: "Recipient can withdraw earned tokens at any time" },
            { icon: "③", title: "Cancel Anytime", desc: "Sender can cancel — remaining tokens returned automatically" },
          ].map((item) => (
            <div key={item.icon} style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(59,130,246,0.15)", color: "#3b82f6", fontSize: "16px", fontWeight: "700" }}>{item.icon}</div>
              <div>
                <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{item.title}</div>
                <div style={{ color: "#6b7280", fontSize: "12px" }}>{item.desc}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ color: "#10b981", fontSize: "12px", fontWeight: "700", marginBottom: "8px" }}>SMART CONTRACT</div>
            <div style={{ color: "#fff", fontSize: "11px", fontFamily: "monospace", wordBreak: "break-all" }}>0x98c28d49ff2fc07006ffe7d434e3b28f1204d9ab</div>
            <a href="https://testnet.arcscan.app/address/0x98c28d49ff2fc07006ffe7d434e3b28f1204d9ab" target="_blank" style={{ color: "#3b82f6", fontSize: "12px", marginTop: "8px", display: "block" }}>View on Explorer →</a>
          </div>
        </div>
      </div>

      {/* My Streams */}
      {connected && (
        <div style={{ borderRadius: "16px", background: "#0d0d1a", border: "1px solid #1a1a2e", overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #1a1a2e", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ color: "#fff", fontWeight: "600", fontSize: "15px", margin: 0 }}>My Streams</h3>
            <button onClick={loadMyStreams} style={{ padding: "6px 14px", borderRadius: "8px", border: "none", background: "rgba(59,130,246,0.2)", color: "#3b82f6", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>↻ Refresh</button>
          </div>
          {streamsLoading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Loading streams...</div>
          ) : myStreams.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#374151" }}>No streams yet</div>
          ) : (
            myStreams.map((s) => {
              const isSender = s.sender?.toLowerCase() === address.toLowerCase();
              const isActive = s.active;
              const token = s.isNative ? "USDC" : "EURC";
              const decimals = s.isNative ? 18 : 6;
              const { ethers } = require("ethers");
              const total = s.totalAmount ? parseFloat(ethers.formatUnits(s.totalAmount, decimals)).toFixed(4) : "0";
              return (
                <div key={s.id} style={{ padding: "20px 24px", borderBottom: "1px solid #1a1a2e", display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? "rgba(16,185,129,0.15)" : "rgba(107,114,128,0.15)", fontSize: "18px" }}>
                    {isActive ? "⟳" : "✓"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>Stream #{s.id}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", background: isSender ? "rgba(59,130,246,0.15)" : "rgba(139,92,246,0.15)", color: isSender ? "#3b82f6" : "#8b5cf6" }}>{isSender ? "SENDING" : "RECEIVING"}</span>
                      <span style={{ padding: "2px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "700", background: isActive ? "rgba(16,185,129,0.15)" : "rgba(107,114,128,0.15)", color: isActive ? "#10b981" : "#6b7280" }}>{isActive ? "ACTIVE" : "ENDED"}</span>
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "11px", fontFamily: "monospace" }}>
                      {isSender ? `To: ${s.recipient?.slice(0, 12)}...${s.recipient?.slice(-6)}` : `From: ${s.sender?.slice(0, 12)}...${s.sender?.slice(-6)}`}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", marginRight: "12px" }}>
                    <div style={{ color: "#fff", fontSize: "14px", fontWeight: "700" }}>{total} {token}</div>
                    <div style={{ color: "#6b7280", fontSize: "11px" }}>Total</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {!isSender && isActive && (
                      <button onClick={() => handleWithdraw(s.id)} disabled={loading} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(16,185,129,0.2)", color: "#10b981", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Withdraw</button>
                    )}
                    {isSender && isActive && (
                      <button onClick={() => handleCancel(s.id)} disabled={loading} style={{ padding: "7px 14px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>Cancel</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
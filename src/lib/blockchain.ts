import { ethers } from "ethers";

export const CONTRACTS = {
  USDC: "0x3600000000000000000000000000000000000000",
  EURC: "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a",
  PAYMENT_STREAM: "0x98c28d49ff2fc07006ffe7d434e3b28f1204d9ab",
};

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

export const PAYMENT_STREAM_ABI = [
  "function createStream(address recipient, address token, uint256 totalAmount, uint256 durationInSeconds) payable returns (uint256)",
  "function withdraw(uint256 streamId)",
  "function cancelStream(uint256 streamId)",
  "function withdrawable(uint256 streamId) view returns (uint256)",
  "function getStream(uint256 streamId) view returns (tuple(address sender, address recipient, address token, uint256 totalAmount, uint256 startTime, uint256 endTime, uint256 withdrawn, bool active, bool isNative))",
  "function getSenderStreams(address sender) view returns (uint256[])",
  "function getRecipientStreams(address recipient) view returns (uint256[])",
];

export async function getProvider() {
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  throw new Error("MetaMask not found");
}

export async function getSigner() {
  const provider = await getProvider();
  return provider.getSigner();
}

export async function getUSDCBalance(address: string): Promise<string> {
  const provider = await getProvider();
  const balance = await provider.getBalance(address);
  return ethers.formatUnits(balance, 18);
}

export async function getEURCBalance(address: string): Promise<string> {
  try {
    const provider = await getProvider();
    const contract = new ethers.Contract(CONTRACTS.EURC, ERC20_ABI, provider);
    const balance = await contract.balanceOf(address);
    return ethers.formatUnits(balance, 6);
  } catch {
    return "0";
  }
}

export async function getTransactionHistory(address: string): Promise<any[]> {
  try {
    const provider = await getProvider();
    const latest = await provider.getBlockNumber();
    const from = Math.max(0, latest - 200);
    const txList: any[] = [];
    for (let i = latest; i >= from && txList.length < 10; i--) {
      try {
        const block = await provider.getBlock(i, true);
        if (!block?.transactions) continue;
        for (const tx of block.transactions) {
          if (typeof tx === "object" && tx !== null) {
            const t = tx as any;
            const isRelated =
              t.from?.toLowerCase() === address.toLowerCase() ||
              t.to?.toLowerCase() === address.toLowerCase();
            if (isRelated) {
              txList.push({
                hash: t.hash,
                from: t.from,
                to: t.to,
                value: ethers.formatUnits(t.value || 0, 18),
                type: t.from?.toLowerCase() === address.toLowerCase() ? "sent" : "received",
                blockNumber: i,
              });
              if (txList.length >= 10) break;
            }
          }
        }
      } catch {}
    }
    return txList;
  } catch {
    return [];
  }
}

export async function sendUSDC(to: string, amount: string): Promise<string> {
  const signer = await getSigner();
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseUnits(amount, 18),
  });
  await tx.wait();
  return tx.hash;
}

export async function sendEURC(to: string, amount: string): Promise<string> {
  const signer = await getSigner();
  const contract = new ethers.Contract(CONTRACTS.EURC, ERC20_ABI, signer);
  const tx = await contract.transfer(to, ethers.parseUnits(amount, 6));
  await tx.wait();
  return tx.hash;
}

export async function createStream(
  recipient: string,
  token: string,
  amount: string,
  durationSeconds: number
): Promise<string> {
  const signer = await getSigner();
  const signerAddress = await signer.getAddress();
  const isNative = token.toLowerCase() === CONTRACTS.USDC.toLowerCase();
  const streamContract = new ethers.Contract(CONTRACTS.PAYMENT_STREAM, PAYMENT_STREAM_ABI, signer);

  if (isNative) {
    const parsedAmount = ethers.parseUnits(amount, 18);
    const balance = await (signer.provider as any).getBalance(signerAddress);
    if (balance < parsedAmount) {
      throw new Error(`Insufficient USDC. You have ${ethers.formatUnits(balance, 18)} USDC.`);
    }
    const tx = await streamContract.createStream(
      recipient, CONTRACTS.USDC, parsedAmount, durationSeconds,
      { value: parsedAmount }
    );
    await tx.wait();
    return tx.hash;
  } else {
    const parsedAmount = ethers.parseUnits(amount, 6);
    const eurc = new ethers.Contract(CONTRACTS.EURC, ERC20_ABI, signer);
    const balance = await eurc.balanceOf(signerAddress);
    if (balance < parsedAmount) {
      throw new Error(`Insufficient EURC. You have ${ethers.formatUnits(balance, 6)} EURC.`);
    }
    const allowance = await eurc.allowance(signerAddress, CONTRACTS.PAYMENT_STREAM);
    if (allowance < parsedAmount) {
      const approveTx = await eurc.approve(CONTRACTS.PAYMENT_STREAM, parsedAmount);
      await approveTx.wait();
    }
    const tx = await streamContract.createStream(
      recipient, CONTRACTS.EURC, parsedAmount, durationSeconds
    );
    await tx.wait();
    return tx.hash;
  }
}

export async function withdrawFromStream(streamId: number): Promise<string> {
  const signer = await getSigner();
  const contract = new ethers.Contract(CONTRACTS.PAYMENT_STREAM, PAYMENT_STREAM_ABI, signer);
  const tx = await contract.withdraw(streamId);
  await tx.wait();
  return tx.hash;
}

export async function cancelStream(streamId: number): Promise<string> {
  const signer = await getSigner();
  const contract = new ethers.Contract(CONTRACTS.PAYMENT_STREAM, PAYMENT_STREAM_ABI, signer);
  const tx = await contract.cancelStream(streamId);
  await tx.wait();
  return tx.hash;
}

export async function getStreamDetails(streamId: number): Promise<any> {
  const provider = await getProvider();
  const contract = new ethers.Contract(CONTRACTS.PAYMENT_STREAM, PAYMENT_STREAM_ABI, provider);
  return contract.getStream(streamId);
}

export async function getWithdrawable(streamId: number): Promise<string> {
  const provider = await getProvider();
  const contract = new ethers.Contract(CONTRACTS.PAYMENT_STREAM, PAYMENT_STREAM_ABI, provider);
  const amount = await contract.withdrawable(streamId);
  return ethers.formatUnits(amount, 18);
}
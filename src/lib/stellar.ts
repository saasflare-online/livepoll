import { 
  rpc, 
  Contract, 
  Address, 
  scValToNative, 
  nativeToScVal,
  Account,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, RPC_URL, NETWORK_PASSPHRASE } from "./constants";
import { Transaction, FeeBumpTransaction } from "@stellar/stellar-sdk";

/**
 * Robustly reconstructs a Transaction object from an XDR string (Base64 or Hex).
 * This handles variations in how different wallets return signed data.
 */
export function reconstructTransaction(xdr: string): Transaction | FeeBumpTransaction {
  try {
    // Detect Hex (typically 0-9a-f and always even length)
    // Base64 can also have numbers/letters but usually has '/' or '+' or ends in '='
    const isHex = /^[0-9a-fA-F]+$/.test(xdr) && xdr.length % 2 === 0 && !xdr.includes('=');
    const buffer = isHex ? Buffer.from(xdr, "hex") : Buffer.from(xdr, "base64");
    
    console.log(`Reconstructing transaction (Detected format: ${isHex ? 'HEX' : 'BASE64'})`);
    return TransactionBuilder.fromXDR(buffer, NETWORK_PASSPHRASE);
  } catch (e) {
    console.error("XDR Reconstruction Error:", e);
    throw new Error(`Failed to parse signed transaction: ${e instanceof Error ? e.message : 'Unknown XDR format'}`);
  }
}

export const server = new rpc.Server(RPC_URL);

// Contract instance - Safely initialized
let contract: Contract | null = null;
try {
  if (CONTRACT_ID && CONTRACT_ID.length >= 56) {
    contract = new Contract(CONTRACT_ID);
  }
} catch (e) {
  console.warn("Invalid Contract ID provided:", CONTRACT_ID);
}

export async function getQuestion(): Promise<string> {
  if (!contract) return "Favorite Blockchain Protocol?";
  
  const result = await server.simulateTransaction(
    new TransactionBuilder(
      new Account("GAKF7GXDBJS2MMMVFHE4UNEKXJM3BABM3DQCSTF3JKRKN5WZI4GW4TIV", "0"),
      { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
    )
    .addOperation(contract.call("get_question"))
    .setTimeout(30)
    .build()
  );
  
  if (rpc.Api.isSimulationSuccess(result)) {
    return scValToNative(result.result!.retval);
  }
  return "Favorite Blockchain Protocol?";
}

export async function isPollInitialized(): Promise<boolean> {
  if (!contract) return false;
  
  try {
    const result = await server.simulateTransaction(
      new TransactionBuilder(
        new Account("GAKF7GXDBJS2MMMVFHE4UNEKXJM3BABM3DQCSTF3JKRKN5WZI4GW4TIV", "0"),
        { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
      )
      .addOperation(contract.call("get_question"))
      .setTimeout(30)
      .build()
    );
    
    return rpc.Api.isSimulationSuccess(result);
  } catch (e) {
    return false;
  }
}

export async function getOptions(): Promise<string[]> {
  if (!contract) return ["Stellar", "Solana", "Ethereum", "Polygon"];

  const result = await server.simulateTransaction(
    new TransactionBuilder(
      new Account("GAKF7GXDBJS2MMMVFHE4UNEKXJM3BABM3DQCSTF3JKRKN5WZI4GW4TIV", "0"),
      { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
    )
    .addOperation(contract.call("get_options"))
    .setTimeout(30)
    .build()
  );
  
  if (rpc.Api.isSimulationSuccess(result)) {
    return scValToNative(result.result!.retval);
  }
  return ["Stellar", "Solana", "Ethereum", "Polygon"];
}

export async function getResults(): Promise<Record<number, number>> {
  if (!contract) {
    // Demo Mode: Global synchronization via MongoDB API
    try {
      const res = await fetch("/api/polls");
      const data = await res.json();
      if (data.votes) return data.votes;
    } catch (e) {
      console.warn("Failed to fetch global mock votes, falling back to local memory", e);
    }
    return { 0: 15, 1: 5, 2: 8, 3: 12 };
  }

  const result = await server.simulateTransaction(
    new TransactionBuilder(
      new Account("GAKF7GXDBJS2MMMVFHE4UNEKXJM3BABM3DQCSTF3JKRKN5WZI4GW4TIV", "0"),
      { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
    )
    .addOperation(contract.call("get_results"))
    .setTimeout(30)
    .build()
  );
  
  if (rpc.Api.isSimulationSuccess(result)) {
    const map = scValToNative(result.result!.retval);
    const results: Record<number, number> = {};
    // Soroban Map to JS Record
    if (map instanceof Map) {
      map.forEach((v: number, k: number) => {
        results[Number(k)] = Number(v);
      });
    } else if (map && typeof map === 'object') {
       Object.entries(map).forEach(([k, v]) => {
         results[Number(k)] = Number(v);
       });
    }
    return results;
  }
  return { 0: 15, 1: 5, 2: 8, 3: 12 };
}

export async function hasVoted(address: string): Promise<boolean> {
  if (!contract) {
    // Demo Mode: Global synchronization via MongoDB API
    try {
      const res = await fetch("/api/polls");
      const data = await res.json();
      if (data.voters) return data.voters.includes(address);
    } catch (e) {
      console.warn("Failed to check global hasVoted status", e);
    }
    return false;
  }

  const result = await server.simulateTransaction(
    new TransactionBuilder(
      new Account("GAKF7GXDBJS2MMMVFHE4UNEKXJM3BABM3DQCSTF3JKRKN5WZI4GW4TIV", "0"),
      { fee: "100", networkPassphrase: NETWORK_PASSPHRASE }
    )
    .addOperation(contract.call("has_voted", nativeToScVal(Address.fromString(address))))
    .setTimeout(30)
    .build()
  );
  
  if (rpc.Api.isSimulationSuccess(result)) {
    return scValToNative(result.result!.retval);
  }
  return false;
}

export async function buildVoteTx(voterAddress: string, optionIndex: number) {
  if (!contract) throw new Error("Contract ID not configured. Use Demo Mode (Mock Data) for testing the UI.");

  const tx = new TransactionBuilder(
    await (async () => {
       const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${voterAddress}`);
       const json = await res.json();
       return new Account(voterAddress, json.sequence);
    })(),
    { fee: "10000", networkPassphrase: NETWORK_PASSPHRASE }
  )
  .addOperation(contract.call("vote", 
    nativeToScVal(Address.fromString(voterAddress)), 
    nativeToScVal(optionIndex, { type: "u32" })
  ))
  .setTimeout(30)
  .build();

  const preparedTx = await server.prepareTransaction(tx);
  return preparedTx;
}

export async function initializePoll(adminAddress: string, question: string, options: string[]) {
  if (!contract) throw new Error("Contract ID not configured. Please deploy your contract to Stellar Testnet first.");

  const tx = new TransactionBuilder(
    await (async () => {
       const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${adminAddress}`);
       const json = await res.json();
       return new Account(adminAddress, json.sequence);
    })(),
    { fee: "10000", networkPassphrase: NETWORK_PASSPHRASE }
  )
  .addOperation(contract.call("initialize", 
    nativeToScVal(Address.fromString(adminAddress)), 
    nativeToScVal(question),
    nativeToScVal(options.map(o => nativeToScVal(o)))
  ))
  .setTimeout(30)
  .build();

  const preparedTx = await server.prepareTransaction(tx);
  return preparedTx;
}

export function parseSorobanError(err: any): string {
  console.log("Parsing Soroban Error Detail:", err);
  
  // Handle standard Error strings
  if (typeof err === "string") return err;
  
  const message = err.message || "";
  
  // Specific Contract Errors based on our Rust enum
  // Error::AlreadyInitialized = 4
  if (message.includes("Error(Contract, #4)") || message.includes("HostError: Error(Contract, #4)")) {
    return "Contract is already initialized.";
  }
  
  // Error::AlreadyVoted = 2
  if (message.includes("Error(Contract, #2)") || message.includes("HostError: Error(Contract, #2)")) {
    return "You have already voted in this poll.";
  }

  // Error::InvalidOption = 3
  if (message.includes("Error(Contract, #3)") || message.includes("HostError: Error(Contract, #3)")) {
    return "Invalid voting option selected.";
  }

  // Fallback for simulation failure details
  if (err.simulation?.error) {
    return `Simulation failed: ${err.simulation.error}`;
  }

  if (err.status === "FAILED" && err.errorResultXdr) {
    return "Transaction failed on-chain. Check your balance or if you already voted.";
  }

  return err.message || "An unexpected blockchain error occurred.";
}

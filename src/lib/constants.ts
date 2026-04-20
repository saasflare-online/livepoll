export const CONTRACT_ID = "CAZY5PGJPRQSAMWIDYLL3VLRPP6VYPC7CXKKM2GPAMF35OLWSGGY2JEO"
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015"
export const HORIZON_URL = "https://horizon-testnet.stellar.org"
export const RPC_URL = "https://soroban-testnet.stellar.org"

export enum TransactionStage {
  IDLE = "IDLE",
  PENDING = "PENDING",
  CONFIRMING = "CONFIRMING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export type PollData = {
  question: string
  options: string[]
  votes: Record<number, number>
  totalVotes: number
  hasVoted: boolean
}

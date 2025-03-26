import { Address } from "viem"

export type PoolTokenInfo = {
    address: Address
    name: string
    symbol: string
    decimals: number
}

export type TransactionActionStatus = 'idle' | 'pending' | 'success' | 'error'
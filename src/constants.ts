import { Address } from "viem";
import pundixLpFarmAbi from "./pundix-lp-farm-abi.json"

export const LP_FARM_CONTRACT: Address = "0x439ec8159740a9B9a579F286963Ac1C050aF31C8";

export const PURSE_TOKEN: Address = "0x29a63f4b209c29b4dc47f06ffa896f32667dad2c";

export const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export const pundixFarmContractConfig = {
    address: LP_FARM_CONTRACT,
    abi: pundixLpFarmAbi,
} as const

export const TOKENS_INFO: Record<Address, any> = {
    "0x55d398326f99059fF775485246999027B3197955": {
        name: "USDT",
        imageUrl: "https://tokens.pancakeswap.finance/images/symbol/usdt.png"
    },
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56": {
        name: "BUSD",
        imageUrl: "https://tokens.pancakeswap.finance/images/symbol/busd.png"
    },
    "0x29a63F4B209C29B4DC47f06FFA896F32667DAD2C": {
        name: "PURSE",
        imageUrl: "https://bscscan.com/token/images/pundixpurse_32.png"
    }
}
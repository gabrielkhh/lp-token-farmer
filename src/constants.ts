import { Address } from "viem";
import pundixLpFarmAbi from "./pundix-lp-farm-abi.json"

export const LP_FARM_CONTRACT: Address = "0x439ec8159740a9B9a579F286963Ac1C050aF31C8";

export const PURSE_TOKEN: Address = "0x29a63f4b209c29b4dc47f06ffa896f32667dad2c";

export const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export const pundixFarmContractConfig = {
    address: LP_FARM_CONTRACT,
    abi: pundixLpFarmAbi,
} as const
import { Address } from "viem";
import pundixLpFarmAbi from "./pundix-lp-farm-abi.json"

export const LP_FARM_CONTRACT: Address = "0x439ec8159740a9B9a579F286963Ac1C050aF31C8";
export const LP_FARM_TOKEN_A: Address = "0xfc450e16016aF4e4197f5dB5Ca0d262fF8fD735a";

export const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

export const pundixFarmContractConfig = {
    address: LP_FARM_CONTRACT,
    abi: pundixLpFarmAbi,
} as const
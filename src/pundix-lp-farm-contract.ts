import { LP_FARM_CONTRACT } from "./constants"
import pundixLpFarmAbi from "./pundix-lp-farm-abi.json"

export const pundixContractConfig = {
    address: LP_FARM_CONTRACT,
    abi: pundixLpFarmAbi,
} as const
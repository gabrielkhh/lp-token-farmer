import React from 'react'
import { pundixFarmContractConfig } from '../constants'
import { Address, parseGwei } from 'viem'
import { useAccount, useWriteContract } from 'wagmi';
import { useGetPancakeTokenA, useGetPancakeTokenB, useGetPancakeTokenName } from '../hooks/pancakeLpToken';
import { useGetPoolToken } from '../hooks/pool';
import { useGetToken, useGetTokenInfoWithBalance } from '../hooks/token';
import DepositModal from './DepositModal';

const LPCard = ({
    tokenAddress
}: {
    tokenAddress: Address
}) => {
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false)
    const { address: userWalletAddress } = useAccount();

    const { data: tokenA } = useGetPancakeTokenA(tokenAddress)
    const { data: tokenB } = useGetPancakeTokenB(tokenAddress)

    const lpTokenInfo = useGetTokenInfoWithBalance(tokenAddress, userWalletAddress)

    const tokenAInfo = useGetTokenInfoWithBalance(tokenA as Address, userWalletAddress)
    const tokenBInfo = useGetTokenInfoWithBalance(tokenB as Address, userWalletAddress)


    console.log("LP-CARD", tokenAddress, lpTokenInfo, tokenAInfo, tokenBInfo)
    
    return (
        <div className="flex flex-col gap-2 bg-gray-100 rounded-xl w-full p-3">
            <DepositModal isOpen={isDepositModalOpen} onClose={setIsDepositModalOpen} depositTokenAddress={tokenAddress} />
            <div className="flex flex-col gap-0">
                <span className="font-semibold text-xl">{tokenAInfo.tokenInfo.symbol}-{tokenBInfo.tokenInfo.symbol} LP</span>
                <span className="text-sm font-medium text-gray-500">Min 42.00/ Max 67.129 CAKE per WBNB</span>
            </div>

            <div>
                <span>APR: 1.00%</span>
            </div>

            <div className="flex flex-col text-sm font-medium">
                <span className="font-semibold">Available Balance:</span>
                <span className="text-gray-600">{lpTokenInfo.tokenBalance.formattedBalance ?? "0"} {lpTokenInfo.tokenInfo.symbol}</span>
            </div>

            <div>
                <button className="bg-purple-400 p-3 rounded-xl text-white hover:bg-purple-500 cursor-pointer" onClick={() => setIsDepositModalOpen(true)}>Deposit LP Tokens</button>
            </div>
        </div>
    )
}

export default LPCard
import React from 'react'
import { pundixFarmContractConfig, PURSE_TOKEN } from '../constants'
import { Address, parseGwei } from 'viem'
import { useAccount, useWriteContract } from 'wagmi';
import { useGetPancakeTokenA, useGetPancakeTokenB, useGetPancakeTokenName } from '../hooks/pancakeLpToken';
import { useGetPoolInfo, useGetPoolToken, useGetUserPositions } from '../hooks/pool';
import { useGetToken, useGetTokenInfoWithBalance } from '../hooks/token';
import DepositModal from './DepositModal';
import { formatTokenAmountAsString } from '../utils';
import WithdrawModal from './WithdrawModal';

const LPCard = ({
    tokenAddress
}: {
    tokenAddress: Address
}) => {
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false)
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false)
    const { address: userWalletAddress } = useAccount();
    const userInfo = useGetUserPositions(tokenAddress, userWalletAddress);
    const poolInfo = useGetPoolInfo(tokenAddress);

    const { data: tokenA } = useGetPancakeTokenA(tokenAddress)
    const { data: tokenB } = useGetPancakeTokenB(tokenAddress)

    const lpTokenInfo = useGetTokenInfoWithBalance(tokenAddress, userWalletAddress)
    const purseTokenInfo = useGetToken(PURSE_TOKEN)

    const tokenAInfo = useGetTokenInfoWithBalance(tokenA as Address, userWalletAddress)
    const tokenBInfo = useGetTokenInfoWithBalance(tokenB as Address, userWalletAddress)


    console.log("LP-CARD", tokenAddress, poolInfo, userInfo)

    return (
        <div className="flex flex-col gap-2 bg-gray-100 rounded-xl w-full p-3">
            <DepositModal isOpen={isDepositModalOpen} onClose={setIsDepositModalOpen} depositTokenAddress={tokenAddress} />
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={setIsWithdrawModalOpen} withdrawTokenAddress={tokenAddress} />
            <div className="flex flex-col gap-0">
                <span className="font-semibold text-xl">{tokenAInfo.tokenInfo.symbol}-{tokenBInfo.tokenInfo.symbol} LP</span>
                <span className="text-sm font-medium text-gray-500">{formatTokenAmountAsString(poolInfo?.accPursePerShare ?? BigInt(0), purseTokenInfo.decimals)} {purseTokenInfo.symbol} per {lpTokenInfo.tokenInfo.symbol}</span>
            </div>

            <div>
                Staked: {formatTokenAmountAsString(userInfo?.amount ?? BigInt(0), lpTokenInfo.tokenInfo.decimals) ?? "0"} {lpTokenInfo.tokenInfo.symbol}
            </div>

            <div className="flex flex-col text-sm font-medium">
                <span className="font-semibold">Available Balance:</span>
                <span className="text-gray-600">{lpTokenInfo.tokenBalance.formattedBalance ?? "0"} {lpTokenInfo.tokenInfo.symbol}</span>
            </div>

            <div className="flex gap-2">
                <button className="bg-purple-400 p-3 rounded-xl text-white hover:bg-purple-500 cursor-pointer" onClick={() => setIsDepositModalOpen(true)}>Deposit LP Tokens</button>
                <button className="bg-red-400 p-3 rounded-xl text-white hover:bg-red-500 cursor-pointer" onClick={() => setIsWithdrawModalOpen(true)}>Withdraw Stake</button>
            </div>
        </div>
    )
}

export default LPCard
import React, { useMemo } from 'react'
import { pundixFarmContractConfig, PURSE_TOKEN } from '../constants'
import { Address } from 'viem'
import { useAccount, useBlockNumber, useConfig, useWriteContract } from 'wagmi';
import { useGetPancakeTokenA, useGetPancakeTokenB, useGetPancakeTokenName } from '../hooks/pancakeLpToken';
import { useGetPoolInfo, useGetPoolToken, useGetUserPendingRewards, useGetUserPositions } from '../hooks/pool';
import { useGetToken, useGetTokenInfoWithBalance } from '../hooks/token';
import DepositModal from './DepositModal';
import { formatTokenAmountAsString } from '../utils';
import WithdrawModal from './WithdrawModal';
import toast from 'react-hot-toast';
import { waitForTransactionReceipt } from '@wagmi/core';
import { Loader2, Moneybag, Wallet } from 'tabler-icons-react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

const LPCard = ({
    tokenAddress
}: {
    tokenAddress: Address
}) => {
    const config = useConfig();
    const queryClient = useQueryClient();
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false)
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false)
    const [isClaimingPending, setIsClaimingPending] = React.useState(false)
    const { address: userWalletAddress, isConnected } = useAccount();

    const userInfo = useGetUserPositions(tokenAddress, userWalletAddress);
    const poolInfo = useGetPoolInfo(tokenAddress);
    const { data: userPendingRewards, queryKey: pendingRewardsQueryKey } = useGetUserPendingRewards(tokenAddress, userWalletAddress)
    const { data: blockNumber } = useBlockNumber({ watch: true })

    React.useEffect(() => {
        if (isConnected) {
            queryClient.invalidateQueries({ queryKey: pendingRewardsQueryKey })
        }
    }, [blockNumber, isConnected])

    const { writeContract, data: hash, isPending } = useWriteContract();

    const { data: tokenA } = useGetPancakeTokenA(tokenAddress)
    const { data: tokenB } = useGetPancakeTokenB(tokenAddress)

    const lpTokenInfo = useGetTokenInfoWithBalance(tokenAddress, userWalletAddress)
    const purseTokenInfo = useGetToken(PURSE_TOKEN)

    const tokenAInfo = useGetTokenInfoWithBalance(tokenA as Address, userWalletAddress)
    const tokenBInfo = useGetTokenInfoWithBalance(tokenB as Address, userWalletAddress)

    const pendingReward = useMemo(() => {
        return formatTokenAmountAsString(userPendingRewards as bigint ?? 0n, purseTokenInfo.decimals)
    }, [userPendingRewards, purseTokenInfo.decimals])

    const handleTransactionSubmitted = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
        });

        if (transactionReceipt.status === "success") {
            setIsClaimingPending(false)
            toast(<span>Successfully Claimed Rewards! <a className="text-orange-400 underline" href={`https://bscscan.com/tx/${txHash}`} target={"_blank"}>View Transaction</a></span>, { icon: '🎉', duration: 4000 })
        }
    };

    const handleClaimRewards = () => {
        setIsClaimingPending(true)
        writeContract({
            ...pundixFarmContractConfig,
            functionName: 'claimReward',
            args: [tokenAddress],
        }, {
            onSuccess: handleTransactionSubmitted,
            onError: (error) => {
                setIsClaimingPending(false)

                if (error.message.includes("User rejected")) {
                    toast.error("User rejected the transaction")
                } else {
                    console.error("Error executing transaction: ", error)
                    toast.error("An error occurred while depositing LP tokens")
                }
            }
        })
    }

    return (
        <div className="flex flex-col gap-3 shadow-xl bg-background-lighter rounded-2xl w-full p-5">
            <DepositModal isOpen={isDepositModalOpen} onClose={setIsDepositModalOpen} depositTokenAddress={tokenAddress} />
            <WithdrawModal isOpen={isWithdrawModalOpen} onClose={setIsWithdrawModalOpen} withdrawTokenAddress={tokenAddress} />
            <div className="flex flex-col gap-0">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-2xl">{tokenAInfo.tokenInfo.symbol}-{tokenBInfo.tokenInfo.symbol} LP Farm</span>
                    <div className="px-2 py-1 bg-amber-600/70 rounded-lg font-bold text-xs">{poolInfo?.bonusMultiplier}x Multiplier</div>
                </div>
                <span className="text-sm font-medium text-gray-400">{formatTokenAmountAsString(poolInfo?.accPursePerShare ?? BigInt(0), purseTokenInfo.decimals)} {purseTokenInfo.symbol} per {lpTokenInfo.tokenInfo.symbol}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
                <div className="flex flex-col font-medium text-sm md:text-md">
                    <span className="flex items-center gap-1 font-semibold"><Wallet size={20} />Available Balance</span>
                    <span className="text-orange-400">{lpTokenInfo.tokenBalance.formattedBalance ?? "0"} {lpTokenInfo.tokenInfo.symbol}</span>
                </div>
                <Link className="bg-white/10 flex text-center items-center gap-1 p-3 rounded-lg font-medium" href={`https://pancakeswap.finance/v2/add/${tokenA}/${tokenB}?increase=1`} target="_blank">
                    <Moneybag size={20} className="hidden md:block" />
                    Supply Liquidity
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
                <div className="flex w-full md:w-1/2 flex-col text-center bg-white/5 rounded-lg p-3 gap-2">
                    <h2 className="font-semibold text-lg">Your Stake</h2>
                    <span className="font-bold text-2xl text-orange-400 my-3">{formatTokenAmountAsString(userInfo?.amount ?? BigInt(0), lpTokenInfo.tokenInfo.decimals) ?? "0"} {lpTokenInfo.tokenInfo.symbol}</span>
                    <div className="flex flex-col md:flex-row gap-2">
                        <button className="md:flex-1 bg-gradient-to-r from-[#f9655b] to-[#ee821a] p-3 rounded-lg text-white font-medium cursor-pointer" onClick={() => setIsDepositModalOpen(true)}>Stake LP Tokens</button>
                        <button className="md:flex-1 bg-red-500/40 p-3 rounded-lg text-red-300 font-medium cursor-pointer" onClick={() => setIsWithdrawModalOpen(true)}>Withdraw Stake</button>
                    </div>
                </div>
                <div className="flex w-full md:w-1/2 flex-col text-center bg-white/5 rounded-lg p-3 gap-2">
                    <h2 className="font-semibold text-lg">Pending Rewards</h2>
                    <div className="font-bold text-2xl text-orange-400 my-3">
                        <span key={userPendingRewards as bigint} className="transition-opacity duration-300 animate-fade-in">{pendingReward}</span>
                        <span>{' '}{purseTokenInfo.symbol}</span>
                    </div>
                    <div>

                        {!!(userPendingRewards as bigint) && (<button className="bg-orange-400/20 text-orange-300/80 p-3 rounded-lg cursor-pointer w-full" onClick={() => handleClaimRewards()}>
                            {isClaimingPending ? <Loader2 className="w-full animate-spin" size={20} /> : (
                                <span className="w-full text-center">
                                    Claim Rewards
                                </span>
                            )}
                        </button>)}
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
            </div>
        </div>
    )
}

export default LPCard
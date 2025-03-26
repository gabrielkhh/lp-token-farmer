import React, { useMemo } from 'react'
import { pundixFarmContractConfig, PURSE_TOKEN } from '../constants'
import { Address, parseGwei } from 'viem'
import { useAccount, useConfig, useWriteContract } from 'wagmi';
import { useGetPancakeTokenA, useGetPancakeTokenB, useGetPancakeTokenName } from '../hooks/pancakeLpToken';
import { useGetPoolInfo, useGetPoolToken, useGetUserPositions } from '../hooks/pool';
import { useGetToken, useGetTokenInfoWithBalance } from '../hooks/token';
import DepositModal from './DepositModal';
import { formatTokenAmountAsString } from '../utils';
import WithdrawModal from './WithdrawModal';
import toast from 'react-hot-toast';
import { waitForTransactionReceipt } from '@wagmi/core';
import { Loader2 } from 'tabler-icons-react';

const LPCard = ({
    tokenAddress
}: {
    tokenAddress: Address
}) => {
    const config = useConfig();
    const [isDepositModalOpen, setIsDepositModalOpen] = React.useState(false)
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = React.useState(false)
    const [isClaimingPending, setIsClaimingPending] = React.useState(false)
    const { address: userWalletAddress } = useAccount();
    const userInfo = useGetUserPositions(tokenAddress, userWalletAddress);
    const poolInfo = useGetPoolInfo(tokenAddress);
    const { writeContract, data: hash, isPending } = useWriteContract();

    const { data: tokenA } = useGetPancakeTokenA(tokenAddress)
    const { data: tokenB } = useGetPancakeTokenB(tokenAddress)

    const lpTokenInfo = useGetTokenInfoWithBalance(tokenAddress, userWalletAddress)
    const purseTokenInfo = useGetToken(PURSE_TOKEN)

    const tokenAInfo = useGetTokenInfoWithBalance(tokenA as Address, userWalletAddress)
    const tokenBInfo = useGetTokenInfoWithBalance(tokenB as Address, userWalletAddress)

    const pendingReward = useMemo(() => {
        if (typeof userInfo?.amount !== "bigint" || typeof poolInfo?.accPursePerShare !== "bigint" || typeof userInfo?.rewardDebt !== "bigint") {
            return BigInt(0)
        }
        return (userInfo?.amount * poolInfo?.accPursePerShare) - userInfo?.rewardDebt
    }, [userInfo, poolInfo])

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

    console.log("LP-CARD", tokenAddress, poolInfo, userInfo, purseTokenInfo,)

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
            <div>
                Pending Rewards: {formatTokenAmountAsString(pendingReward, purseTokenInfo.decimals) ?? "0"} {lpTokenInfo.tokenInfo.symbol}
            </div>


            <div className="flex flex-col text-sm font-medium">
                <span className="font-semibold">Available Balance:</span>
                <span className="text-gray-600">{lpTokenInfo.tokenBalance.formattedBalance ?? "0"} {lpTokenInfo.tokenInfo.symbol}</span>
            </div>

            <div className="flex gap-2">
                <button className="bg-purple-400 p-3 rounded-xl text-white hover:bg-purple-500 cursor-pointer" onClick={() => setIsDepositModalOpen(true)}>Deposit LP Tokens</button>
                <button className="bg-red-400 p-3 rounded-xl text-white hover:bg-red-500 cursor-pointer" onClick={() => setIsWithdrawModalOpen(true)}>Withdraw Stake</button>
                {pendingReward > BigInt(0) && (<button className="bg-orange-300 p-3 w-36 rounded-xl text-white hover:bg-orange-400 cursor-pointer" onClick={() => handleClaimRewards()}>
                    {isClaimingPending ? <Loader2 className="w-full animate-spin" size={20} /> : (
                        <span className="w-full text-center">
                            Claim Rewards
                        </span>
                    )}
                </button>)}
            </div>
        </div>
    )
}

export default LPCard
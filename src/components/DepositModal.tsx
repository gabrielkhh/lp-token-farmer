import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { X } from 'tabler-icons-react'
import { Address } from 'viem'
import { useGetTokenInfoWithBalance } from '../hooks/token'
import { useAccount, useConfig, useWriteContract } from 'wagmi'
import { calculateBigIntPercentage, decimalToBigInt, formatTokenAmountAsString } from '../utils'
import { pundixFarmContractConfig } from '../constants'
import { waitForTransactionReceipt } from "@wagmi/core";
import toast from 'react-hot-toast'

const DepositModal = ({
    isOpen,
    onClose,
    depositTokenAddress
}: {
    isOpen: boolean,
    onClose: Dispatch<SetStateAction<boolean>>
    depositTokenAddress: Address
}) => {
    const config = useConfig();
    const [lpTokenAmount, setLpTokenAmount] = React.useState<bigint>(BigInt(0));
    const [depositAmountStr, setDepositAmountStr] = React.useState<string>('0');
    const { address: userWalletAddress } = useAccount();
    const { writeContract, data: hash, isPending } = useWriteContract();

    const handleTransactionSubmitted = async (txHash: string) => {
        const transactionReceipt = await waitForTransactionReceipt(config, {
            hash: txHash as `0x${string}`,
        });

        if (transactionReceipt.status === "success") {
            toast(<span>Deposit Succcessful! <a href={`https://bscscan.com/tx/${txHash}`} target={"_blank"}>View Transaction</a></span>, { icon: '🎉', duration: 4000 })
        }
    };

    const lpTokenInfo = useGetTokenInfoWithBalance(depositTokenAddress, userWalletAddress)

    const formattedTokenAmountToDeposit = React.useMemo(() => {
        return formatTokenAmountAsString(lpTokenAmount, lpTokenInfo.tokenInfo.decimals)
    }, [lpTokenAmount, lpTokenInfo])

    const handlePercentageFill = useCallback((e: React.MouseEvent<HTMLButtonElement>, percentage: number) => {
        e.preventDefault();
        const percentageAmount = calculateBigIntPercentage(lpTokenInfo.tokenBalance.formattedBalance, percentage, lpTokenInfo.tokenInfo.decimals)
        setLpTokenAmount(decimalToBigInt(percentageAmount, lpTokenInfo.tokenInfo.decimals))
    }, [lpTokenInfo, lpTokenInfo.tokenBalance.formattedBalance, lpTokenInfo.tokenBalance.data])

    const handleDepositBtn = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()

        // approveWrite({
        //   address: "0xA7396814b9946f3fd1616410985aF0258412477c", // the ERC20 token contract
        //   abi: erc20Abi,
        //   functionName: 'approve',
        //   args: ["0x439ec8159740a9B9a579F286963Ac1C050aF31C8", BigInt(100)], // allow proxy to spend 1 token
        // })

        const amountToDepositRaw = decimalToBigInt(depositAmountStr, lpTokenInfo.tokenInfo.decimals)

        writeContract({
            ...pundixFarmContractConfig,
            functionName: 'deposit',
            args: [depositTokenAddress, amountToDepositRaw],
        }, {
            onSuccess: handleTransactionSubmitted,
        })
    }, [depositAmountStr])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-filter backdrop-blur-sm flex items-center justify-center z-50" onClick={() => onClose(false)}>
            <div className="bg-gray-50 rounded-3xl w-full max-w-md p-6 shadow-xl border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Deposit LP Tokens</h2>
                    <button className="text-gray-400 hover:text-white cursor-pointer" onClick={() => onClose(false)}>
                        <X />
                    </button>
                </div>

                <div className="mb-6">
                    <label className="block text-gray-400 text-sm mb-2">Amount to deposit</label>
                    <div className="relative">
                        <div className="flex bg-gray-100 rounded-2xl p-4 border border-gray-100 focus-within:border-teal-400">
                            <input
                                type="text"
                                value={depositAmountStr}
                                onChange={(e) => setDepositAmountStr(e.target.value)}
                                className="bg-transparent w-full text-xl font-medium focus:outline-none"
                                placeholder="0.0"
                            />
                        </div>

                        <div className="flex justify-between items-center mt-2 px-1 gap-3">
                            <div className="text-sm text-gray-500">
                                Available: <span className="text-gray-800">{lpTokenInfo.tokenBalance.formattedBalance} {lpTokenInfo.tokenInfo.symbol}</span>
                            </div>
                            <div className="flex space-x-2 text-white">
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 25)}>
                                    25%
                                </button>
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 50)}>
                                    50%
                                </button>
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 75)}>
                                    75%
                                </button>
                                <button className="bg-orange-300 hover:bg-orange-400 text-sm px-2 py-1 rounded-lg transition cursor-pointer" onClick={(e) => handlePercentageFill(e, 100)}>
                                    Max
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4">
                    <button className="w-1/2 bg-gray-200 hover:bg-gray-300 cursor-pointer text-black font-semibold py-3 px-4 rounded-xl transition" onClick={() => onClose(false)}>
                        Cancel
                    </button>
                    <button
                        className="w-1/2 bg-orange-300 hover:bg-orange-400 cursor-pointer text-white font-semibold py-3 px-4 rounded-xl transition"
                        onClick={handleDepositBtn}
                    >
                        Deposit
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DepositModal
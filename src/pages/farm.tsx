import React from 'react'
import { useGetPoolInfo, useGetPoolToken, useGetPoolTokens, useGetUserPositions } from '../hooks/pool';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Address } from 'viem';
import LPCard from '../components/LPCard';

const Farm = () => {
    const { isConnected, address: userWalletAddress } = useAccount();
    const lpTokens = useGetPoolTokens();

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center mb-8">
                <div className="flex items-center">
                    {/* <div className="relative mr-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center z-10 relative">
                            <img src="/api/placeholder/40/40" alt="Token A" className="w-10 h-10 rounded-full" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center absolute -right-3 top-0">
                            <img src="/api/placeholder/40/40" alt="Token B" className="w-10 h-10 rounded-full" />
                        </div>
                    </div> */}
                    <h1 className="text-3xl font-bold ml-6">TOKEN A / TOKEN B</h1>
                </div>
            </div>

            {/* User Positions */}
            {!isConnected ? (
                <ConnectButton />
            ) : (
                lpTokens.map((lpToken, index) => (
                    <LPCard key={index} tokenAddress={lpToken.address as Address} />
                ))
            )}
        </div >
    )
}

export default Farm;
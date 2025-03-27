import React from 'react'
import { useGetName, useGetPoolTokens } from '../hooks/pool';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Address } from 'viem';
import LPCard from '../components/LPCard';
import Link from 'next/link';
import { ExternalLink } from 'tabler-icons-react';
import { LP_FARM_CONTRACT } from '../constants';
import { getExplorerLinkAddress } from '../utils';

const Farm = () => {
    const { isConnected } = useAccount();
    const lpTokens = useGetPoolTokens();
    const { data: farmName, isLoading } = useGetName();

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center mb-8">
                <div className="flex items-center">
                    {isLoading ? (
                        <div className="w-56 h-8 rounded-lg bg-background-lighter animate-pulse"></div>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <h1 className="text-3xl font-bold">{farmName as unknown as string}</h1>
                            <Link target='_blank' className='cursor-pointer' href={getExplorerLinkAddress(LP_FARM_CONTRACT)}>
                                <ExternalLink className="text-amber-500" />
                            </Link>
                        </div>
                    )}

                </div>
            </div>

            {/* Farms and Positions */}
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
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CashBanknote } from 'tabler-icons-react';
import React from 'react'
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="px-4 py-5 flex justify-between items-center bg-white/50 backdrop-blur-lg backdrop-filter">
      <Link href="/" className="flex items-center gap-2">
        <CashBanknote />
        <span className="font-bold text-xl">LP Token Farmer</span>
      </Link>
      <div className="flex items-center gap-2">
        <div className="flex px-3 py-1.5 bg-orange-300 rounded-xl">BNB Chain</div>
        <ConnectButton />
      </div>
    </nav>
  )
}

export default Navbar
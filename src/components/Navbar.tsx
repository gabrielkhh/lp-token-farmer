import { ConnectButton } from '@rainbow-me/rainbowkit'
import { CashBanknote } from 'tabler-icons-react';
import React from 'react'
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="px-4 py-3 flex justify-between items-center bg-black/30 backdrop-blur-lg backdrop-filter">
      <Link href="/" className="flex items-center gap-2">
        <CashBanknote size={32} />
        <span className="font-bold text-xl hidden md:block">LP Token Farmer</span>
      </Link>
      <div className="flex items-center gap-2">
        <ConnectButton />
      </div>
    </nav>
  )
}

export default Navbar
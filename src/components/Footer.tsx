import Link from 'next/link'
import React from 'react'
import { BrandGithub } from 'tabler-icons-react'

const Footer = () => {
    return (
        <>
            <hr className="w-[90%] mx-auto border-orange-400/20" />
            <footer className="flex text-center justify-center p-8 text-white/50">
                <Link className="flex items-center gap-2" href="https://github.com/gabrielkhh/lp-token-farmer" target='_blank'>
                    <BrandGithub size={20} />
                    Project Source
                </Link>
            </footer>
        </>
    )
}

export default Footer
import React, { ReactNode } from 'react'
import Navbar from './Navbar'

const SharedLayout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <Navbar />
            <main className="px-5">
                {children}
            </main>
        </>
    )
}

export default SharedLayout
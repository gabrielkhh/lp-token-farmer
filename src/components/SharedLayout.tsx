import React, { ReactNode } from 'react'
import Navbar from './Navbar'

const SharedLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="relative">
            <div className="sticky top-0 z-50">
                <Navbar />
            </div>
            <main className="max-w-screen-sm md:max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl 2xl:max-w-screen-2xl mx-auto px-4 md:px-12">
                {children}
            </main>
        </div>
    )
}

export default SharedLayout
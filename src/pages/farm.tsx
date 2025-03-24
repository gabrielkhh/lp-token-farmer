import React from 'react'

const Farm = () => {
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

            <div className="flex flex-wrap gap-6 mb-10">
                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs mb-1">FEE TIER</span>
                    <div className="bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        V2 | 0.25%
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs mb-1">NETWORK</span>
                    <div className="bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full text-sm flex items-center">
                        <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
                        BNB Chain
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs mb-1">APR</span>
                    <div className="bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                        <span className="text-green-400">Up to</span>
                        <span className="text-green-400 font-bold ml-1">10.76%</span>
                        <span className="text-gray-400 line-through ml-2">5.86%</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <span className="text-gray-400 text-xs mb-1">POOL TYPE</span>
                    <div className="bg-gray-800 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                        <span className="text-purple-400 font-bold">v2</span>
                    </div>
                </div>
            </div>

            {/* User Positions */}
            <div className="bg-gray-100 rounded-xl w-full p-3">
                <span></span>
            </div>
        </div>
    )
}

export default Farm;
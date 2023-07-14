export default function Nav() {
    return (
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <span className="text-white font-semibold text-lg">NFT RentMarketPlace</span>
            </div>
            <div className="hidden sm:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/" className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Home</a>
                <a href="/collection" className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Collection</a>
                <a href="/coin" className="text-gray-300 hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium">Coin Page</a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
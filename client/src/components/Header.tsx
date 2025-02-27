import { Link } from 'wouter';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <a href="https://timesync.theiresearch.com" target="_blank" rel="noopener noreferrer" className="text-2xl font-semibold text-primary cursor-pointer hover:opacity-90 transition-opacity">🕒 TimeSync</a>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <span className="text-neutral-700 hover:text-primary transition-colors cursor-pointer">Features</span>
          <span className="text-neutral-700 hover:text-primary transition-colors cursor-pointer">Pricing</span>
          <span className="text-neutral-700 hover:text-primary transition-colors cursor-pointer">Help</span>
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </div>
        <button className="md:hidden text-neutral-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
}

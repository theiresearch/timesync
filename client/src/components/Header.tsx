import { Link } from 'wouter';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <a className="text-2xl font-semibold text-primary">🕒 TimeSync</a>
          </Link>
        </div>
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-textColor hover:text-primary transition-colors">Features</a>
          <a href="#" className="text-textColor hover:text-primary transition-colors">Pricing</a>
          <a href="#" className="text-textColor hover:text-primary transition-colors">Help</a>
          <button className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
            Sign In
          </button>
        </div>
        <button className="md:hidden text-textColor">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </header>
  );
}

import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-neutral-200 dark:border-gray-800 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center">
            <div className="w-6 h-6 rounded-lg overflow-hidden mr-2 bg-primary flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="The I Research logo"
                className="w-5 h-5 object-contain"
              />
            </div>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">© {new Date().getFullYear()} The I Research. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors">Terms of Service</a>
            <a 
              href="https://theiresearch.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-primary transition-colors flex items-center"
            >
              theiresearch.com
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

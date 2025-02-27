export default function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-8">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-neutral-500">© {new Date().getFullYear()} TimeSync. All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-sm text-neutral-500 hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="text-sm text-neutral-500 hover:text-primary transition-colors">Help Center</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  const appIdentifier = typeof window !== 'undefined' 
    ? encodeURIComponent(window.location.hostname) 
    : 'school-mitra';

  return (
    <footer className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center space-y-3">
          <div className="text-2xl md:text-3xl text-muted-foreground font-cursive font-semibold tracking-wide">
            School Mitra
          </div>
          <p className="text-sm text-muted-foreground">
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appIdentifier}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} School Mitra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

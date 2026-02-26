import React from 'react';
import { Heart, GraduationCap } from 'lucide-react';

export default function Footer() {
  const year = new Date().getFullYear();
  const appId = encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'school-mitra');

  return (
    <footer className="w-full border-t border-border" style={{ background: 'linear-gradient(135deg, #172554 0%, #1e3a8a 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)' }}>
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-display font-bold text-sm">School Mitra</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 text-blue-200 text-xs">
            <span>© {year} School Mitra. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${appId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                caffeine.ai
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

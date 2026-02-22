import { Download, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const { showInstallPrompt, installPWA, dismissPrompt, isInstalling } = usePWAInstall();

  if (!showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="shadow-2xl border-2 border-blue-200 dark:border-blue-800">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Install App</CardTitle>
                <CardDescription className="text-xs">School Mitra</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mt-1 -mr-1"
              onClick={dismissPrompt}
              disabled={isInstalling}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Install School Mitra for quick access and offline functionality. Works on desktop and mobile!
          </p>
          <div className="flex gap-2">
            <Button
              onClick={installPWA}
              disabled={isInstalling}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isInstalling ? (
                <>Installing...</>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Install
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={dismissPrompt}
              disabled={isInstalling}
              className="flex-1"
            >
              Not Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
          <div className="absolute inset-0 h-12 w-12 border-2 border-primary/20 rounded-full mx-auto animate-pulse"></div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Laden...
        </h2>
        <p className="text-gray-600">
          Een moment geduld, we laden de gegevens
        </p>
      </div>
    </div>
  );
}
export default function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Logo animé */}
        <div className="relative">
          <div className="text-5xl sm:text-6xl md:text-7xl font-bold text-foreground animate-pulse">
            andunu
          </div>
        </div>

        {/* Spinner */}
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Texte de chargement */}
        <p className="text-sm text-foreground/60 mt-2">Chargement...</p>
      </div>
    </div>
  );
}

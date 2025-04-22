
export default function ScreenshotSection() {
  return (
    <section className="py-16 flex flex-col items-center bg-gradient-to-b from-fever-dark via-fever-black to-fever-black/95 relative">
      <h2 className="mb-6 text-2xl md:text-3xl font-bold text-fever-amber">See Fever in Action</h2>
      {/* Replace src with actual UI screenshot if available */}
      <div className="w-full max-w-4xl h-72 sm:h-96 rounded-2xl overflow-hidden shadow-2xl border-2 border-fever-red/50 bg-fever-dark flex items-center justify-center relative">
        <img
          src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=900&q=80"
          alt="App Screenshot"
          className="w-full h-full object-cover opacity-90"
        />
        {/* Overlay for demo elements */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 bg-gradient-to-t from-fever-black/80 via-transparent to-transparent pointer-events-none">
          <div className="w-40 h-5 bg-fever-red/80 rounded-full blur-md"></div>
        </div>
      </div>
      <div className="mt-8 flex gap-4 flex-wrap justify-center">
        <FeatureDemo label="One-click export" />
        <FeatureDemo label="Loop view" />
        <FeatureDemo label="FX drawer" />
      </div>
    </section>
  )
}

function FeatureDemo({ label }: { label: string }) {
  return (
    <span className="inline-block bg-fever-black/60 border border-fever-red/30 rounded-full px-4 py-2 text-fever-light text-sm font-semibold shadow-lg glass-morphism">
      {label}
    </span>
  )
}

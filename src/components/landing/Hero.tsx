
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-32 bg-gradient-to-br from-fever-black via-fever-dark to-fever-black/90 text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[120px] rounded-full bg-fever-red/10 blur-2xl z-0 pointer-events-none pulse" aria-hidden="true" />
      {/* Fever logo placeholder */}
      <div className="mb-6 z-10">
        <div className="mx-auto bg-gradient-to-tr from-fever-red via-fever-amber to-fever-light rounded-full p-2 w-20 h-20 flex items-center justify-center shadow-lg">
          <span className="text-fever-black font-bold text-3xl tracking-tight font-orbitron">F</span>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold font-orbitron text-fever-light mb-3 tracking-tight drop-shadow-md">
        Built for <span className="text-fever-red">Scarlett</span>. Ready to Record.
      </h1>
      <p className="text-lg md:text-xl text-fever-light/80 mb-9 max-w-2xl mx-auto">
        The fastest way to record with your Focusrite Scarlett. No setup. No plugins. Just press record.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
        <a href="https://feverstudio.live/download/mac/Fever-1.0.1-x64.dmg" target="_blank" rel="noopener">
          <Button className="rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-br from-fever-red to-fever-amber shadow-xl hover:from-fever-amber hover:to-fever-red transition-all focus-visible:ring-fever-red/60 ring-2 ring-fever-red/10 animate-pulse gap-2">
            <Download size={22} />
            Download for macOS
          </Button>
        </a>
        <a href="https://feverstudio.live/download/win/Fever-1.0.1-setup.exe" target="_blank" rel="noopener">
          <Button className="rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-br from-fever-red to-fever-light shadow-xl hover:from-fever-amber hover:to-fever-red transition-all focus-visible:ring-fever-red/60 ring-2 ring-fever-red/10 gap-2">
            <Download size={22} />
            Download for Windows
          </Button>
        </a>
      </div>
    </section>
  )
}

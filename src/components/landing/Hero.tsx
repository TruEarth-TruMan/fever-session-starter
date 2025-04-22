
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <section className="relative flex flex-col items-center justify-center px-4 py-20 md:py-32 bg-gradient-to-br from-fever-black via-fever-dark to-fever-red/80 text-center">
      {/* Fever logo placeholder */}
      <div className="mb-6">
        <div className="mx-auto bg-gradient-to-tr from-fever-red via-fever-amber to-fever-light rounded-full p-2 w-20 h-20 flex items-center justify-center shadow-lg">
          {/* Replace with logo image if available */}
          <span className="text-fever-black font-bold text-3xl tracking-tight">F</span>
        </div>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-fever-light mb-4">
        Built for <span className="text-fever-red">Scarlett</span>. Ready to Record.
      </h1>
      <p className="text-lg md:text-xl text-fever-light/80 mb-8 max-w-2xl mx-auto">
        Fever is the DAW that just works&mdash;with your Focusrite Scarlett interface, straight out of the box.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button className="rounded-full px-8 py-3 text-lg font-semibold bg-gradient-to-r from-fever-red via-fever-amber to-fever-amber hover:from-fever-amber hover:to-fever-red shadow-xl transition-all animate-pulse" size="lg">
          Download for Free
        </Button>
        <Button variant="outline" className="rounded-full px-8 py-3 text-lg font-semibold border-fever-red/70 text-fever-light hover:bg-fever-red/70 hover:text-white transition">
          Join the Beta
        </Button>
      </div>
    </section>
  )
}

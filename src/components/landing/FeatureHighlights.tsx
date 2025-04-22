
import { Mic, Headphones, SlidersHorizontal, Brain } from "lucide-react"

const features = [
  {
    icon: <Mic size={36} className="text-fever-red" />,
    title: "Pre-configured Sessions",
    desc: "Instant vocal, band, podcast, and guitar templates.",
  },
  {
    icon: <Headphones size={36} className="text-fever-amber" />,
    title: "No Setup Needed",
    desc: "Just plug in and press record.",
  },
  {
    icon: <SlidersHorizontal size={36} className="text-fever-blue" />,
    title: "Built-in Amp Sims & Chains",
    desc: "Authentic amp tones and ready-to-go vocal chains.",
  },
  {
    icon: <Brain size={36} className="text-fever-amber" />,
    title: "AI Smart Mixing",
    desc: "Automatic, pro-sounding mixes (coming soon).",
  },
]

export default function FeatureHighlights() {
  return (
    <section className="py-12 bg-fever-dark/70">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ icon, title, desc }, i) => (
            <div key={i} className="flex flex-col items-center bg-fever-black rounded-xl shadow-lg py-8 px-4 glass-morphism">
              <span className="mb-4">{icon}</span>
              <h3 className="text-xl font-bold mb-2 text-fever-light">{title}</h3>
              <p className="text-fever-light/70 text-center">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

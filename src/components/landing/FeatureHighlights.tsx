
import { Mic, Guitar, Headphones, Brain } from "lucide-react"

const features = [
  {
    icon: <Mic size={36} className="text-fever-red" />,
    title: "Pre-configured Sessions",
    desc: "Templates for vocals, guitar, band, podcast.",
  },
  {
    icon: <Headphones size={36} className="text-fever-amber" />,
    title: "Zero Setup",
    desc: "Plug in and record instantly.",
  },
  {
    icon: <Guitar size={36} className="text-fever-blue" />,
    title: "Vocal Chains & Amp Sim",
    desc: "Built-in vocal chains and guitar amp simulation.",
  },
  {
    icon: <Brain size={36} className="text-fever-amber" />,
    title: "Smart Mixing AI",
    desc: "Automatic, pro-sounding mixes (coming soon).",
  },
]

export default function FeatureHighlights() {
  return (
    <section className="py-12 bg-fever-dark/70">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7 sm:gap-8">
          {features.map(({ icon, title, desc }, i) => (
            <div key={i} className="flex flex-col items-center bg-fever-black rounded-xl shadow-lg py-8 px-5 glass-morphism hover-scale transition group">
              <span className="mb-4 drop-shadow-lg">{icon}</span>
              <h3 className="text-xl font-bold mb-1 text-fever-light font-orbitron group-hover:text-fever-red transition">{title}</h3>
              <p className="text-fever-light/75 text-center text-base">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

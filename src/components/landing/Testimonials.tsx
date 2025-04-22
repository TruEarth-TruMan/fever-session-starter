
const testimonials = [
  {
    quote: "GarageBand if it had street smarts.",
    author: "Beta Tester, 2025",
  },
  {
    quote: "Feels like tape, moves like lightning.",
    author: "Studio Producer",
  },
  {
    quote: "I made a full demo in 15 minutes flat.",
    author: "Home Recording Artist",
  },
]

export default function Testimonials() {
  return (
    <section className="py-14 bg-fever-black">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-7 text-fever-light font-orbitron tracking-tight">What People Are Saying</h2>
        <div className="flex flex-col gap-7">
          {testimonials.map(({ quote, author }, i) => (
            <blockquote key={i} className="bg-fever-dark/75 rounded-xl px-7 py-7 shadow-lg glass-morphism border-l-4 border-fever-red text-left">
              <p className="text-lg md:text-xl font-semibold text-fever-amber mb-2 italic">&ldquo;{quote}&rdquo;</p>
              <footer className="text-sm text-fever-blue/80 not-italic pl-2">— {author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

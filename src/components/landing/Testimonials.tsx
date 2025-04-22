
const testimonials = [
  {
    quote: "GarageBand if it had street smarts.",
    author: "Beta Tester, 2025",
  },
  {
    quote: "Built like tape. Fast like fire.",
    author: "Studio Producer",
  },
]

export default function Testimonials() {
  return (
    <section className="py-14 bg-fever-black">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-6 text-fever-light">What People Are Saying</h2>
        <div className="flex flex-col gap-8">
          {testimonials.map(({ quote, author }, i) => (
            <blockquote key={i} className="bg-fever-dark/70 rounded-xl px-6 py-6 shadow-md glass-morphism">
              <p className="text-lg md:text-xl font-semibold text-fever-amber mb-2">&ldquo;{quote}&rdquo;</p>
              <footer className="text-sm text-fever-blue/80">{author}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

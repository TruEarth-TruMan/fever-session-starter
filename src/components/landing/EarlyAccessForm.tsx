
import { Button } from "@/components/ui/button"

export default function EarlyAccessForm() {
  return (
    <section className="py-12 bg-fever-dark/60">
      <div className="max-w-xl mx-auto text-center rounded-xl px-6 py-10 bg-fever-black/80 shadow-xl border border-fever-dark glass-morphism">
        <h2 className="text-2xl font-bold mb-4 text-fever-light">
          Get Early Access to Fever
        </h2>
        <p className="mb-6 text-fever-light/80">
          Get notified when Fever launches + early beta access.
        </p>
        {/* Replace with Mailchimp/Netlify form embed as needed */}
        <form className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <input
            type="email"
            required
            className="w-full sm:w-auto flex-1 px-4 py-3 rounded-full bg-fever-dark/80 border border-fever-red text-fever-light placeholder:text-fever-light/60 focus:ring-2 focus:ring-fever-red outline-none transition"
            placeholder="Your email address"
          />
          <Button type="submit" className="rounded-full px-6 py-3 bg-fever-red hover:bg-fever-red/90 text-white font-semibold text-lg shadow-lg transition">
            Notify Me
          </Button>
        </form>
        <p className="mt-3 text-xs text-fever-light/50">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}

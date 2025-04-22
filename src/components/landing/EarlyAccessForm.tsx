
import { Button } from "@/components/ui/button"

export default function EarlyAccessForm() {
  return (
    <section className="py-12 bg-fever-dark/60">
      <div className="max-w-xl mx-auto text-center rounded-xl px-6 py-10 bg-fever-black/80 shadow-xl border border-fever-dark glass-morphism">
        <h2 className="text-2xl font-bold mb-4 text-fever-light font-orbitron">
          Get Early Access to Fever
        </h2>
        <p className="mb-6 text-fever-light/80">
          Join the waitlist for early beta access and updates.
        </p>
        {/* Netlify Form (static stub) */}
        <form 
          name="fever-early-access" 
          method="POST" 
          data-netlify="true"
          className="flex flex-col gap-4"
        >
          <input type="hidden" name="form-name" value="fever-early-access" />
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              name="name"
              required
              className="w-full sm:w-auto flex-1 px-4 py-3 rounded-full bg-fever-dark/80 border border-fever-red text-fever-light placeholder:text-fever-light/60 focus:ring-2 focus:ring-fever-red outline-none transition"
              placeholder="Your name"
            />
            <input
              type="email"
              name="email"
              required
              className="w-full sm:w-auto flex-1 px-4 py-3 rounded-full bg-fever-dark/80 border border-fever-red text-fever-light placeholder:text-fever-light/60 focus:ring-2 focus:ring-fever-red outline-none transition"
              placeholder="Your email address"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              name="interest"
              required
              className="w-full sm:w-auto flex-1 px-4 py-3 rounded-full bg-fever-dark/80 border border-fever-amber text-fever-light focus:ring-2 focus:ring-fever-amber outline-none transition"
              defaultValue=""
            >
              <option value="" disabled>I'm interested as a...</option>
              <option value="vocalist">Vocalist</option>
              <option value="guitarist">Guitarist</option>
              <option value="podcaster">Podcaster</option>
              <option value="band">Band</option>
            </select>
            <Button type="submit" className="rounded-full px-6 py-3 bg-gradient-to-r from-fever-red via-fever-amber to-fever-red hover:from-fever-amber hover:to-fever-red text-white font-semibold text-lg shadow-lg transition">
              Join the Fever Early Access List
            </Button>
          </div>
        </form>
        <p className="mt-3 text-xs text-fever-light/50">No spam, ever. Unsubscribe anytime.</p>
      </div>
    </section>
  )
}

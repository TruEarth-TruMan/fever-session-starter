
import { Github } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-fever-black py-8 border-t border-fever-dark/70">
      <div className="flex flex-col md:flex-row md:justify-between items-center max-w-5xl mx-auto px-6 gap-3">
        <div className="flex items-center gap-2 mb-2 md:mb-0">
          <div className="w-8 h-8 bg-gradient-to-tr from-fever-red to-fever-amber rounded-full flex items-center justify-center text-fever-black font-extrabold text-xl font-orbitron">
            F
          </div>
          <span className="text-fever-light font-bold tracking-wide text-lg ml-2 font-orbitron">Fever</span>
        </div>
        <nav className="flex items-center gap-6 text-fever-light/70 text-sm">
          <a href="#" className="hover:text-fever-red transition">Privacy</a>
          <a href="#" className="hover:text-fever-red transition">Terms</a>
          <a href="mailto:contact@feverstudio.live" className="hover:text-fever-red transition">Contact</a>
          <a href="https://github.com/feverstudio" target="_blank" rel="noopener" className="hover:text-fever-red transition flex items-center gap-1">
            <Github size={18} /> GitHub
          </a>
        </nav>
      </div>
    </footer>
  )
}

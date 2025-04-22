
import Hero from "@/components/landing/Hero"
import FeatureHighlights from "@/components/landing/FeatureHighlights"
import ScreenshotSection from "@/components/landing/ScreenshotSection"
import Testimonials from "@/components/landing/Testimonials"
import EarlyAccessForm from "@/components/landing/EarlyAccessForm"
import Footer from "@/components/landing/Footer"

export default function Landing() {
  return (
    <div className="bg-fever-black min-h-screen flex flex-col text-fever-light font-poppins">
      <header>
        <Hero />
      </header>
      <main className="flex-1 flex flex-col gap-12">
        <FeatureHighlights />
        <ScreenshotSection />
        <Testimonials />
        <EarlyAccessForm />
      </main>
      <Footer />
    </div>
  )
}

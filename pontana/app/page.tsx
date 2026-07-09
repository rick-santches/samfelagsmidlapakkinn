import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Menu from '@/components/Menu'
import Gallery from '@/components/Gallery'
import Reviews from '@/components/Reviews'
import Hours from '@/components/Hours'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'
import StickyCta from '@/components/StickyCta'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main id="efni">
        <Hero />
        <About />
        <Menu />
        <Gallery />
        <Reviews />
        <Hours />
        <Contact />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}

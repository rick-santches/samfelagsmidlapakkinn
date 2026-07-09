import Nav from '@/components/Nav'
import Hero from '@/components/Hero'
import About from '@/components/About'
import Menu from '@/components/Menu'
import Reviews from '@/components/Reviews'
import Hours from '@/components/Hours'
import Contact from '@/components/Contact'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <About />
        <Menu />
        <Reviews />
        <Hours />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

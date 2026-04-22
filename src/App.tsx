import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

import Works from './components/Works';
import Hero from './components/Hero';
import About from './components/About';
import Footer from './components/Footer';

function App() {

  return (
    <>
     <ReactLenis root />
      <Hero />
      <About />
      <Works />
      <Footer />
    </>
  )
}

export default App

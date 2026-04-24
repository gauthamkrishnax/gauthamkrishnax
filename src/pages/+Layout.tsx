export { Layout }
import '../styles/index.css'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import React from 'react'
import Footer from '../components/Footer'
import { ParallaxBatchProvider } from '../components/ParallaxBatchContext'
import RouteScrollReset from '../components/RouteScrollReset'
import { ClientOnly } from 'vike-react/ClientOnly'
import ThemeToggle from '../components/ThemeToggle'

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <React.StrictMode>
            <ReactLenis
                root
                options={{
                    stopInertiaOnNavigate: true,
                    /** Higher = scroll catches up faster (default 0.1 feels sluggish on busy pages). */
                    lerp: 0.18,
                    wheelMultiplier: 1.05,
                }}
            >
                <ParallaxBatchProvider>
                    <RouteScrollReset />
                    {children}
                    <Footer />
                </ParallaxBatchProvider>
                <ClientOnly fallback={null}>
                    <ThemeToggle />
                </ClientOnly>
            </ReactLenis>

        </React.StrictMode>
    );
}
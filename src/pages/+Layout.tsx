export { Layout }
import '../styles/index.css'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import React from 'react'
import Footer from '../components/Footer'
import RouteScrollReset from '../components/RouteScrollReset'
import { ClientOnly } from 'vike-react/ClientOnly'
import ThemeToggle from '../components/ThemeToggle'

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <React.StrictMode>
            <ReactLenis root options={{ stopInertiaOnNavigate: true }}>
                <RouteScrollReset />
                {children}
                <Footer />
                <ClientOnly fallback={null}>
                    <ThemeToggle />
                </ClientOnly>
            </ReactLenis>

        </React.StrictMode>
    );
}
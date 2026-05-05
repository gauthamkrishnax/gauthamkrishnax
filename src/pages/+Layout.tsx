export { Layout }
import '../styles/index.css'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import type { ReactNode } from 'react'
import Footer from '../components/Footer'
import RouteScrollReset from '../components/RouteScrollReset'
import { ClientOnly } from 'vike-react/ClientOnly'
import ThemeToggle from '../components/ThemeToggle'

function Layout({ children }: { children: ReactNode }) {
    return (
        <ReactLenis
            root
            options={{
                stopInertiaOnNavigate: true,
                // Keep smoothness but reduce animation work per frame.
                lerp: 0.14,
                wheelMultiplier: 1,
                smoothTouch: false,
            }}
        >
            <RouteScrollReset />
            {children}
            <Footer />
            <ClientOnly fallback={null}>
                <ThemeToggle />
            </ClientOnly>
        </ReactLenis>
    );
}
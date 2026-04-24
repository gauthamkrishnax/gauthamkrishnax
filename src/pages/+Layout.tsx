export { Layout }
import '../styles/index.css'

import { ReactLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'
import React from 'react'
import Footer from '../components/Footer'
import RouteScrollReset from '../components/RouteScrollReset'

function Layout({ children }: { children: React.ReactNode }) {
    return (
        <React.StrictMode>
            <ReactLenis root options={{ stopInertiaOnNavigate: true }}>
                <RouteScrollReset />
                {children}
                <Footer />
            </ReactLenis>

        </React.StrictMode>
    );
}
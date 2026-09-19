import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import CTA from './sections/shared/cta'
import Footer from './sections/shared/footer'
import Navbar from './sections/shared/navbar'

const ScrollToTop = () => {
    const { pathname } = useLocation()

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])

    return null
}

const Layout = ({ children }) => {
    return (
        <main>
            <ScrollToTop />
            <Navbar />
            {children}
            <CTA />
            <Footer />
        </main>
    )
}

export default Layout
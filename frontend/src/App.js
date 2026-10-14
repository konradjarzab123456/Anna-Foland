import { useEffect, Component } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { SiteProvider } from "@/context/SiteContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Offer from "@/pages/Offer";
import Works from "@/pages/Works";
import ServicePage from "@/pages/ServicePage";
import Contact from "@/pages/Contact";
import Admin from "@/pages/Admin";
import { Toaster } from "@/components/ui/sonner";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { err: false };
  }
  static getDerivedStateFromError() {
    return { err: true };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-paper font-sans text-ink">
          <p>Coś poszło nie tak. Odśwież stronę.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function LenisRoot() {
  const { pathname } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function SiteLayout() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="grain-overlay" />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/o-firmie" element={<About />} />
        <Route path="/oferta" element={<Offer />} />
        <Route path="/oferta/:slug" element={<ServicePage />} />
        <Route path="/realizacje" element={<Works />} />
        <Route path="/kontakt" element={<Contact />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SiteProvider>
        <BrowserRouter>
          <LenisRoot />
          <Routes>
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<SiteLayout />} />
          </Routes>
          <Toaster position="bottom-right" richColors />
        </BrowserRouter>
      </SiteProvider>
    </ErrorBoundary>
  );
}

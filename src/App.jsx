import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useCallback } from 'react';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import DiscoverPage from './pages/DiscoverPage';
import VenuesPage from './pages/VenuesPage';
import PromotersPage from './pages/PromotersPage';
import TicketsPage from './pages/TicketsPage';
import EventDetailPage from './pages/EventDetailPage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  const [notice, setNotice] = useState(null);
  const closeNotice = useCallback(() => setNotice(null), []);
  const showGetAppNotice = useCallback(
    () =>
      setNotice({
        title: 'Beta access unlocked',
        body: 'NOX mobile app access is queued for the Yangon launch list.',
      }),
    [],
  );

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-purple-500/10 to-black pointer-events-none" />
          <Navbar onGetApp={showGetAppNotice} />
          <Notification notice={notice} onClose={closeNotice} />

          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<DiscoverPage />} />
              <Route path="/venues" element={<VenuesPage />} />
              <Route path="/promoters" element={<PromotersPage />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/event/:id" element={<EventDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </ErrorBoundary>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

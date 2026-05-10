import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './sections/Dashboard.tsx';
import Interfaces from './sections/Interfaces.tsx';
import FirewallManagement from './sections/FirewallManagement.tsx';
import VPNManagement from './sections/VPNManagement.tsx';
import HotspotManagement from './sections/HotspotManagement.tsx';
import SubscriberManagement from './sections/SubscriberManagement.tsx';
import { WANSetup, DHCPSetup, TrafficAnalysis, PPPoEManagement, IPoEManagement } from './sections/ConfigModules.tsx';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/interfaces" element={<Interfaces />} />
          <Route path="/wan" element={<WANSetup />} />
          <Route path="/dhcp" element={<DHCPSetup />} />
          <Route path="/pppoe" element={<PPPoEManagement />} />
          <Route path="/subscribers" element={<SubscriberManagement />} />
          <Route path="/ipoe" element={<IPoEManagement />} />
          <Route path="/firewall" element={<FirewallManagement />} />
          <Route path="/vpn" element={<VPNManagement />} />
          <Route path="/hotspot" element={<HotspotManagement />} />
          <Route path="/users" element={<HotspotManagement />} />
          <Route path="/analysis" element={<TrafficAnalysis />} />
          <Route path="/system" element={<div className="p-10 border border-white/5 bg-[#0f0f12] rounded-2xl"><h2 className="text-xl font-bold mb-4">System Settings</h2><p className="text-white/40">NexusOS Linux v4.2 stable. Kernel 6.1.28-nexus-x64.</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

import NewRFP from './pages/NewRFP';
import Vendors from './pages/Vendors';
import Inbox from './pages/Inbox';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<NewRFP />} />
          <Route path="/vendors" element={<Vendors />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

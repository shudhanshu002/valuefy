import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Holdings from './pages/Holdings';
import History from './pages/History';
import EditModel from './pages/EditModel';

function App() {
  const clientId = 'C001'; // Static for this build

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
        <Navbar />
        <main className="container mx-auto py-10 px-6">
          <Routes>
            <Route path="/" element={<Dashboard clientId={clientId} />} />
            <Route path="/holdings" element={<Holdings clientId={clientId} />} />
            <Route path="/history" element={<History clientId={clientId} />} />
            <Route path="/edit-model" element={<EditModel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
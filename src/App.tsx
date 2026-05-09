import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Quick placeholders for our next steps
// const Dashboard = () => (
//   <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
//     <h1 className="text-3xl font-bold text-dark mb-4">User Dashboard</h1>

//   </div>
// );

// const AdminPanel = () => (
//   <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
//     <h1 className="text-3xl font-bold text-dark mb-4">Admin Panel</h1>

//   </div>
// );

function App() {
  return (
    <Router basename="/nyota-clone/">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        {/* <Route path="/LandingPage" element={<LandingPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

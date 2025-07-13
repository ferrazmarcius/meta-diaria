import { Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/ProtectedRoute'; // Importamos nosso segurança

function App() {
  return (
    <div>
      <nav>
        <Link to="/register">Registrar</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/">Dashboard</Link>
      </nav>
      <hr />
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        {/* A rota do Dashboard agora está protegida */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
// frontend/src/App.jsx

import { Routes, Route, Link } from 'react-router-dom';

// Importando nossas novas páginas
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <div>
      {/* Criamos um menu de navegação simples para teste */}
      <nav>
        <Link to="/register">Registrar</Link> |{' '}
        <Link to="/login">Login</Link> |{' '}
        <Link to="/">Dashboard</Link>
      </nav>

      <hr />

      {/* Esta é a área mágica onde o roteador irá renderizar a página correta */}
      <Routes>
        {/* Quando a URL for /register, mostre o componente RegisterPage */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Quando a URL for /login, mostre o componente LoginPage */}
        <Route path="/login" element={<LoginPage />} />

        {/* Quando a URL for a raiz "/", mostre o componente DashboardPage */}
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </div>
  )
}

export default App;
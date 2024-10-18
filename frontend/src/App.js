import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Login from './Login'; // Importando o componente Login

function App() {
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8000/api/teste/')
      .then(response => {
        setMensagem(response.data.mensagem);
      })
      .catch(error => {
        console.error('Erro ao buscar dados da API!', error);
      });
  }, []);

  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><Link to="/teste">Teste da API</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </nav>

        <Routes>
          {/* Rota para a página de teste da API */}
          <Route path="/teste" element={
            <div>
              <h1>Teste de Comunicação React e Django</h1>
              <p>{mensagem}</p>
            </div>
          } />

          {/* Rota para a página de login */}
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

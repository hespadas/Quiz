import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div>
      <h1>Teste de Comunicação React e Django</h1>
      <p>{mensagem}</p>
    </div>
  );
}

export default App;

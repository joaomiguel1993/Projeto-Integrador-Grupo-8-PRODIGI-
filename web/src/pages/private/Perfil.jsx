import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiFetch } from '../../services/api';
import { STORAGE_KEYS } from '../../constants/roles';
import '../../styles/main.css';

export default function Perfil() {
  const { textos } = useLanguage();
  const navigate = useNavigate();

  const [dadosIniciais, setDadosAtuais] = useState(null);

  const [idfunc, setIdfunc] = useState('');
  const [nome, setNome] = useState('');
  const [tipofunc, setTipofunc] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [biografia, setBiografia] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imgErro, setImgErro] = useState(false);

  const getUserId = () => {
    const rawUser = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!rawUser) return null;
    try {
      const userObj = JSON.parse(rawUser);
      return userObj.idfunc || userObj.id || null;
    } catch {
      return null;
    }
  };

  const getFallbackAvatar = (nomeValor) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeValor || 'Utilizador')}&background=e2e8f0&color=7f8c8d`;

  const getFotoSrc = (src) => {
    if (!src) return getFallbackAvatar(nome);

    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) {
      return src;
    }

    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_OPEN_APIURL || '';
    if (!apiBase) return src.startsWith('/') ? src : `/${src}`;

    const cleanBase = apiBase.replace(/\/+$/, '');
    const cleanSrc = src.replace(/^\/+/, '');
    return `${cleanBase}/${cleanSrc}`;
  };

  const carregarTudo = async () => {
    const myId = getUserId();

    if (!myId) {
      setErro(textos.perfil.erroSessao);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErro('');

      const user = await apiFetch(`/api/v1/utilizadores/${myId}`);
      const prof = await apiFetch(`/api/v1/profissionais/${myId}`);

      const dados = { ...prof, ...user };
      setDadosAtuais(dados);

      setIdfunc(myId);
      setNome(prof.nome || '');
      setTipofunc(prof.tipofunc || '');
      setUsername(user.username || '');
      setEmail(prof.email || '');
      setTelefone(prof.telefone || '');
      setBiografia(prof.biografia || '');
      setFotoUrl(prof.foto_url || '');
      setImgErro(false);
    } catch (err) {
      setErro(textos.perfil.erroCarregar + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTudo();
  }, [textos.perfil.erroCarregar, textos.perfil.erroSessao]);

  const handleVoltar = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/admin');
    }
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensagem('');
    setErro('');

    if (!dadosIniciais) {
      setErro(textos.perfil.erroCarregar);
      return;
    }

    setSubmitting(true);

    try {
      const payloadUser = {
        username: dadosIniciais.username || username,
        password: password || null,
        role: dadosIniciais.role,
        hospitais: dadosIniciais.hospitais || [],
        bloqueado: dadosIniciais.bloqueado,
      };

      await apiFetch(`/api/v1/utilizadores/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify(payloadUser),
      });

      const payloadProf = {
        nome: dadosIniciais.nome || nome,
        tipofunc: dadosIniciais.tipofunc || tipofunc,
        sexo: dadosIniciais.sexo,
        email: email || null,
        telefone: telefone || null,
        biografia: biografia || null,
        foto_url: fotoUrl || null,
      };

      await apiFetch(`/api/v1/profissionais/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify(payloadProf),
      });

      setMensagem(textos.perfil.sucessoGuardar);
      setPassword('');

      const rawUser = sessionStorage.getItem('user');
      if (rawUser) {
        try {
          const userObj = JSON.parse(rawUser);
          userObj.username = dadosIniciais.username || username;
          userObj.foto_url = fotoUrl;
          sessionStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userObj));
        } catch {
          // ignorar
        }
      }

      await carregarTudo();
    } catch (err) {
      setErro(textos.perfil.erroGuardar + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        {textos.perfil.aCarregar}
      </div>
    );
  }

  const fotoFinal = imgErro ? getFallbackAvatar(nome) : getFotoSrc(fotoUrl);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}>
      <button
        type="button"
        onClick={handleVoltar}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#3eb489',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '15px',
          padding: 0,
          fontSize: '1rem',
        }}
      >
        ← Voltar
      </button>

      <h1
        style={{
          color: '#2c3e50',
          marginBottom: '20px',
          borderBottom: '2px solid #3eb489',
          paddingBottom: '10px',
        }}
      >
        {textos.perfil.titulo}
      </h1>

      {mensagem && (
        <div
          style={{
            padding: '15px',
            background: '#d4edda',
            color: '#155724',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          {mensagem}
        </div>
      )}

      {erro && (
        <div
          style={{
            padding: '15px',
            background: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          {erro}
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div
          style={{
            flex: '1 1 300px',
            background: '#fff',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <img
              src={fotoFinal}
              alt="Fotografia do utilizador"
              onError={() => setImgErro(true)}
              style={{
                width: '150px',
                height: '150px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid #3eb489',
                marginBottom: '15px',
              }}
            />
            <h2 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{nome}</h2>
            <p
              style={{
                margin: '0',
                color: '#7f8c8d',
                fontSize: '1.1rem',
                textTransform: 'capitalize',
              }}
            >
              {tipofunc}
            </p>
            <span
              style={{
                display: 'inline-block',
                marginTop: '10px',
                background: '#ecf0f1',
                padding: '5px 15px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                color: '#7f8c8d',
              }}
            >
              {textos.perfil.numFuncionario} {idfunc}
            </span>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #ecf0f1', marginBottom: '20px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '5px' }}>
                {textos.perfil.linkFotografia}
              </label>
              <input
                type="url"
                value={fotoUrl}
                onChange={(e) => {
                  setFotoUrl(e.target.value);
                  setImgErro(false);
                }}
                placeholder={textos.perfil.placeholderFotografia}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '5px' }}>
                {textos.perfil.telemovel}
              </label>
              <input
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '5px' }}>
                {textos.perfil.emailPessoal}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            flex: '2 1 400px',
            background: '#fff',
            padding: '25px',
            borderRadius: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          }}
        >
          <form onSubmit={handleGuardar} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ marginTop: 0, color: '#34495e', marginBottom: '15px' }}>
              {textos.perfil.sobreMim}
            </h3>

            <textarea
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              placeholder={textos.perfil.placeholderBiografia}
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />

            <h3 style={{ color: '#34495e', margin: '30px 0 15px 0' }}>
              {textos.perfil.segurancaAcesso}
            </h3>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '5px' }}>
                  {textos.perfil.nomeUtilizador}
                </label>
                <input
                  type="text"
                  value={username}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                    background: '#f8f9fa',
                    color: '#6c757d',
                    cursor: 'not-allowed',
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#7f8c8d', marginBottom: '5px' }}>
                  {textos.perfil.novaPassword}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={textos.perfil.placeholderPassword}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '30px', textAlign: 'right' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: '#2ecc71',
                  color: '#fff',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  transition: 'background 0.2s',
                }}
              >
                {submitting ? textos.perfil.botaoGuardarLoading : textos.perfil.botaoGuardar}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
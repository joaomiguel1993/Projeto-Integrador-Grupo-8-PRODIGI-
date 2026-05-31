import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { apiFetch } from '../../services/api';
import { STORAGE_KEYS } from '../../constants/roles';
import '../../styles/main.css';

/**
 * Componente de Gestão de Perfil (Perfil).
 * Permite que o utilizador autenticado visualize e edite os seus dados profissionais,
 * biografia, contactos e credenciais de acesso ao sistema SIAGUH.
 * @component
 */
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

  /**
   * Obtém o ID do utilizador logado a partir do armazenamento da sessão.
   */
  const getUserId = () => {
    const rawUser = sessionStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!rawUser) return null;
    try {
      const userObj = JSON.parse(rawUser);
      return userObj.idfunc || userObj.id || null;
    } catch { return null; }
  };

  /**
   * Gera um avatar de fallback baseado no nome do utilizador.
   */
  const getFallbackAvatar = (nomeValor) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(nomeValor || 'Utilizador')}&background=e2e8f0&color=7f8c8d`;

  /**
   * Resolve a URL da imagem de perfil garantindo que o caminho é absoluto para a API.
   */
  const getFotoSrc = (src) => {
    if (!src) return getFallbackAvatar(nome);
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('blob:')) return src;
    const apiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_OPEN_APIURL || '';
    if (!apiBase) return src.startsWith('/') ? src : `/${src}`;
    return `${apiBase.replace(/\/+$/, '')}/${src.replace(/^\/+/, '')}`;
  };

  /**
   * Carrega os dados agregados (utilizador + perfil profissional) da API.
   */
  const carregarTudo = async () => {
    const myId = getUserId();
    if (!myId) { setErro(textos.perfil.erroSessao); setLoading(false); return; }
    try {
      setLoading(true); setErro('');
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

  useEffect(() => { carregarTudo(); }, []);

  const handleVoltar = () =>
    window.history.length > 1 ? navigate(-1) : navigate('/admin');

  /**
   * Persiste as alterações do perfil na API.
   */
  const handleGuardar = async (e) => {
    e.preventDefault();
    setMensagem(''); setErro('');
    if (!dadosIniciais) { setErro(textos.perfil.erroCarregar); return; }
    setSubmitting(true);
    try {
      await apiFetch(`/api/v1/utilizadores/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify({
          username: dadosIniciais.username || username,
          password: password || null,
          role: dadosIniciais.role,
          hospitais: dadosIniciais.hospitais || [],
          bloqueado: dadosIniciais.bloqueado,
        }),
      });
      await apiFetch(`/api/v1/profissionais/${idfunc}`, {
        method: 'PUT',
        body: JSON.stringify({
          nome: dadosIniciais.nome || nome,
          tipofunc: dadosIniciais.tipofunc || tipofunc,
          sexo: dadosIniciais.sexo,
          email: email || null,
          telefone: telefone || null,
          biografia: biografia || null,
          foto_url: fotoUrl || null,
        }),
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
        } catch { /* ignorar erro de parse */ }
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
      <div className="perfil-loading">
        <div className="perfil-loading__spinner" />
        <p>{textos.perfil.aCarregar}</p>
      </div>
    );
  }

  const fotoFinal = imgErro ? getFallbackAvatar(nome) : getFotoSrc(fotoUrl);

  return (
    <div className="perfil-shell">
      <div className="perfil-header">
        <button type="button" className="btn-back" onClick={handleVoltar}>
          ← {textos.geral?.voltar || 'Voltar'}
        </button>
        <div>
          <h1 className="perfil-header__title">{textos.perfil.titulo}</h1>
        </div>
      </div>

      {mensagem && <div className="perfil-alert perfil-alert--success">{mensagem}</div>}
      {erro && <div className="perfil-alert perfil-alert--error">{erro}</div>}

      <div className="perfil-grid">
        <aside className="perfil-card perfil-card--side">
          <div className="perfil-avatar-block">
            <div className="perfil-avatar-wrap">
              <img
                src={fotoFinal}
                alt="Fotografia do utilizador"
                className="perfil-avatar"
                onError={() => setImgErro(true)}
              />
            </div>
            <h2 className="perfil-avatar-block__name">{nome}</h2>
            <p className="perfil-avatar-block__role">{tipofunc}</p>
            <span className="perfil-badge">
              {textos.perfil.numFuncionario} {idfunc}
            </span>
          </div>
          <hr className="perfil-divider" />
          <div className="perfil-fields">
            <div className="perfil-field">
              <label className="perfil-field__label">{textos.perfil.linkFotografia}</label>
              <input
                type="url"
                className="perfil-field__input"
                value={fotoUrl}
                onChange={(e) => { setFotoUrl(e.target.value); setImgErro(false); }}
                placeholder={textos.perfil.placeholderFotografia}
              />
            </div>
            <div className="perfil-field">
              <label className="perfil-field__label">{textos.perfil.telemovel}</label>
              <input
                type="tel"
                className="perfil-field__input"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />
            </div>
            <div className="perfil-field">
              <label className="perfil-field__label">{textos.perfil.emailPessoal}</label>
              <input
                type="email"
                className="perfil-field__input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </aside>

        <section className="perfil-card perfil-card--main">
          <form className="perfil-form" onSubmit={handleGuardar}>
            <h3 className="perfil-form__section-title">{textos.perfil.sobreMim}</h3>
            <textarea
              className="perfil-form__textarea"
              value={biografia}
              onChange={(e) => setBiografia(e.target.value)}
              placeholder={textos.perfil.placeholderBiografia}
            />

            <h3 className="perfil-form__section-title">{textos.perfil.segurancaAcesso}</h3>
            <div className="perfil-form__row">
              <div className="perfil-field">
                <label className="perfil-field__label">{textos.perfil.nomeUtilizador}</label>
                <input
                  type="text"
                  className="perfil-field__input perfil-field__input--readonly"
                  value={username}
                  readOnly
                />
              </div>
              <div className="perfil-field">
                <label className="perfil-field__label">{textos.perfil.novaPassword}</label>
                <input
                  type="password"
                  className="perfil-field__input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={textos.perfil.placeholderPassword}
                />
              </div>
            </div>

            <div className="perfil-form__actions">
              <button
                type="submit"
                className="btn btn--primary perfil-form__submit"
                disabled={submitting}
              >
                {submitting ? textos.perfil.botaoGuardarLoading : textos.perfil.botaoGuardar}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
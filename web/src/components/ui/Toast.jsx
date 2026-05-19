import { useEffect, useState } from 'react';

/**
 * Toast — notificação temporária que aparece no canto inferior direito.
 *
 * Props:
 *   mensagem  {string}  — texto a mostrar
 *   tipo      {string}  — 'sucesso' | 'erro' | 'aviso'
 *   onFechar  {func}    — callback quando o toast fecha
 *   duracao   {number}  — milissegundos até fechar automaticamente (default: 3500)
 */
export default function Toast({ mensagem, tipo = 'sucesso', onFechar, duracao = 3500 }) {
  const [visivel, setVisivel] = useState(false);

  useEffect(() => {
    if (!mensagem) return;
    // Pequeno delay para activar a animação de entrada
    const t1 = setTimeout(() => setVisivel(true), 10);
    const t2 = setTimeout(() => {
      setVisivel(false);
      setTimeout(onFechar, 300); // espera animação de saída
    }, duracao);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [mensagem]);

  if (!mensagem) return null;

  const cores = {
    sucesso: { bg: '#d4edda', border: '#28a745', cor: '#155724', icone: '✅' },
    erro:    { bg: '#f8d7da', border: '#dc3545', cor: '#721c24', icone: '⚠️' },
    aviso:   { bg: '#fff3cd', border: '#ffc107', cor: '#856404', icone: '⚠️' },
  };

  const estilo = cores[tipo] || cores.sucesso;

  return (
    <div style={{
      position:     'fixed',
      bottom:       '2rem',
      right:        '2rem',
      zIndex:       9999,
      maxWidth:     '360px',
      padding:      '1rem 1.25rem',
      borderRadius: '8px',
      backgroundColor: estilo.bg,
      border:       `1px solid ${estilo.border}`,
      color:        estilo.cor,
      boxShadow:    '0 4px 12px rgba(0,0,0,0.15)',
      display:      'flex',
      alignItems:   'flex-start',
      gap:          '0.75rem',
      opacity:      visivel ? 1 : 0,
      transform:    visivel ? 'translateY(0)' : 'translateY(1rem)',
      transition:   'opacity 0.25s ease, transform 0.25s ease',
    }}>
      <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{estilo.icone}</span>
      <span style={{ flex: 1, fontSize: '0.9rem', lineHeight: 1.4 }}>{mensagem}</span>
      <button
        type="button"
        onClick={() => { setVisivel(false); setTimeout(onFechar, 300); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: estilo.cor, fontWeight: 'bold', fontSize: '1rem',
          padding: 0, flexShrink: 0,
        }}
      >✕</button>
    </div>
  );
}

/**
 * useToast — hook para gerir o estado do toast.
 *
 * Uso:
 *   const { toast, mostrarToast, fecharToast } = useToast();
 *   mostrarToast('Gravado com sucesso!', 'sucesso');
 *   <Toast {...toast} onFechar={fecharToast} />
 */
export function useToast() {
  const [toast, setToast] = useState({ mensagem: '', tipo: 'sucesso' });

  const mostrarToast = (mensagem, tipo = 'sucesso') => {
    setToast({ mensagem, tipo });
  };

  const fecharToast = () => {
    setToast({ mensagem: '', tipo: 'sucesso' });
  };

  return { toast, mostrarToast, fecharToast };
}
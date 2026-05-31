import { useEffect, useState } from "react";
// CORRIGIDO: Importação alterada para garantir que lê o mesmo Provider do main.jsx
import { useLanguage } from "/src/contexts/LanguageContext";

/**
 * Componente de Fila de Espera Médica (DoctorQueue).
 * Renderiza, filtra e ordena de forma dinâmica a listagem de episódios de urgência ativos,
 * sincronizando os tempos decorridos e as cores prioritárias da Triagem de Manchester.
 * * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Array} props.episodios - Lista bruta de episódios injetados pelo dashboard.
 * @param {Array} props.episodiosOrdenados - Lista filtrada ou pré-ordenada do componente pai.
 * @param {function} props.setEpisodios - Callback para manipulação de estado do array geral de episódios.
 * @param {string} props.subMenuFila - Aba ativa no sub-menu da fila ("em_espera" ou "atendimento").
 * @param {function} props.setSubMenuFila - Callback mutador da aba ativa do sub-menu.
 * @param {string} props.filtro - Query de pesquisa para pesquisa em tempo real.
 * @param {function} props.setFiltro - Callback associado à pesquisa manual.
 * @param {function} props.abrirEpisodio - Routine assíncrona executada para carregar e abrir a ficha clínica de atendimento.
 * @param {Object.<string, string>} props.TRIAGECLASS - Dicionário de classes CSS acopladas às cores da triagem.
 * @param {Object|null} props.episodioSelecionado - Episódio que se encontra em monitorização activa ou nulo.
 * @param {function} props.setEpisodioSelecionado - Callback mutador do episódio selecionado.
 * @param {function|Object} props.headers - Cabeçalhos padrões de autorização Bearer JWT para os pedidos HTTP.
 */
export default function DoctorQueue({
  episodios,
  episodiosOrdenados,
  setEpisodios,
  subMenuFila,
  setSubMenuFila,
  filtro,
  setFiltro,
  abrirEpisodio,
  TRIAGECLASS,
  episodioSelecionado,
  setEpisodioSelecionado,
  headers,
}) {
  const { textos } = useLanguage();

  /**
   * Lê sequencialmente chaves dentro de uma estrutura em profundidade até obter um valor válido não vazio.
   * @param {Object} obj - Estrutura alvo.
   * @param {...string} keys - Lista ordenada de chaves para verificação.
   * @returns {*} O primeiro valor não nulo/vazio encontrado ou uma string vazia.
   */
  const readField = (obj, ...keys) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
  };

  /** @type {[Object, function]} triagensMap - Estado reativo guardando o hashmap das triagens indexado por cod_ep_urgenc */
  const [triagensMap, setTriagensMap] = useState({});

  useEffect(() => {
    /**
     * Consome a API buscando todas as triagens globais para popular o hashmap de prioridades.
     */
    const carregarTriagens = async () => {
      try {
        const res = await fetch("/api/v1/triagens/", {
          headers: typeof headers === "function" ? headers() : headers,
        });
        if (!res.ok) throw new Error("Erro ao carregar triagens");

        const data = await res.json();

        /** @type {Object} mapa - Dicionário optimizado O(1) de mapeamento de episódios clínicos */
        const mapa = Object.fromEntries(
          (data || []).map((t) => [String(t.cod_ep_urgenc), t])
        );

        setTriagensMap(mapa);
      } catch (error) {
        console.error("Erro ao carregar triagens:", error);
      }
    };

    carregarTriagens();
  }, [headers]);

  /** @constant {Object.<string, number>} TRIAGE_ORDER - Pesos numéricos padrões de Manchester para ordenação estável */
  const TRIAGE_ORDER = {
    vermelho: 1,
    laranja:  2,
    amarelo:  3,
    verde:    4,
    azul:     5,
  };

  const listaBase = Array.isArray(episodiosOrdenados)
    ? episodiosOrdenados
    : Array.isArray(episodios)
      ? episodios
      : [];

  const textoFiltro = String(filtro || "").trim().toLowerCase();

  /**
   * Resolve a cor da triagem de um episódio verificando recursivamente os estados injetados e locais.
   * @param {Object} ep - Registro do episódio clínico.
   * @returns {string} Cor da triagem identificada.
   */
  const getCorTriagemRaw = (ep) => {
    const codEpisodio = String(
      readField(ep, "codepurgenc", "codEpisodio", "codepisodio", "cod_ep_urgenc") || ""
    );

    const triagem = triagensMap?.[codEpisodio];

    return (
      triagem?.cortriagem  ?? triagem?.corTriagem  ?? triagem?.cor_triagem ??
      triagem?.prioridade  ?? triagem?.cor          ??
      ep?.cortriagem       ?? ep?.corTriagem        ?? ep?.cor_triagem     ??
      ep?.prioridade       ?? ep?.cor               ?? ""
    );
  };

  /** @type {Array} listaAtual - Lista final de episódios filtrada por abas, filtrada por pesquisa e ordenada de forma estável */
  const listaAtual = [...listaBase]
    .filter((ep) => {
      const estadoBruto = String(
        readField(ep, "estado", "estadolocal", "estado_local", "estadoepisodio", "estado_episodio") || ""
      ).toLowerCase().replaceAll("_", "");

      const nomeUtente  = String(readField(ep, "nomeutente", "nomeUtente", "nome_utente") || "").toLowerCase();
      const codEpisodio = String(readField(ep, "codepurgenc", "codEpisodio", "codepisodio", "cod_ep_urgenc") || "").toLowerCase();
      const corTriagem  = String(getCorTriagemRaw(ep) || "").toLowerCase();

      if (subMenuFila === "em_espera") {
        if (estadoBruto !== "ematendimento" && estadoBruto !== "emespera" && estadoBruto !== "espera") return false;
      }

      if (subMenuFila === "atendimento") {
        if (estadoBruto !== "emconsulta" && estadoBruto !== "atendimento") return false;
      }

      if (!textoFiltro) return true;

      return (
        nomeUtente.includes(textoFiltro) ||
        corTriagem.includes(textoFiltro) ||
        codEpisodio.includes(textoFiltro)
      );
    })
    .sort((a, b) => {
      const corA = String(getCorTriagemRaw(a) || "").toLowerCase();
      const corB = String(getCorTriagemRaw(b) || "").toLowerCase();

      const ordemA = TRIAGE_ORDER[corA] || 99;
      const ordemB = TRIAGE_ORDER[corB] || 99;

      if (ordemA !== ordemB) return ordemA - ordemB;

      const dataA = new Date(
        readField(a, "datahoratriagem", "data_hora_triagem", "datahorainicio", "data_hora_inicio", "data_hora_entr") || 0
      ).getTime();
      const dataB = new Date(
        readField(b, "datahoratriagem", "data_hora_triagem", "datahorainicio", "data_hora_inicio", "data_hora_entr") || 0
      ).getTime();

      return dataA - dataB;
    });

  /**
   * Calcula os minutos absolutos em espera decorridos com base no timestamp de disparo reativo do relógio.
   * @param {string|Date} dataInicio - Carimbo de data hora de entrada.
   * @returns {number|null} Minutos inteiros decorridos.
   */
  const calcularTempoDecorridoMin = (dataInicio) => {
    if (!dataInicio) return null;
    const inicioMs = new Date(dataInicio).getTime();
    if (Number.isNaN(inicioMs)) return null;
    const diff = Date.now() - inicioMs;
    const min  = Math.floor(diff / 60000);
    return min < 0 ? 0 : min;
  };

  return (
    <div className="doctor-panel-card">
      <div className="doctor-toolbar-row">
        <div className="doctor-menu-pills">
          <button
            type="button"
            className={`doctor-pill ${subMenuFila === "em_espera" ? "is-active" : ""}`}
            onClick={() => { setSubMenuFila("em_espera"); setEpisodioSelecionado(null); }}
          >
            {textos?.queue?.emEsperaPill || "Em espera"}
          </button>

          <button
            type="button"
            className={`doctor-pill ${subMenuFila === "atendimento" ? "is-active" : ""}`}
            onClick={() => setSubMenuFila("atendimento")}
          >
            {textos?.queue?.atendimentoPill || "Atendimento"}
          </button>
        </div>

        <input
          className="doctor-search-input"
          type="text"
          placeholder={textos?.queue?.pesquisarPlaceholder || "Utente, cor ou episódio..."}
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="doctor-table-shell">
        <table className="doctor-modern-table">
          <thead>
            <tr>
              <th>{textos?.queue?.episodioTh || "Episódio"}</th>
              <th>{textos?.queue?.utenteTh || "Utente"}</th>
              <th>{textos?.queue?.triagemTh || "Triagem"}</th>
              <th>{textos?.queue?.esperaTh || "Espera"}</th>
              <th>{textos?.queue?.acoesTh || "Ações"}</th>
            </tr>
          </thead>

          <tbody>
            {listaAtual.length === 0 ? (
              <tr>
                <td colSpan="5" className="doctor-table-empty">
                  {textos?.queue?.semEpisodios || "Sem episódios para apresentar."}
                </td>
              </tr>
            ) : (
              listaAtual.map((ep, index) => {
                const codEpisodio = readField(ep, "codepurgenc", "codEpisodio", "codepisodio", "cod_ep_urgenc");
                const nomeUtente  = readField(ep, "nomeutente", "nomeUtente", "nome_utente");
                const triagem     = triagensMap?.[String(codEpisodio)];

                const corTriagemRaw = getCorTriagemRaw(ep);
                const corTriagem    = corTriagemRaw
                  ? String(corTriagemRaw).charAt(0).toUpperCase() + String(corTriagemRaw).slice(1).toLowerCase()
                  : "";

                const tempoEsperaPrevisto =
                  readField(triagem, "tempoesperaprevisto", "tempo_espera_previsto", "tempoEsperaPrevisto") ||
                  readField(ep,      "tempoesperaprevisto", "tempo_espera_previsto", "tempoEsperaPrevisto");

                const dataInicioTriagem =
                  readField(triagem, "datahorainicio", "data_hora_inicio", "datahoratriagem", "data_hora_triagem") ||
                  readField(ep,      "datahorainicio", "data_hora_inicio", "datahoratriagem", "data_hora_triagem", "data_hora_entr");

                const tempoEsperaMostrar =
                  tempoEsperaPrevisto || calcularTempoDecorridoMin(dataInicioTriagem);

                return (
                  <tr key={codEpisodio || `ep-${index}`}>
                    <td>{codEpisodio || "—"}</td>
                    <td>{nomeUtente  || "—"}</td>
                    <td>
                      {corTriagem ? (
                        <span className={TRIAGECLASS?.[corTriagem] || "triage-badge"}>{corTriagem}</span>
                      ) : "—"}
                    </td>
                    <td>
                      {tempoEsperaMostrar !== null && tempoEsperaMostrar !== ""
                        ? `${tempoEsperaMostrar} min`
                        : "—"}
                    </td>
                    <td>
                      <div className="doctor-actions-inline">
                        <button
                          type="button"
                          className="doctor-action-btn doctor-action-btn--primary"
                          onClick={() => {
                            const updated = {
                              ...ep,
                              estado:       "emconsulta",
                              estadolocal:  "emconsulta",
                            };

                            setEpisodios((prev) =>
                              (prev || []).map((item) => {
                                const codItem = readField(item, "codepurgenc", "codEpisodio", "codepisodio", "cod_ep_urgenc");
                                return codItem === codEpisodio ? updated : item;
                              })
                            );

                            setEpisodioSelecionado(updated);
                            setSubMenuFila("atendimento");
                            abrirEpisodio(updated);
                          }}
                        >
                          {textos?.queue?.atenderBtn || "Atender"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
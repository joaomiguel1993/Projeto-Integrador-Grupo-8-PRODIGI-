import { useEffect, useState } from "react";

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
}) {
  const readField = (obj, ...keys) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== undefined && value !== null && value !== "") {
        return value;
      }
    }
    return "";
  };

  const [triagensMap, setTriagensMap] = useState({});

  useEffect(() => {
    const carregarTriagens = async () => {
      try {
        const res = await fetch("/api/v1/triagens/");
        if (!res.ok) throw new Error("Erro ao carregar triagens");

        const data = await res.json();

        const mapa = Object.fromEntries(
          (data || []).map((t) => [String(t.cod_ep_urgenc), t])
        );

        setTriagensMap(mapa);
      } catch (error) {
        console.error("Erro ao carregar triagens:", error);
      }
    };

    carregarTriagens();
  }, []);

  const TRIAGE_ORDER = {
    vermelho: 1,
    laranja: 2,
    amarelo: 3,
    verde: 4,
    azul: 5,
  };

  const listaBase = Array.isArray(episodiosOrdenados)
    ? episodiosOrdenados
    : Array.isArray(episodios)
      ? episodios
      : [];

  const textoFiltro = String(filtro || "").trim().toLowerCase();

  const getCorTriagemRaw = (ep) => {
    const codEpisodio = String(
      readField(
        ep,
        "codepurgenc",
        "codEpisodio",
        "codepisodio",
        "cod_ep_urgenc"
      ) || ""
    );

    const triagem = triagensMap?.[codEpisodio];

    return (
      triagem?.cortriagem ??
      triagem?.corTriagem ??
      triagem?.cor_triagem ??
      triagem?.prioridade ??
      triagem?.cor ??
      ep?.cortriagem ??
      ep?.corTriagem ??
      ep?.cor_triagem ??
      ep?.prioridade ??
      ep?.cor ??
      ""
    );
  };

  const listaAtual = [...listaBase]
    .filter((ep) => {
      const estadoBruto = String(
        readField(
          ep,
          "estado",
          "estadolocal",
          "estado_local",
          "estadoepisodio",
          "estado_episodio"
        ) || ""
      )
        .toLowerCase()
        .replaceAll("_", "");

      const nomeUtente = String(
        readField(ep, "nomeutente", "nomeUtente", "nome_utente") || ""
      ).toLowerCase();

      const codEpisodio = String(
        readField(
          ep,
          "codepurgenc",
          "codEpisodio",
          "codepisodio",
          "cod_ep_urgenc"
        ) || ""
      ).toLowerCase();

      const corTriagem = String(getCorTriagemRaw(ep) || "").toLowerCase();

      if (subMenuFila === "em_espera") {
        if (
          estadoBruto !== "ematendimento" &&
          estadoBruto !== "emespera" &&
          estadoBruto !== "espera"
        ) {
          return false;
        }
      }

      if (subMenuFila === "atendimento") {
        if (estadoBruto !== "emconsulta" && estadoBruto !== "atendimento") {
          return false;
        }
      }

      if (subMenuFila === "concluidos") {
        if (
          estadoBruto !== "concluido" &&
          estadoBruto !== "concluida" &&
          estadoBruto !== "alta"
        ) {
          return false;
        }
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

      if (ordemA !== ordemB) {
        return ordemA - ordemB;
      }

      const dataA = new Date(
        readField(
          a,
          "datahoratriagem",
          "data_hora_triagem",
          "datahorainicio",
          "data_hora_inicio",
          "data_hora_entr"
        ) || 0
      ).getTime();

      const dataB = new Date(
        readField(
          b,
          "datahoratriagem",
          "data_hora_triagem",
          "datahorainicio",
          "data_hora_inicio",
          "data_hora_entr"
        ) || 0
      ).getTime();

      return dataA - dataB;
    });

  const calcularTempoDecorridoMin = (dataInicio) => {
    if (!dataInicio) return null;

    const inicioMs = new Date(dataInicio).getTime();
    if (Number.isNaN(inicioMs)) return null;

    const agoraMs = Date.now();
    const diffMs = agoraMs - inicioMs;
    const minutos = Math.floor(diffMs / 60000);

    return minutos < 0 ? 0 : minutos;
  };

  return (
    <div className="doctor-panel-card">
      <div className="doctor-toolbar-row">
        <div className="doctor-menu-pills">
          <button
            type="button"
            className={`doctor-pill ${subMenuFila === "em_espera" ? "is-active" : ""}`}
            onClick={() => {
              setSubMenuFila("em_espera");
              setEpisodioSelecionado(null);
            }}
          >
            Em espera
          </button>

          <button
            type="button"
            className={`doctor-pill ${subMenuFila === "atendimento" ? "is-active" : ""}`}
            onClick={() => {
              setSubMenuFila("atendimento");
            }}
          >
            Atendimento
          </button>

          <button
            type="button"
            className={`doctor-pill ${subMenuFila === "concluidos" ? "is-active" : ""}`}
            onClick={() => {
              setSubMenuFila("concluidos");
              setEpisodioSelecionado(null);
            }}
          >
            Concluídos
          </button>
        </div>

        <input
          className="doctor-search-input"
          type="text"
          placeholder="Utente, cor ou episódio..."
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <div className="doctor-table-shell">
        <table className="doctor-modern-table">
          <thead>
            <tr>
              <th>Episódio</th>
              <th>Utente</th>
              <th>Triagem</th>
              <th>Espera</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {listaAtual.length === 0 ? (
              <tr>
                <td colSpan="5" className="doctor-table-empty">
                  Sem episódios para apresentar.
                </td>
              </tr>
            ) : (
              listaAtual.map((ep, index) => {
                const codEpisodio = readField(
                  ep,
                  "codepurgenc",
                  "codEpisodio",
                  "codepisodio",
                  "cod_ep_urgenc"
                );

                const nomeUtente = readField(
                  ep,
                  "nomeutente",
                  "nomeUtente",
                  "nome_utente"
                );

                const triagem = triagensMap?.[String(codEpisodio)];

                const corTriagemRaw = getCorTriagemRaw(ep);

                const corTriagem = corTriagemRaw
                  ? String(corTriagemRaw).charAt(0).toUpperCase() +
                  String(corTriagemRaw).slice(1).toLowerCase()
                  : "";

                const tempoEsperaPrevisto =
                  readField(
                    triagem,
                    "tempoesperaprevisto",
                    "tempo_espera_previsto",
                    "tempoEsperaPrevisto"
                  ) ||
                  readField(
                    ep,
                    "tempoesperaprevisto",
                    "tempo_espera_previsto",
                    "tempoEsperaPrevisto"
                  );

                const dataInicioTriagem =
                  readField(
                    triagem,
                    "datahorainicio",
                    "data_hora_inicio",
                    "datahoratriagem",
                    "data_hora_triagem"
                  ) ||
                  readField(
                    ep,
                    "datahorainicio",
                    "data_hora_inicio",
                    "datahoratriagem",
                    "data_hora_triagem",
                    "data_hora_entr"
                  );

                const tempoEsperaMostrar =
                  tempoEsperaPrevisto || calcularTempoDecorridoMin(dataInicioTriagem);

                if (index === 0) {
                  console.log("EPISODIO FILA JSON:", ep);
                  console.log("EPISODIO FILA STRING:", JSON.stringify(ep, null, 2));
                  console.log("TRIAGEM MAP MATCH:", triagem);
                  console.log("COR TRIAGEM RAW:", corTriagemRaw);
                  console.log("COR TRIAGEM FORMATADA:", corTriagem);
                }

                return (
                  <tr key={codEpisodio || `ep-${index}`}>
                    <td>{codEpisodio || "—"}</td>
                    <td>{nomeUtente || "—"}</td>
                    <td>
                      {corTriagem ? (
                        <span className={TRIAGECLASS?.[corTriagem] || "triage-badge"}>
                          {corTriagem}
                        </span>
                      ) : (
                        "—"
                      )}
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
                            const atualizado = {
                              ...ep,
                              estado: "emconsulta",
                              estadolocal: "emconsulta",
                            };

                            setEpisodios((prev) =>
                              (prev || []).map((item) => {
                                const codItem = readField(
                                  item,
                                  "codepurgenc",
                                  "codEpisodio",
                                  "codepisodio",
                                  "cod_ep_urgenc"
                                );

                                return codItem === codEpisodio ? atualizado : item;
                              })
                            );

                            setEpisodioSelecionado(atualizado);
                            setSubMenuFila("atendimento");
                            abrirEpisodio(atualizado);
                          }}
                        >
                          Atender
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
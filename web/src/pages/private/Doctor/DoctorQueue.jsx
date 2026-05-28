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

  const listaBase = Array.isArray(episodiosOrdenados)
    ? episodiosOrdenados
    : Array.isArray(episodios)
      ? episodios
      : [];

  const textoFiltro = String(filtro || "").trim().toLowerCase();

  const listaAtual = listaBase.filter((ep) => {
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

    const corTriagem = String(
      readField(
        ep,
        "cortriagem",
        "corTriagem",
        "cor_triagem",
        "prioridade",
        "cor"
      ) || ""
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

                const corTriagemRaw = readField(
                  ep,
                  "cortriagem",
                  "corTriagem",
                  "cor_triagem",
                  "prioridade",
                  "cor"
                );

                const corTriagem = corTriagemRaw
                  ? String(corTriagemRaw).charAt(0).toUpperCase() +
                  String(corTriagemRaw).slice(1).toLowerCase()
                  : "";

                const tempoEsperaPrevisto = readField(
                  ep,
                  "tempoesperaprevisto",
                  "tempo_espera_previsto",
                  "tempoEsperaPrevisto"
                );

                const dataInicioTriagem = readField(
                  ep,
                  "datahorainicio",
                  "data_hora_inicio",
                  "datahoratriagem",
                  "data_hora_triagem"
                );

                const tempoEsperaMostrar =
                  tempoEsperaPrevisto || calcularTempoDecorridoMin(dataInicioTriagem);

                if (index === 0) {
                  console.log("EPISODIO FILA JSON:", JSON.stringify(ep, null, 2));
                  console.log(
                    "CHAVES EPISODIO JSON:",
                    JSON.stringify(Object.keys(ep || {}), null, 2)
                  );
                  console.log(
                    "COR CANDIDATOS JSON:",
                    JSON.stringify(
                      {
                        cortriagem: ep?.cortriagem,
                        corTriagem: ep?.corTriagem,
                        cor_triagem: ep?.cor_triagem,
                        prioridade: ep?.prioridade,
                        cor: ep?.cor,
                      },
                      null,
                      2
                    )
                  );
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
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
      readField(ep, "estado", "estadolocal", "estado_local", "estadoepisodio", "estado_episodio") || ""
    )
      .toLowerCase()
      .replaceAll("_", "");

    const nomeUtente = String(
      readField(ep, "nomeutente", "nomeUtente", "nome_utente") || ""
    ).toLowerCase();

    const corTriagem = String(
      readField(ep, "cortriagem", "corTriagem", "cor_triagem") || ""
    ).toLowerCase();

    const codEpisodio = String(
      readField(ep, "codepurgenc", "codEpisodio", "codepisodio", "cod_ep_urgenc") || ""
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

                const corTriagem = readField(
                  ep,
                  "cortriagem",
                  "corTriagem",
                  "cor_triagem"
                );

                const tempoEspera = readField(
                  ep,
                  "tempoesperaprevisto",
                  "tempo_espera_previsto",
                  "tempoEsperaPrevisto"
                );

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
                    <td>{tempoEspera ? `${tempoEspera} min` : "—"}</td>
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
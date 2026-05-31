const renderTabVitais = () => {
  const { textos } = useLanguage();

  const readTriagem = (...keys) => {
    for (const key of keys) {
      const value = dadosTriagem?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "—";
  };

  const campos = [
    [textos?.vitais?.corTriagemLabel || "Cor de Triagem", "cortriagem", "select", ["Vermelho", "Laranja", "Amarelo", "Verde", "Azul"]],
    [textos?.vitais?.tempoEsperaLabel || "Tempo de Espera (min)", "tempoesperaprevisto", "number"],
    [textos?.vitais?.temperaturaLabel || "Temperatura (°C)", "temperatura", "number"],
    [textos?.vitais?.freqCardiacaLabel || "Freq. Cardíaca (bpm)", "freqcard", "number"],
    [textos?.vitais?.freqRespiratoriaLabel || "Freq. Respiratória (rpm)", "freqresp", "number"],
    [textos?.vitais?.spo2Label || "SpO2 (%)", "spo2", "number"],
    [textos?.vitais?.conscienciaLabel || "Consciência", "consciencia", "select", ["Acordado", "Confuso", "Inconsciente"]],
  ];

  return (
    <div className="doctor-stacked-sections">
      <section className="doctor-subcard">
        <div className="doctor-tab-topbar">
          <SectionHeader
            title={textos?.vitais?.dadosVitaisTitle || "Dados vitais da triagem"}
            subtitle={textos?.vitais?.registosClinicosSubtitle || "Registos clínicos iniciais e parâmetros observados"}
          />

          {!modoEdicaoTriagem ? (
            <button
              type="button"
              className="doctor-action-btn doctor-action-btn--secondary"
              onClick={() => {
                setFormTriagem({
                  cortriagem: readTriagem("cortriagem", "cor_triagem") === "—" ? "" : readTriagem("cortriagem", "cor_triagem"),
                  tempoesperaprevisto: readTriagem("tempoesperaprevisto", "tempo_espera_previsto") === "—" ? "" : readTriagem("tempoesperaprevisto", "tempo_espera_previsto"),
                  temperatura: readTriagem("temperatura") === "—" ? "" : readTriagem("temperatura"),
                  freqcard: readTriagem("freqcard", "freq_card") === "—" ? "" : readTriagem("freqcard", "freq_card"),
                  freqresp: readTriagem("freqresp", "freq_resp") === "—" ? "" : readTriagem("freqresp", "freq_resp"),
                  spo2: readTriagem("spo2", "sp_o2") === "—" ? "" : readTriagem("spo2", "sp_o2"),
                  sistolica: readTriagem("sistolica") === "—" ? "" : readTriagem("sistolica"),
                  diastolica: readTriagem("diastolica") === "—" ? "" : readTriagem("diastolica"),
                  niveldor: readTriagem("niveldor", "nivel_dor") === "—" ? "" : String(readTriagem("niveldor", "nivel_dor")),
                  consciencia: readTriagem("consciencia") === "—" ? "" : readTriagem("consciencia"),
                  sintomas: readTriagem("sintomas") === "—" ? "" : readTriagem("sintomas"),
                  nomeenfermeiro: readTriagem("nomeenfermeiro", "nome_enfermeiro") === "—" ? "" : readTriagem("nomeenfermeiro", "nome_enfermeiro"),
                });
                setModoEdicaoTriagem(true);
              }}
            >
              {textos?.vitais?.editarDadosBtn || "Editar dados"}
            </button>
          ) : (
            <div className="doctor-actions-inline">
              <button
                type="button"
                className="doctor-action-btn doctor-action-btn--secondary"
                onClick={() => setModoEdicaoTriagem(false)}
              >
                {textos?.vitais?.cancelarBtn || "Cancelar"}
              </button>
              <button
                type="button"
                className="doctor-action-btn doctor-action-btn--primary"
                onClick={guardarEdicaoTriagem}
              >
                {textos?.vitais?.guardarBtn || "Guardar"}
              </button>
            </div>
          )}
        </div>

        <div className="doctor-vitals-grid">
          {campos.map(([label, campo, tipo, opts]) => (
            <div key={campo} className="doctor-info-card">
              <span className="doctor-info-card__label">{label}</span>

              {modoEdicaoTriagem ? (
                tipo === "select" ? (
                  <select
                    className="doctor-field"
                    value={formTriagem[campo] ?? ""}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({
                        ...prev,
                        [campo]: e.target.value,
                      }))
                    }
                  >
                    {opts.map((o, index) => (
                      <option key={`${campo}-${index}-${o}`} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="doctor-field"
                    type={tipo}
                    value={formTriagem[campo] ?? ""}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({
                        ...prev,
                        [campo]: e.target.value,
                      }))
                    }
                  />
                )
              ) : (
                <span className="doctor-info-card__value">
                  {campo === "cortriagem" && readTriagem("cortriagem", "cor_triagem")}
                  {campo === "tempoesperaprevisto" &&
                    (readTriagem("tempoesperaprevisto", "tempo_espera_previsto") !== "—"
                      ? `${readTriagem("tempoesperaprevisto", "tempo_espera_previsto")} min`
                      : "—")}
                  {campo === "freqcard" && readTriagem("freqcard", "freq_card")}
                  {campo === "freqresp" && readTriagem("freqresp", "freq_resp")}
                  {campo === "spo2" && readTriagem("spo2", "sp_o2")}
                  {!["cortriagem", "tempoesperaprevisto", "freqcard", "freqresp", "spo2"].includes(campo) &&
                    readTriagem(campo)}
                </span>
              )}
            </div>
          ))}

          <div className="doctor-info-card">
            <span className="doctor-info-card__label">
              {textos?.vitais?.tensaoArterialLabel || "Tensão Arterial"}
            </span>

            {modoEdicaoTriagem ? (
              <div className="doctor-bp-grid">
                <input
                  className="doctor-field"
                  type="number"
                  value={formTriagem.sistolica ?? ""}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({ ...prev, sistolica: e.target.value }))
                  }
                />
                <input
                  className="doctor-field"
                  type="number"
                  value={formTriagem.diastolica ?? ""}
                  onChange={(e) =>
                    setFormTriagem((prev) => ({ ...prev, diastolica: e.target.value }))
                  }
                />
              </div>
            ) : (
              <span className="doctor-info-card__value">
                {dadosTriagem?.sistolica ?? "—"} / {dadosTriagem?.diastolica ?? "—"} mmHg
              </span>
            )}
          </div>

          <div className="doctor-info-card">
            <span className="doctor-info-card__label">
              {textos?.vitais?.nivelDorLabel || "Nível de Dor"}
            </span>

            {modoEdicaoTriagem ? (
              <input
                className="doctor-field"
                type="text"
                inputMode="numeric"
                value={formTriagem.niveldor ?? ""}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                  if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
                    setFormTriagem((prev) => ({
                      ...prev,
                      niveldor: value,
                    }));
                  }
                }}
              />
            ) : (
              <span className="doctor-info-card__value">
                {readTriagem("niveldor", "nivel_dor") !== "—"
                  ? `${readTriagem("niveldor", "nivel_dor")} /10`
                  : "—"}
              </span>
            )}
          </div>

          <div className="doctor-info-card">
            <span className="doctor-info-card__label">
              {textos?.vitais?.sintomasLabel || "Sintomas"}
            </span>
            {modoEdicaoTriagem ? (
              <input
                className="doctor-field"
                type="text"
                value={formTriagem.sintomas ?? ""}
                onChange={(e) =>
                  setFormTriagem((prev) => ({ ...prev, sintomas: e.target.value }))
                }
              />
            ) : (
              <span className="doctor-info-card__value">{dadosTriagem?.sintomas || "—"}</span>
            )}
          </div>

          <div className="doctor-info-card">
            <span className="doctor-info-card__label">
              {textos?.vitais?.enfermeiroLabel || "Enfermeiro"}
            </span>
            {modoEdicaoTriagem ? (
              <input
                className="doctor-field"
                type="text"
                value={formTriagem.nomeenfermeiro ?? ""}
                onChange={(e) =>
                  setFormTriagem((prev) => ({ ...prev, nomeenfermeiro: e.target.value }))
                }
              />
            ) : (
              <span className="doctor-info-card__value">
                {dadosTriagem?.nomeenfermeiro || dadosTriagem?.nome_enfermeiro || "—"}
              </span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
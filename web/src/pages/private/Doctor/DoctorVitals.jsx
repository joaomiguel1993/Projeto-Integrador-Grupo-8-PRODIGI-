const renderTabVitais = () => {
    const campos = [
      ['Cor de Triagem', 'cortriagem', 'select', ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul']],
      ['Temperatura (°C)', 'temperatura', 'number'],
      ['Freq. Cardíaca (bpm)', 'freqcard', 'number'],
      ['Freq. Respiratória (rpm)', 'freqresp', 'number'],
      ['SpO2 (%)', 'spo2', 'number'],
      ['Nível de Dor', 'niveldor', 'number'],
      ['Consciência', 'consciencia', 'select', ['Acordado', 'Confuso', 'Inconsciente']],
    ];

    return (
      <div className="doctor-stacked-sections">
        <section className="doctor-subcard">
          <div className="doctor-tab-topbar">
            <SectionHeader
              title="Dados vitais da triagem"
              subtitle="Registos clínicos iniciais e parâmetros observados"
            />

            {!modoEdicaoTriagem ? (
              <button
                type="button"
                className="doctor-action-btn doctor-action-btn--secondary"
                onClick={() => setModoEdicaoTriagem(true)}
              >
                Editar dados
              </button>
            ) : (
              <div className="doctor-actions-inline">
                <button
                  type="button"
                  className="doctor-action-btn doctor-action-btn--secondary"
                  onClick={() => setModoEdicaoTriagem(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="doctor-action-btn doctor-action-btn--primary"
                  onClick={guardarEdicaoTriagem}
                >
                  Guardar
                </button>
              </div>
            )}
          </div>

          <div className="doctor-vitals-grid">
            {campos.map(([label, campo, tipo, opts]) => (
              <div key={campo} className="doctor-info-card">
                <span className="doctor-info-card__label">{label}</span>

                {modoEdicaoTriagem ? (
                  tipo === 'select' ? (
                    <select
                      className="doctor-field"
                      value={formTriagem[campo]}
                      onChange={(e) =>
                        setFormTriagem((prev) => ({ ...prev, [campo]: e.target.value }))
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
                      value={formTriagem[campo]}
                      onChange={(e) =>
                        setFormTriagem((prev) => ({ ...prev, [campo]: e.target.value }))
                      }
                    />
                  )
                ) : (
                  <span className="doctor-info-card__value">
                    {dadosTriagem?.[campo] ?? '—'}
                  </span>
                )}
              </div>
            ))}

            <div className="doctor-info-card">
              <span className="doctor-info-card__label">Tensão Arterial</span>

              {modoEdicaoTriagem ? (
                <div className="doctor-bp-grid">
                  <input
                    className="doctor-field"
                    type="number"
                    placeholder="Sistólica"
                    value={formTriagem.sistolica}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({ ...prev, sistolica: e.target.value }))
                    }
                  />
                  <input
                    className="doctor-field"
                    type="number"
                    placeholder="Diastólica"
                    value={formTriagem.diastolica}
                    onChange={(e) =>
                      setFormTriagem((prev) => ({ ...prev, diastolica: e.target.value }))
                    }
                  />
                </div>
              ) : (
                <span className="doctor-info-card__value">
                  {dadosTriagem?.sistolica ?? '—'} / {dadosTriagem?.diastolica ?? '—'} mmHg
                </span>
              )}
            </div>

            <div className="doctor-info-card">
              <span className="doctor-info-card__label">Sintomas</span>
              <span className="doctor-info-card__value">{dadosTriagem?.sintomas || '—'}</span>
            </div>

            <div className="doctor-info-card">
              <span className="doctor-info-card__label">Enfermeiro</span>
              <span className="doctor-info-card__value">
                {dadosTriagem?.nomeenfermeiro || '—'}
              </span>
            </div>
          </div>
        </section>

        <section className="doctor-subcard">
          <SectionHeader
            title="Antecedentes"
            subtitle="Histórico pessoal e clínico relevante do utente"
          />

          {antecedentes && Object.keys(antecedentes).length > 0 ? (
            <div className="doctor-vitals-grid">
              {Object.entries(antecedentes).map(([k, v]) => (
                <div key={k} className="doctor-info-card">
                  <span className="doctor-info-card__label">
                    {k.replaceAll('_', ' ')}
                  </span>
                  <span className="doctor-info-card__value">
                    {Array.isArray(v) ? v.join(', ') : String(v)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="doctor-empty-box">Sem antecedentes registados.</div>
          )}
        </section>

        <section className="doctor-subcard">
          <SectionHeader
            title="Histórico clínico"
            subtitle="Atos clínicos registados neste episódio"
          />

          <div className="doctor-table-shell">
            <table className="doctor-modern-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Início</th>
                  <th>Fim</th>
                </tr>
              </thead>
              <tbody>
                {atos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="doctor-table-empty">
                      Sem atos clínicos registados para este episódio.
                    </td>
                  </tr>
                ) : (
                  atos.map((a) => (
                    <tr key={a.idato || a.id_ato}>
                      <td>{a.idato || a.id_ato}</td>
                      <td>{a.tipo || '—'}</td>
                      <td>{a.descricao || '—'}</td>
                      <td>
                        {a.datahorainicio
                          ? new Date(a.datahorainicio).toLocaleString('pt-PT')
                          : '—'}
                      </td>
                      <td>
                        {a.datahorafim
                          ? new Date(a.datahorafim).toLocaleString('pt-PT')
                          : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  };
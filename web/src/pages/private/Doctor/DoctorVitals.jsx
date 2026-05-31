/**
 * Gera e renderiza a sub-aba de Sinais Vitais, Histórico e Dados Demográficos do Utente.
 * Mapeia dinamicamente formulários de edição e grades de dados tabulares.
 * * @function renderTabVitais
 * @returns {JSX.Element} Painel estruturado com dados vitais, antecedentes e medicação ativa.
 */
const renderTabVitais = () => {
  const { textos } = useLanguage();

  /**
   * Varre sequencialmente chaves no objeto de triagem até obter um valor válido não vazio.
   * @param {...string} keys - Chaves prioritárias de busca.
   * @returns {string} Valor resolvido ou traço identificador nulo.
   */
  const readTriagem = (...keys) => {
    for (const key of keys) {
      const value = dadosTriagem?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "—";
  };

  /** @constant {Array[]} campos - Configuração matricial de metadados para renderização de campos reativos */
  const campos = [
    [textos?.vitais?.corTriagemLabel || 'Cor de Triagem',          'cortriagem',          'select', ['Vermelho', 'Laranja', 'Amarelo', 'Verde', 'Azul']],
    [textos?.vitais?.tempoEsperaLabel || 'Tempo de Espera (min)',    'tempoesperaprevisto', 'number'],
    [textos?.vitais?.temperaturaLabel || 'Temperatura (°C)',         'temperatura',         'number'],
    [textos?.vitais?.freqCardiacaLabel || 'Freq. Cardíaca (bpm)',     'freqcard',            'number'],
    [textos?.vitais?.freqRespiratoriaLabel || 'Freq. Respiratória (rpm)', 'freqresp',            'number'],
    [textos?.vitais?.spo2Label || 'SpO2 (%)',                 'spo2',                'number'],
    [textos?.vitais?.nivelDorLabel || 'Nível de Dor',             'niveldor',            'number'],
    [textos?.vitais?.conscienciaLabel || 'Consciência',              'consciencia',         'select', ['Acordado', 'Confuso', 'Inconsciente']],
  ];

  return (
    <div className="doctor-stacked-sections">
      {/* ── SECÇÃO: TRIAGEM & SINAIS VITAIS ── */}
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
                  cortriagem:          readTriagem('cortriagem', 'cor_triagem')                    === '—' ? '' : readTriagem('cortriagem', 'cor_triagem'),
                  tempoesperaprevisto: readTriagem('tempoesperaprevisto', 'tempo_espera_previsto') === '—' ? '' : readTriagem('tempoesperaprevisto', 'tempo_espera_previsto'),
                  temperatura:         readTriagem('temperatura')                                  === '—' ? '' : readTriagem('temperatura'),
                  freqcard:            readTriagem('freqcard', 'freq_card')                        === '—' ? '' : readTriagem('freqcard', 'freq_card'),
                  freqresp:            readTriagem('freqresp', 'freq_resp')                        === '—' ? '' : readTriagem('freqresp', 'freq_resp'),
                  spo2:                readTriagem('spo2', 'sp_o2')                                === '—' ? '' : readTriagem('spo2', 'sp_o2'),
                  sistolica:           readTriagem('sistolica')                                    === '—' ? '' : readTriagem('sistolica'),
                  diastolica:          readTriagem('diastolica')                                   === '—' ? '' : readTriagem('diastolica'),
                  niveldor:            readTriagem('niveldor', 'nivel_dor')                        === '—' ? '' : readTriagem('niveldor', 'nivel_dor'),
                  consciencia:         readTriagem('consciencia')                                  === '—' ? '' : readTriagem('consciencia'),
                  sintomas:            readTriagem('sintomas')                                     === '—' ? '' : readTriagem('sintomas'),
                  nomeenfermeiro:      readTriagem('nomeenfermeiro', 'nome_enfermeiro')             === '—' ? '' : readTriagem('nomeenfermeiro', 'nome_enfermeiro'),
                });
                setModoEdicaoTriagem(true);
              }}
            >
              {textos?.vitais?.editarDadosBtn || "Editar dados"}
            </button>
          ) : (
            <div className="doctor-actions-inline">
              <button type="button" className="doctor-action-btn doctor-action-btn--secondary" onClick={() => setModoEdicaoTriagem(false)}>{textos?.vitais?.cancelarBtn || "Cancelar"}</button>
              <button type="button" className="doctor-action-btn doctor-action-btn--primary"   onClick={guardarEdicaoTriagem}>{textos?.vitais?.guardarBtn || "Guardar"}</button>
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
                    onChange={(e) => setFormTriagem((prev) => ({ ...prev, [campo]: e.target.value }))}
                  >
                    {opts.map((o, index) => (
                      <option key={`${campo}-${index}-${o}`} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="doctor-field"
                    type={tipo}
                    value={formTriagem[campo]}
                    onChange={(e) => setFormTriagem((prev) => ({ ...prev, [campo]: e.target.value }))}
                  />
                )
              ) : (
                <span className="doctor-info-card__value">
                  {campo === 'cortriagem'          && readTriagem('cortriagem', 'cor_triagem')}
                  {campo === 'tempoesperaprevisto'  && (
                    readTriagem('tempoesperaprevisto', 'tempo_espera_previsto') !== '—'
                      ? `${readTriagem('tempoesperaprevisto', 'tempo_espera_previsto')} min`
                      : '—'
                  )}
                  {campo === 'freqcard'  && readTriagem('freqcard', 'freq_card')}
                  {campo === 'freqresp'  && readTriagem('freqresp', 'freq_resp')}
                  {campo === 'spo2'      && readTriagem('spo2', 'sp_o2')}
                  {campo === 'niveldor'  && readTriagem('niveldor', 'nivel_dor')}
                  {!['cortriagem','tempoesperaprevisto','freqcard','freqresp','spo2','niveldor'].includes(campo) && readTriagem(campo)}
                </span>
              )}
            </div>
          ))}

          {/* TENSÃO ARTERIAL (CAMPO COMPOSTO) */}
          <div className="doctor-info-card">
            <span className="doctor-info-card__label">{textos?.vitais?.tensaoArterialLabel || "Tensão Arterial"}</span>
            {modoEdicaoTriagem ? (
              <div className="doctor-bp-grid">
                <input
                  className="doctor-field" type="number" placeholder="Sistólica"
                  value={formTriagem.sistolica}
                  onChange={(e) => setFormTriagem((prev) => ({ ...prev, sistolica: e.target.value }))}
                />
                <input
                  className="doctor-field" type="number" placeholder="Diastólica"
                  value={formTriagem.diastolica}
                  onChange={(e) => setFormTriagem((prev) => ({ ...prev, diastolica: e.target.value }))}
                />
              </div>
            ) : (
              <span className="doctor-info-card__value">
                {dadosTriagem?.sistolica ?? '—'} / {dadosTriagem?.diastolica ?? '—'} mmHg
              </span>
            )}
          </div>

          <div className="doctor-info-card">
            <span className="doctor-info-card__label">{textos?.vitais?.sintomasLabel || "Sintomas"}</span>
            <span className="doctor-info-card__value">{dadosTriagem?.sintomas || '—'}</span>
          </div>

          <div className="doctor-info-card">
            <span className="doctor-info-card__label">{textos?.vitais?.enfermeiroLabel || "Enfermeiro"}</span>
            <span className="doctor-info-card__value">{dadosTriagem?.nomeenfermeiro || dadosTriagem?.nome_enfermeiro || '—'}</span>
          </div>
        </div>
      </section>

      {/* ── SECÇÃO: DADOS DEMOGRÁFICOS DO UTENTE ── */}
      <section className="doctor-subcard">
        <SectionHeader title={textos?.vitais?.dadosUtenteTitle || "Dados do Utente"} subtitle={textos?.vitais?.infoPrincipalSubtitle || "Informação principal do utente"} />
        <div className="doctor-vitals-grid">
          <div className="doctor-info-card"><span className="doctor-info-card__label">{textos?.vitais?.nomeLabel || "Nome"}</span>            <span className="doctor-info-card__value">{utente?.nome || '—'}</span></div>
          <div className="doctor-info-card"><span className="doctor-info-card__label">{textos?.vitais?.numUtenteLabel || "Nº Utente"}</span>       <span className="doctor-info-card__value">{utente?.num_utente || utente?.num_utent || '—'}</span></div>
          <div className="doctor-info-card"><span className="doctor-info-card__label">{textos?.vitais?.nifLabel || "NIF"}</span>             <span className="doctor-info-card__value">{utente?.nif || '—'}</span></div>
          <div className="doctor-info-card"><span className="doctor-info-card__label">{textos?.vitais?.sexoLabel || "Sexo"}</span>            <span className="doctor-info-card__value">{utente?.sexo || '—'}</span></div>
          <div className="doctor-info-card"><span className="doctor-info-card__label">{textos?.vitais?.dataNascLabel || "Data Nascimento"}</span> <span className="doctor-info-card__value">{utente?.datanascimento || utente?.data_nasc || '—'}</span></div>
          <div className="doctor-info-card"><span className="doctor-info-card__label">{textos?.vitais?.contactoLabel || "Contacto"}</span>        <span className="doctor-info-card__value">{utente?.telefone || '—'}</span></div>
        </div>
      </section>

      {/* ── SECÇÃO: ANTECEDENTES RELEVANTES ── */}
      <section className="doctor-subcard">
        <SectionHeader title={textos?.vitais?.antecedentesTitle || "Antecedentes"} subtitle={textos?.vitais?.historicoPessoalSubtitle || "Histórico pessoal e clínico relevante do utente"} />
        {antecedentes && Object.keys(antecedentes).length > 0 ? (
          <div className="doctor-vitals-grid">
            {Object.entries(antecedentes).map(([k, v]) => (
              <div key={k} className="doctor-info-card">
                <span className="doctor-info-card__label">{k.replaceAll('_', ' ')}</span>
                <span className="doctor-info-card__value">{Array.isArray(v) ? v.join(', ') : String(v)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="doctor-empty-box">{textos?.vitais?.semAntecedentes || "Sem antecedentes registados."}</div>
        )}
      </section>

      {/* ── SECÇÃO: MEDICAÇÃO ATIVA DO UTENTE ── */}
      <section className="doctor-subcard">
        <SectionHeader title={textos?.vitais?.medicaoAtivaTitle || "Medicação Ativa"} subtitle={textos?.vitais?.medicaoRegistadaSubtitle || "Medicação atualmente registada para o utente"} />
        <div className="doctor-table-shell">
          <table className="doctor-modern-table">
            <thead>
              <tr>
                <th>{textos?.vitais?.medicamentoTh || "Medicamento"}</th>
                <th>{textos?.vitais?.dosagemTh || "Dosagem"}</th>
                <th>{textos?.vitais?.frequenciaTh || "Frequência"}</th>
                <th>{textos?.vitais?.inicioTh || "Início"}</th>
              </tr>
            </thead>
            <tbody>
              {medicacaoAtiva.length === 0 ? (
                <tr><td colSpan="4" className="doctor-table-empty">{textos?.vitais?.semMedicaoAtiva || "Sem medicação ativa registada."}</td></tr>
              ) : (
                medicacaoAtiva.map((m, index) => (
                  <tr key={m.cod_medicacao_ativa || `med-vit-${index}`}>
                    <td>{m.nome_medicamento || m.nomemedicamento || m.nomeApresentacao || '—'}</td>
                    <td>{m.dosagem    || '—'}</td>
                    <td>{m.frequencia || '—'}</td>
                    <td>{m.data_inicio ? new Date(m.data_inicio).toLocaleDateString('pt-PT') : '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── SECÇÃO: ATOS CLÍNICOS DO EPISÓDIO ── */}
      <section className="doctor-subcard">
        <SectionHeader title={textos?.vitais?.historicoClinicoTitle || "Histórico clínico"} subtitle={textos?.vitais?.atosClinicosSubtitle || "Atos clínicos registados neste episódio"} />
        <div className="doctor-table-shell">
          <table className="doctor-modern-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{textos?.vitais?.tipoTh || "Tipo"}</th>
                <th>{textos?.vitais?.descricaoTh || "Descrição"}</th>
                <th>{textos?.vitais?.inicioTh || "Início"}</th>
                <th>{textos?.vitais?.fimTh || "Fim"}</th>
              </tr>
            </thead>
            <tbody>
              {atos.length === 0 ? (
                <tr><td colSpan="5" className="doctor-table-empty">{textos?.vitais?.semAtosRegistados || "Sem atos clínicos registados para este episódio."}</td></tr>
              ) : (
                atos.map((a) => (
                  <tr key={a.idato || a.id_ato}>
                    <td>{a.idato || a.id_ato}</td>
                    <td>{a.tipo || '—'}</td>
                    <td>{a.descricao || '—'}</td>
                    <td>{a.datahorainicio ? new Date(a.datahorainicio).toLocaleString('pt-PT') : '—'}</td>
                    <td>{a.datahorafim   ? new Date(a.datahorafim).toLocaleString('pt-PT')   : '—'}</td>
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
// ============================================================
// DoctorPrescription.jsx
// Correções aplicadas:
//   - Removido botão e prop imprimirPrescricao
// ============================================================

export default function DoctorPrescription({
  medicacaoAtiva,
  enriquecerMedicacaoAtiva,
  SectionHeader,
  alertas,
  medicamentos,
  getMedicamentoId,
  getMedicamentoNome,
  prescricao,
  handlePrescricaoChange,
  alergias,
  riscoIA,
  avaliacaoRisco,
  avaliarRiscoIAFn,
  submeterPrescricao,
}) {
  const medicacaoAtivaEnriquecida = enriquecerMedicacaoAtiva(medicacaoAtiva);

  return (
    <div className="doctor-stacked-sections">
      <section className="doctor-subcard">
        <SectionHeader
          title="Medicação ativa"
          subtitle="Terapêutica habitual e medicação atualmente registada"
        />

        {medicacaoAtivaEnriquecida.length === 0 ? (
          <div className="doctor-empty-box">Nenhum medicamento ativo associado.</div>
        ) : (
          <div className="doctor-alert-list">
            {medicacaoAtivaEnriquecida.map((m, i) => (
              <div key={`med-ativa-${i}`} className="doctor-med-item">
                <strong>{m.nomeApresentacao || `Medicamento ${i + 1}`}</strong>
                <span>
                  {m?.dosagem ? `Dosagem: ${m.dosagem}` : 'Sem dosagem registada'}
                  {m?.observacoes ? ` · ${m.observacoes}` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="doctor-subcard">
        <SectionHeader
          title="Alertas"
          subtitle="Atenção clínica, alergias e observações críticas"
        />

        {alertas.length === 0 ? (
          <div className="doctor-empty-box">Sem alertas críticos registados.</div>
        ) : (
          <div className="doctor-alert-list">
            {alertas.map((a, i) => (
              <div key={i} className="doctor-alert-item">
                {a.descricao || a.mensagem || a.alerta}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="doctor-subcard">
        <SectionHeader
          title="Prescrever medicação"
          subtitle="Selecionar fármaco, validar risco e emitir prescrição"
        />

        <div className="doctor-form-grid">
          <div>
            <label>Medicamento</label>
            <select
              className="doctor-field"
              name="codmedicamento"
              value={prescricao.codmedicamento || ''}
              onChange={handlePrescricaoChange}
            >
              <option value="">Selecione...</option>

              {Array.isArray(medicamentos) &&
                medicamentos.map((m, index) => {
                  const medId      = getMedicamentoId(m, index);
                  const medNome    = getMedicamentoNome(m, index);
                  return (
                    <option key={`med-${medId}-${index}`} value={medId}>
                      {medNome}
                    </option>
                  );
                })}
            </select>

            {Array.isArray(medicamentos) && medicamentos.length === 0 && (
              <div className="doctor-empty-box" style={{ marginTop: '0.5rem' }}>
                Catálogo de medicamentos vazio.
              </div>
            )}
          </div>

          <div>
            <label>Dosagem</label>
            <input
              className="doctor-field"
              type="text"
              name="dosagem"
              value={prescricao.dosagem || ''}
              onChange={handlePrescricaoChange}
            />
          </div>

          <div className="doctor-form-grid-full">
            <label>Observações</label>
            <input
              className="doctor-field"
              type="text"
              name="observacoes"
              value={prescricao.observacoes || ''}
              onChange={handlePrescricaoChange}
            />
          </div>
        </div>

        {alergias.length > 0 ? (
          <div className="doctor-risk-box">
            {riscoIA ? (
              <div
                className={`doctor-risk-result ${
                  riscoIA?.risco === 1 || riscoIA?.riscoalto ? 'is-danger' : 'is-safe'
                }`}
                style={{ marginBottom: '0.75rem' }}
              >
                <strong>
                  {riscoIA?.risco === 1 || riscoIA?.riscoalto
                    ? 'Utente com risco/alergia para a medicação selecionada'
                    : 'Sem alergia conhecida para a medicação selecionada'}
                </strong>
                <span>{riscoIA?.mensagem || riscoIA?.explicacao || 'Avaliação concluída.'}</span>
              </div>
            ) : null}

            <button
              type="button"
              className="doctor-action-btn doctor-action-btn--secondary"
              onClick={avaliarRiscoIAFn}
              disabled={avaliacaoRisco || !prescricao.codmedicamento}
            >
              {avaliacaoRisco ? 'A avaliar...' : 'Ajuda IA: avaliar alergias e risco'}
            </button>
          </div>
        ) : (
          <div className="doctor-empty-box">
            O utente não tem alergias registadas para validação automática.
          </div>
        )}

        <div className="doctor-actions-inline" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="doctor-action-btn doctor-action-btn--primary"
            onClick={submeterPrescricao}
            disabled={!prescricao.codmedicamento || !prescricao.dosagem}
          >
            Registar prescrição
          </button>
        </div>
      </section>
    </div>
  );
}
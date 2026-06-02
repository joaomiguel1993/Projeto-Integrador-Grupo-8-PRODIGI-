import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * Componente de Prescrição Médica (DoctorPrescription).
 * Renderiza o histórico de medicação ativa, os antecedentes clínicos gerais e o formulário de emissão
 * de novas receitas com suporte a análise preditiva de risco por IA e internacionalização.
 * * @component
 * @param {Object} props - Propriedades do componente.
 * @param {Array} props.medicacaoAtiva - Lista bruta das medicações atuais do utente.
 * @param {function} props.enriquecerMedicacaoAtiva - Função utilitária para acoplar designações comerciais à medicação.
 * @param {React.Component} props.SectionHeader - Componente reutilizável para renderização de cabeçalhos de bloco.
 * @param {Array|Object} props.antecedentes - Lista ou dicionário contendo o histórico patológico do utente.
 * @param {Array} props.medicamentos - Catálogo geral de fármacos disponíveis no sistema.
 * @param {function} props.getMedicamentoId - Callback para extração segura da chave ID do medicamento.
 * @param {function} props.getMedicamentoNome - Callback para resolução da designação legível do medicamento.
 * @param {Object} props.prescricao - Estado do formulário de nova prescrição clínica.
 * @param {function} props.handlePrescricaoChange - Manipulador de eventos para alterações nos campos de entrada.
 * @param {Array} props.alergias - Array contendo o registo de hipersensibilidades do utente.
 * @param {Object|null} props.riscoIA - Estado contendo o veredito retornado pelo microsserviço de inteligência artificial.
 * @param {boolean} props.avaliacaoRisco - Flag indicadora de carregamento assíncrono da inferência de IA.
 * @param {function} props.avaliarRiscoIAFn - Callback acionador da análise preditiva de risco farmacológico.
 * @param {function} props.submeterPrescricao - Callback persistente para gravação do novo registo de receita.
 * @param {function} props.onEliminarMedicacao - Callback para revogação/eliminação de itens da medicação ativa.
 */
export default function DoctorPrescription({
  medicacaoAtiva,
  enriquecerMedicacaoAtiva,
  SectionHeader,
  antecedentes,
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
  onEliminarMedicacao,
}) {
  const { textos } = useLanguage();
  
  /** @type {Array} medicacaoAtivaEnriquecida - Medicação do utente acoplada com chaves de exibição do catálogo */
  const medicacaoAtivaEnriquecida = enriquecerMedicacaoAtiva(medicacaoAtiva);

  return (
    <div className="doctor-stacked-sections">
      {/* SECÇÃO: MEDICAÇÃO ATIVA */}
      <section className="doctor-subcard">
        <SectionHeader
          title={textos?.prescription?.medicaoAtivaTitle || "Medicação ativa"}
          subtitle={textos?.prescription?.medicaoAtivaSubtitle || "Terapêutica habitual e medicação atualmente registada"}
        />

        {medicacaoAtivaEnriquecida.length === 0 ? (
          <div className="doctor-empty-box">{textos?.prescription?.nenhumMedicamentoAtivo || "Nenhum medicamento ativo associado."}</div>
        ) : (
          <div className="doctor-alert-list">
            {medicacaoAtivaEnriquecida.map((m, i) => (
              <div key={`med-ativa-${i}`} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '0.6rem 1rem', border: '1px solid #d1d5db', borderRadius: '8px', width: '100%', boxSizing: 'border-box', marginBottom: '0.5rem', background: '#fff' }}>
                <span style={{ flex: '1 1 0', fontWeight: 600, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nomeApresentacao || `Medicamento ${i + 1}`}</span>
                <span style={{ flex: '1 1 0', color: '#6b7280', fontSize: '0.9rem', textAlign: 'center' }}>
                  {m?.dosagem || '—'}
                </span>
                <div style={{ flex: '1 1 0', display: 'flex', justifyContent: 'center' }}>
                  {typeof onEliminarMedicacao === 'function' && (
                    <button
                      type="button"
                      style={{ fontSize: '0.8rem', padding: '4px 12px', background: 'none', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', color: '#dc2626', whiteSpace: 'nowrap' }}
                      onClick={() => onEliminarMedicacao(m)}
                    >
                      {textos?.prescription?.eliminarBtn || "Eliminar"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECÇÃO: ANTECEDENTES */}
      <section className="doctor-subcard">
        <SectionHeader
          title={textos?.prescription?.antecedentesTitle || "Antecedentes"}
          subtitle={textos?.prescription?.antecedentesSubtitle || "Atenção clínica, alergias e observações críticas"}
        />

        {!antecedentes || (Array.isArray(antecedentes) ? antecedentes.length === 0 : Object.keys(antecedentes).length === 0) ? (
          <div className="doctor-empty-box">{textos?.prescription?.semAntecedentes || "Sem antecedentes registados."}</div>
        ) : (
          <div className="doctor-alert-list">
            {(Array.isArray(antecedentes) ? antecedentes : Object.values(antecedentes)).map((a, i) => (
              <div key={i} className="doctor-alert-item">
                <strong>{a?.nome || a?.descricao || `Antecedente ${i + 1}`}</strong>
                {a?.tipo ? ` — ${a.tipo}` : ''}
                {(a?.dataregisto || a?.data_registo)
                  ? ` (${new Date(a.dataregisto || a.data_registo).toLocaleDateString('pt-PT')})`
                  : ''}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECÇÃO: FORMULÁRIO DE PRESCRIÇÃO E INTEGRAÇÃO IA */}
      <section className="doctor-subcard">
        <SectionHeader
          title={textos?.prescription?.prescreverTitle || "Prescrever medicação"}
          subtitle={textos?.prescription?.prescreverSubtitle || "Selecionar fármaco, validar risco e emitir prescrição"}
        />

        <div className="doctor-form-grid">
          <div>
            <label>{textos?.prescription?.medicamentoLabel || "Medicamento"}</label>
            <select
              className="doctor-field"
              name="codmedicamento"
              value={prescricao.codmedicamento || ''}
              onChange={handlePrescricaoChange}
            >
              <option value="">{textos?.prescription?.selecioneOption || "Selecione..."}</option>

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
                {textos?.prescription?.catalogoVazio || "Catálogo de medicamentos vazio."}
              </div>
            )}
          </div>

          <div>
            <label>{textos?.prescription?.dosagemLabel || "Dosagem"}</label>
            <input
              className="doctor-field"
              type="text"
              name="dosagem"
              value={prescricao.dosagem || ''}
              onChange={handlePrescricaoChange}
            />
          </div>

          <div className="doctor-form-grid-full">
            <label>{textos?.prescription?.observacoesLabel || "Observações"}</label>
            <input
              className="doctor-field"
              type="text"
              name="observacoes"
              value={prescricao.observacoes || ''}
              onChange={handlePrescricaoChange}
            />
          </div>
        </div>

        {/* VALIDAÇÃO CLÍNICA DE SEGURANÇA E ALERTAS DE IA */}
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
                    ? (textos?.prescription?.riscoElevadoUtente || 'Utente com risco/alergia para a medicação selecionada')
                    : (textos?.prescription?.semAlergiaConhecida || 'Sem alergia conhecida para a medicação selecionada')}
                </strong>
                <span>{riscoIA?.mensagem || riscoIA?.explicacao || (textos?.prescription?.avaliacaoConcluida || 'Avaliação concluída.')}</span>
              </div>
            ) : null}

            <button
              type="button"
              className="doctor-action-btn doctor-action-btn--secondary"
              onClick={avaliarRiscoIAFn}
              disabled={avaliacaoRisco || !prescricao.codmedicamento}
            >
              {avaliacaoRisco ? (textos?.prescription?.aAvaliar || 'A avaliar...') : (textos?.prescription?.ajudaIaBtn || 'Ajuda IA: avaliar alergias e risco')}
            </button>
          </div>
        ) : (
          <div className="doctor-empty-box">
            {textos?.prescription?.semAlergiasRegistadas || "O utente não tem alergias registadas para validação automática."}
          </div>
        )}

        <div className="doctor-actions-inline" style={{ marginTop: '1rem' }}>
          <button
            type="button"
            className="doctor-action-btn doctor-action-btn--primary"
            onClick={submeterPrescricao}
            disabled={!prescricao.codmedicamento || !prescricao.dosagem}
          >
            {textos?.prescription?.registarPrescricaoBtn || "Registar prescrição"}
          </button>
        </div>
      </section>
    </div>
  );
}
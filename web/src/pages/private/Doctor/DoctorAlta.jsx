const renderTabDecisao = () => (
    <div>
      <SectionHeader title="Decisão clínica" subtitle="Alta ou internamento" />

      <div className="doctor-form-grid">
        <div>
          <label>Destino</label>
          <select
            className="doctor-field"
            value={alta.destino}
            onChange={(e) => setAlta((prev) => ({ ...prev, destino: e.target.value }))}
          >
            <option value="alta">Alta</option>
            <option value="internamento">Internamento</option>
          </select>
        </div>

        {alta.destino === 'internamento' && (
          <>
            <div>
              <label>Serviço</label>
              <select
                className="doctor-field"
                value={alta.servico}
                onChange={(e) => setAlta((prev) => ({ ...prev, servico: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {SERVICOS.map((s, index) => (
                  <option key={`servico-${index}-${s}`} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>N.º Cama</label>
              <input
                className="doctor-field"
                type="text"
                value={alta.numero_cama}
                onChange={(e) =>
                  setAlta((prev) => ({ ...prev, numero_cama: e.target.value }))
                }
              />
            </div>

            <div className="doctor-form-grid__full">
              <label>Motivo</label>
              <select
                className="doctor-field"
                value={alta.motivo_int}
                onChange={(e) => setAlta((prev) => ({ ...prev, motivo_int: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {MOTIVOS_INTERNAMENTO.map((m, index) => (
                  <option key={`motivo-${index}-${m}`} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {alta.motivo_int === 'Outro' && (
              <div className="doctor-form-grid__full">
                <label>Especificar motivo</label>
                <input
                  className="doctor-field"
                  type="text"
                  value={alta.motivo_int_outro}
                  onChange={(e) =>
                    setAlta((prev) => ({ ...prev, motivo_int_outro: e.target.value }))
                  }
                />
              </div>
            )}
          </>
        )}

        <div className="doctor-form-grid__full">
          <label>Observações</label>
          <textarea
            className="doctor-field"
            rows="4"
            value={alta.observacoes}
            onChange={(e) => setAlta((prev) => ({ ...prev, observacoes: e.target.value }))}
          />
        </div>
      </div>

      <button className="doctor-action-btn doctor-action-btn--primary" onClick={submeterAlta}>
        {alta.destino === 'internamento' ? 'Enviar para internamento' : 'Registar alta'}
      </button>
    </div>
  );
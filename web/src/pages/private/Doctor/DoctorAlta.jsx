const submeterAlta = async () => {
  try {
    const codEp = episodioSelecionado?.cod_ep_urgenc;
    if (!codEp) {
      alert("Episódio inválido.");
      return;
    }

    const agora = new Date().toISOString();

    const resEpisodio = await fetch(`/api/v1/episodios/${codEp}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: "terminado",
        data_hora_saida: agora,
      }),
    });

    if (!resEpisodio.ok) {
      throw new Error("Falha ao atualizar episódio para alta.");
    }

    const resAto = await fetch("/api/v1/atos/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cod_ep_urgenc: codEp,
        tipo: "alta",
        descricao: alta.observacoes || "Alta registada.",
        data_hora_inicio: agora,
        data_hora_fim: agora,
      }),
    });

    if (!resAto.ok) {
      throw new Error("Falha ao registar ato de alta.");
    }

    const episodioAtualizado = {
      ...episodioSelecionado,
      estado: "terminado",
      data_hora_saida: agora,
    };

    setEpisodios((prev) =>
      (prev || []).map((ep) =>
        ep?.cod_ep_urgenc === codEp ? episodioAtualizado : ep
      )
    );

    setEpisodioSelecionado(episodioAtualizado);
    setSubMenuFila("concluidos");

    setAlta({
      destino: "alta",
      servico: "",
      numero_cama: "",
      motivo_int: "",
      motivo_int_outro: "",
      observacoes: "",
    });

    alert("Alta registada com sucesso.");
  } catch (error) {
    console.error("Erro ao registar alta:", error);
    alert("Erro ao registar alta.");
  }
};

const submeterInternamento = async () => {
  try {
    const codEp = episodioSelecionado?.cod_ep_urgenc;
    if (!codEp) {
      alert("Episódio inválido.");
      return;
    }

    if (!alta.servico || !alta.motivo_int) {
      alert("Preencha o serviço e o motivo do internamento.");
      return;
    }

    const agora = new Date().toISOString();

    const resInternamento = await fetch("/api/v1/internamentos/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cod_ep_urgenc: codEp,
        id_func: null,
        data_hora_int: agora,
        data_hora_consulta: null,
        data_hora_alta: null,
        motivo_int:
          alta.motivo_int === "Outro"
            ? alta.motivo_int_outro || "Outro"
            : alta.motivo_int,
        numero_cama: alta.numero_cama || null,
        servico: alta.servico || null,
        tipo_alta: null,
      }),
    });

    if (!resInternamento.ok) {
      throw new Error("Falha ao criar internamento.");
    }

    const resEpisodio = await fetch(`/api/v1/episodios/${codEp}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        estado: "internado",
      }),
    });

    if (!resEpisodio.ok) {
      throw new Error("Falha ao atualizar episódio para internado.");
    }

    const resAto = await fetch("/api/v1/atos/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cod_ep_urgenc: codEp,
        tipo: "internamento",
        descricao: alta.observacoes || "Encaminhado para internamento.",
        data_hora_inicio: agora,
        data_hora_fim: agora,
      }),
    });

    if (!resAto.ok) {
      throw new Error("Falha ao registar ato de internamento.");
    }

    const episodioAtualizado = {
      ...episodioSelecionado,
      estado: "internado",
    };

    setEpisodios((prev) =>
      (prev || []).map((ep) =>
        ep?.cod_ep_urgenc === codEp ? episodioAtualizado : ep
      )
    );

    setEpisodioSelecionado(episodioAtualizado);

    setAlta({
      destino: "alta",
      servico: "",
      numero_cama: "",
      motivo_int: "",
      motivo_int_outro: "",
      observacoes: "",
    });

    alert("Internamento registado com sucesso.");
  } catch (error) {
    console.error("Erro ao registar internamento:", error);
    alert("Erro ao registar internamento.");
  }
};

const [tipoDecisao, setTipoDecisao] = useState("alta");

const renderTabDecisao = () => (
  <div>
    <SectionHeader title="Decisão clínica" subtitle="Alta ou internamento" />

    <div className="doctor-toggle-row">
      <button
        type="button"
        className={`doctor-pill ${tipoDecisao === "alta" ? "is-active" : ""}`}
        onClick={() => setTipoDecisao("alta")}
      >
        Alta
      </button>

      <button
        type="button"
        className={`doctor-pill ${tipoDecisao === "internamento" ? "is-active" : ""}`}
        onClick={() => setTipoDecisao("internamento")}
      >
        Internamento
      </button>
    </div>

    <div className="doctor-form-grid">
      {tipoDecisao === "internamento" && (
        <>
          <div>
            <label>Serviço</label>
            <select
              className="doctor-field"
              value={alta.servico}
              onChange={(e) =>
                setAlta((prev) => ({ ...prev, servico: e.target.value }))
              }
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
              onChange={(e) =>
                setAlta((prev) => ({ ...prev, motivo_int: e.target.value }))
              }
            >
              <option value="">Selecione...</option>
              {MOTIVOS_INTERNAMENTO.map((m, index) => (
                <option key={`motivo-${index}-${m}`} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {alta.motivo_int === "Outro" && (
            <div className="doctor-form-grid__full">
              <label>Especificar motivo</label>
              <input
                className="doctor-field"
                type="text"
                value={alta.motivo_int_outro}
                onChange={(e) =>
                  setAlta((prev) => ({
                    ...prev,
                    motivo_int_outro: e.target.value,
                  }))
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
          onChange={(e) =>
            setAlta((prev) => ({ ...prev, observacoes: e.target.value }))
          }
        />
      </div>
    </div>

    <button
      type="button"
      className="doctor-action-btn doctor-action-btn--primary"
      onClick={() => {
        console.log("CLICK destino:", alta.destino);
        if (alta.destino === "internamento") {
          submeterInternamento();
        } else {
          submeterAlta();
        }
      }}
    >
      {alta.destino === "internamento"
        ? "Enviar para internamento"
        : "Gravar alta"}
    </button>
  </div>
);
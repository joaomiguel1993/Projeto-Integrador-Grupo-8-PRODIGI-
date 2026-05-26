export default function DoctorQueue({
    episodios,
    episodiosOrdenados,
    subMenuFila,
    setSubMenuFila,
    filtro,
    setFiltro,
    abrirEpisodio,
    submeterAltaRapida,
    TRIAGE_CLASS,
    renderAtendimento,
    episodioSelecionado,
    setEpisodioSelecionado,
}) {

    const listaAtual = episodiosOrdenados || [];

    return (
        <div className="doctor-panel-card">

            <div className="doctor-toolbar-row">
                <div className="doctor-menu-pills">

                    <button
                        type="button"
                        className={`doctor-pill ${subMenuFila === 'em_espera' ? 'is-active' : ''}`}
                        onClick={() => {
                            setSubMenuFila('em_espera');
                            setEpisodioSelecionado(null);
                        }}
                    >
                        Em espera
                    </button>

                    <button
                        type="button"
                        className={`doctor-pill ${subMenuFila === 'atendimento' ? 'is-active' : ''}`}
                        onClick={() => {
                            setSubMenuFila('atendimento');
                            abrirEpisodio(ep);
                        }}
                    >
                        Atendimento
                    </button>

                    <button
                        type="button"
                        className={`doctor-pill ${subMenuFila === 'concluidos' ? 'is-active' : ''}`}
                        onClick={() => {
                            setSubMenuFila('concluidos');
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
                        {listaAtual.map((ep) => {

                            const codEpisodio =
                                ep.cod_ep_urgenc || ep.codepurgenc;

                            const nomeUtente =
                                ep.nome_utente || ep.nomeutente || '—';

                            const corTriagem =
                                ep.cor_triagem || ep.cortriagem || '—';

                            return (
                                <tr key={codEpisodio}>

                                    <td>#{codEpisodio}</td>

                                    <td>{nomeUtente}</td>

                                    <td>
                                        <span
                                            className={
                                                TRIAGE_CLASS[corTriagem] || 'triage-badge'
                                            }
                                        >
                                            {corTriagem}
                                        </span>
                                    </td>

                                    <td>
                                        {ep.tempo_espera_previsto || '—'} min
                                    </td>

                                    <td>
                                        <div className="doctor-actions-inline">

                                            <button
                                                type="button"
                                                className="doctor-action-btn doctor-action-btn--secondary"
                                                onClick={() => submeterAltaRapida(ep)}
                                            >
                                                Dar alta
                                            </button>

                                            <button
                                                type="button"
                                                className="doctor-action-btn doctor-action-btn--primary"
                                                onClick={() => {
                                                    setSubMenuFila('atendimento');
                                                    abrirEpisodio(ep);
                                                }}
                                            >
                                                Atender
                                            </button>

                                        </div>
                                    </td>

                                </tr>
                            );
                        })}
                    </tbody>

                </table>
            </div>

        </div>
    );
}
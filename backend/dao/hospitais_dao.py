from backend.db import run_query, get_connection


def _row_to_hospital_dict(row):
    if not row:
        return None

    if isinstance(row, dict):
        return {
            "idhosp": row.get("idhosp"),
            "nome": row.get("nome"),
            "localizacao": row.get("localizacao"),
            "email": row.get("email"),
            "telefone": row.get("telefone"),
            "totalcamas": row.get("totalcamas"),
            "facility_size_beds": row.get("facility_size_beds"),
            "contagem_enfermeiros": row.get("contagem_enfermeiros"),
            "contagem_medicos": row.get("contagem_medicos"),
            "pacientes_ativos": row.get("pacientes_ativos"),
        }

    return {
        "idhosp": row[0],
        "nome": row[1],
        "localizacao": row[2],
        "email": row[3],
        "telefone": row[4],
        "totalcamas": row[5],
        "facility_size_beds": row[6],
        "contagem_enfermeiros": row[7],
        "contagem_medicos": row[8],
        "pacientes_ativos": row[9],
    }


def select_all_hospitais():
    """
    Mantém compatibilidade com o frontend:
    - lista base vem da tabela hospital
    - métricas IA vêm da view, se existirem
    """
    return run_query("""
        SELECT
            h.idhosp,
            h.nome,
            h.localizacao,
            h.email,
            h.telefone,
            h.totalcamas,
            COALESCE(v.facility_size_beds, h.totalcamas) AS facility_size_beds,
            COALESCE(v.contagem_enfermeiros, 0) AS contagem_enfermeiros,
            COALESCE(v.contagem_medicos, 0) AS contagem_medicos,
            COALESCE(v.pacientes_ativos, 0) AS pacientes_ativos
        FROM hospital h
        LEFT JOIN v_estatisticas_ia v ON v.idhosp = h.idhosp
        ORDER BY h.nome
    """)


def select_hospital_by_id(id_hosp: int):
    return run_query("""
        SELECT
            h.idhosp,
            h.nome,
            h.localizacao,
            h.email,
            h.telefone,
            h.totalcamas,
            COALESCE(v.facility_size_beds, h.totalcamas) AS facility_size_beds,
            COALESCE(v.contagem_enfermeiros, 0) AS contagem_enfermeiros,
            COALESCE(v.contagem_medicos, 0) AS contagem_medicos,
            COALESCE(v.pacientes_ativos, 0) AS pacientes_ativos
        FROM hospital h
        LEFT JOIN v_estatisticas_ia v ON v.idhosp = h.idhosp
        WHERE h.idhosp = %s
    """, (id_hosp,))


def insert_hospital(
    nome: str,
    localizacao: str,
    email: str | None = None,
    telefone: str | None = None,
    totalcamas: int = 100
):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO hospital (nome, localizacao, email, telefone, totalcamas)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
        """, (nome, localizacao, email, telefone, totalcamas))

        novo = cur.fetchone()
        conn.commit()

        if not novo:
            return None

        if isinstance(novo, dict):
            return {
                "idhosp": novo.get("idhosp"),
                "nome": novo.get("nome"),
                "localizacao": novo.get("localizacao"),
                "email": novo.get("email"),
                "telefone": novo.get("telefone"),
                "totalcamas": novo.get("totalcamas"),
                "facility_size_beds": novo.get("totalcamas"),
                "contagem_enfermeiros": 0,
                "contagem_medicos": 0,
                "pacientes_ativos": 0,
            }

        return {
            "idhosp": novo[0],
            "nome": novo[1],
            "localizacao": novo[2],
            "email": novo[3],
            "telefone": novo[4],
            "totalcamas": novo[5],
            "facility_size_beds": novo[5],
            "contagem_enfermeiros": 0,
            "contagem_medicos": 0,
            "pacientes_ativos": 0,
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def update_hospital_by_id(
    id_hosp: int,
    nome: str,
    localizacao: str,
    email: str | None = None,
    telefone: str | None = None,
    totalcamas: int = 100
):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE hospital
            SET nome = %s,
                localizacao = %s,
                email = %s,
                telefone = %s,
                totalcamas = %s
            WHERE idhosp = %s
            RETURNING idhosp, nome, localizacao, email, telefone, totalcamas
        """, (nome, localizacao, email, telefone, totalcamas, id_hosp))

        atualizado = cur.fetchone()
        if not atualizado:
            conn.rollback()
            return None

        conn.commit()

        if isinstance(atualizado, dict):
            return {
                "idhosp": atualizado.get("idhosp"),
                "nome": atualizado.get("nome"),
                "localizacao": atualizado.get("localizacao"),
                "email": atualizado.get("email"),
                "telefone": atualizado.get("telefone"),
                "totalcamas": atualizado.get("totalcamas"),
                "facility_size_beds": atualizado.get("totalcamas"),
                "contagem_enfermeiros": 0,
                "contagem_medicos": 0,
                "pacientes_ativos": 0,
            }

        return {
            "idhosp": atualizado[0],
            "nome": atualizado[1],
            "localizacao": atualizado[2],
            "email": atualizado[3],
            "telefone": atualizado[4],
            "totalcamas": atualizado[5],
            "facility_size_beds": atualizado[5],
            "contagem_enfermeiros": 0,
            "contagem_medicos": 0,
            "pacientes_ativos": 0,
        }

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


def delete_hospital_by_id(id_hosp: int):
    conn = get_connection()
    cur = conn.cursor()
    try:
        cur.execute(
            "DELETE FROM hospital WHERE idhosp = %s RETURNING idhosp",
            (id_hosp,)
        )
        apagado = cur.fetchone()
        conn.commit()
        return apagado is not None
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
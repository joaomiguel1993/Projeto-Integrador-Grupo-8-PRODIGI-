import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(override=True)

port_postgres = os.getenv("POSTGRES18_PORT")
password_postgres = os.getenv("POSTGRES18_PASSWORD")
host_postgres = os.getenv("POSTGRES_HOST", "localhost")
db_name = os.getenv("POSTGRES_DB", "Projeto_Integrador_G08")
db_user = os.getenv("POSTGRES_USER", "postgres")

def get_connection():
    return psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=password_postgres,
        host=host_postgres,
        port=port_postgres
    )

def run_query(query, params=None):
    con = None
    cur = None
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute(query, params)

        if cur.description is not None:
            colunas = [desc[0] for desc in cur.description]
            dados = cur.fetchall()
            resultado = [dict(zip(colunas, row)) for row in dados]
            return resultado
        else:
            con.commit()
            return {"msg": "Operação realizada com sucesso"}

    except Exception as e:
        if con:
            con.rollback()
        return {"erro": str(e)}

    finally:
        if cur:
            cur.close()
        if con:
            con.close()
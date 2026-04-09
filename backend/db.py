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

def run_query(query):
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute(query)
        colunas = [desc[0] for desc in cur.description]
        dados = cur.fetchall()
        resultado = [dict(zip(colunas, row)) for row in dados]
        return resultado
    except Exception as e:
        return {"erro": str(e)}
    finally:
        cur.close()
        con.close()
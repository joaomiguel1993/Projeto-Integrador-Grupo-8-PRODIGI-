import os
from pathlib import Path
from typing import Any, Optional

import psycopg2
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

port_postgres = os.getenv("POSTGRES18_PORT", "5432")
password_postgres = os.getenv("POSTGRES18_PASSWORD")
host_postgres = os.getenv("POSTGRES_HOST")
db_name = os.getenv("POSTGRES_DB")
db_user = os.getenv("POSTGRES_USER")


def get_connection():
    return psycopg2.connect(
        dbname=db_name,
        user=db_user,
        password=password_postgres,
        host=host_postgres,
        port=port_postgres
    )


def run_query(query: str, params: Optional[tuple[Any, ...]] = None):
    con = None
    cur = None
    try:
        con = get_connection()
        cur = con.cursor()
        cur.execute(query, params)

        result = None
        if cur.description is not None:
            colunas = [desc[0] for desc in cur.description]
            dados = cur.fetchall()
            result = [dict(zip(colunas, row)) for row in dados]

        con.commit()

        if result is not None:
            return result
        return []

    except Exception as e:
        if con:
            con.rollback()
        raise e

    finally:
        if cur:
            cur.close()
        if con:
            con.close()
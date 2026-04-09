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
<<<<<<< HEAD
        dbname=db_name,
        user=db_user,
        password=password_postgres,
        host=host_postgres,
        port=port_postgres
    )
=======
        dbname="Projeto_Integrador_G08", # Nome da base de dados que cada um tem no pgAdmin
        user="postgres",
        password=password_postgres, # Pass que cada um tem no pgAdmin
        host="localhost",
        port=port_postgres # Luis:5433; João:5432
    )
>>>>>>> 95098ff9080f2e845ca621885d3a441b51b23b97

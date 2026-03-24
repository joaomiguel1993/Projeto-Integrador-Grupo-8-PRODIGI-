import psycopg2
import os
from dotenv import load_dotenv

load_dotenv(override=True)
port_postgres = os.getenv("POSTGRES18_PORT")
password_postgres = os.getenv("POSTGRES18_PASSWORD")

def get_connection():
    return psycopg2.connect(
        dbname="Projeto_Integrador_G08", # Nome da base de dados que cada um tem no pgAdmin
        user="postgres",
        password=password_postgres, # Pass que cada um tem no pgAdmin
        host="localhost",
        port=port_postgres # Luis:5433; João:5432
    )
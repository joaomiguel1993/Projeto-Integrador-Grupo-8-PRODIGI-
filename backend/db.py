import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="Projeto_Integrador_G08", # Nome da base de dados que cada um tem no pgAdmin
        user="postgres",
        password="Jmsm93960412460!", # Pass que cada um tem no pgAdmin
        host="localhost",
        port="5432" # Luis:5433; João:5432
    )
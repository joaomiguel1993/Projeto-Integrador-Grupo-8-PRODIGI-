import psycopg2

def get_connection():
    return psycopg2.connect(
        dbname="Projeto",
        user="postgres",
        password="admin",
        host="localhost",
        port="5432"
    )
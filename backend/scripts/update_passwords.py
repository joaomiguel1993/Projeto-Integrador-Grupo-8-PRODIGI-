from backend.auth.security import hash_password
from backend.db import get_connection

def update_passwords():
    con = None
    cur = None

    try:
        con = get_connection()
        cur = con.cursor()

        cur.execute("""
            SELECT idutilizador, Password
            FROM utilizador
            WHERE Password IS NOT NULL
        """)
        utilizadores = cur.fetchall()

        total = 0

        for id_utilizador, password_atual in utilizadores:
            if not password_atual:
                continue

            password_str = str(password_atual)

            if (
                password_str.startswith("$bcrypt-sha256$")
                or password_str.startswith("$2a$")
                or password_str.startswith("$2b$")
                or password_str.startswith("$2y$")
            ):
                continue

            nova_password = hash_password(password_str)

            cur.execute("""
                UPDATE utilizador
                SET Password = %s
                WHERE idutilizador = %s
            """, (nova_password, id_utilizador))

            total += 1

        con.commit()
        print(f"Passwords atualizadas com sucesso: {total}")

    except Exception as e:
        if con:
            con.rollback()
        print(f"Erro ao atualizar passwords: {e}")

    finally:
        if cur:
            cur.close()
        if con:
            con.close()

if __name__ == "__main__":
    update_passwords()
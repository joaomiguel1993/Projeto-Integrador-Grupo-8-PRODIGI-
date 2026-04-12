from passlib.context import CryptContext
from backend.db import get_connection

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def update_passwords():
    con = None
    cur = None

    try:
        con = get_connection()
        cur = con.cursor()

        cur.execute("""
            SELECT numfunc, password
            FROM profissionais
            WHERE password IS NOT NULL
        """)
        utilizadores = cur.fetchall()

        total = 0

        for numfunc, password_atual in utilizadores:
            if not password_atual:
                continue

            if str(password_atual).startswith("$2a$") or str(password_atual).startswith("$2b$") or str(password_atual).startswith("$2y$"):
                continue

            nova_password = hash_password(password_atual)

            cur.execute("""
                UPDATE profissionais
                SET password = %s
                WHERE numfunc = %s
            """, (nova_password, numfunc))

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
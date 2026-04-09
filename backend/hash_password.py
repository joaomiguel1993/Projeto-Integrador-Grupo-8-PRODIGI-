from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "100espacos"
hashed_password = pwd_context.hash(password)

print(hashed_password)
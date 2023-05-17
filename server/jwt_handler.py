import jwt
import time
import os

JWT_SECRET_KEY =os.getenv("JWT_SECRET_KEY")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM")

def assign_jwt(user_email: str):
    payload = {
        "email": user_email,
        "expires": time.time() + 1200
    }

    token = jwt.encode(payload, JWT_SECRET_KEY, JWT_ALGORITHM)
    return token


def check_token(token: str):
    try:
        decoded = jwt.decode(token, JWT_SECRET_KEY, JWT_ALGORITHM)
        return decoded if decoded["expires"] >= time.time() else None
    except:
        return {}    
import json
from pathlib import Path

import bcrypt
from pydantic import BaseModel, EmailStr

from .config import settings


class User(BaseModel):
    email: EmailStr
    nickname: str
    password_hash: str


def _db_path() -> Path:
    path = Path(settings.auth_db)
    path.parent.mkdir(parents=True, exist_ok=True)
    if not path.exists():
        path.write_text("[]", encoding="utf-8")
    return path


def _load_users() -> list[User]:
    path = _db_path()
    data = json.loads(path.read_text(encoding="utf-8"))
    return [User(**u) for u in data]


def _save_users(users: list[User]) -> None:
    path = _db_path()
    path.write_text(json.dumps([u.dict() for u in users], indent=2), encoding="utf-8")


def register_user(email: str, nickname: str, password: str) -> None:
    users = _load_users()
    if any(u.email == email for u in users):
        raise ValueError("Email already registered")
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    users.append(User(email=email, nickname=nickname, password_hash=hashed))
    _save_users(users)


def authenticate_user(email: str, password: str) -> bool:
    users = _load_users()
    for user in users:
        if user.email == email and bcrypt.checkpw(password.encode(), user.password_hash.encode()):
            return True
    return False

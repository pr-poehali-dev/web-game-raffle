"""
Telegram Auth Extension - Backend Function

Обмен временного токена (от бота) на JWT.
Actions: callback, refresh, logout
"""

import json
import os
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
import psycopg2
import jwt


def get_db_connection():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_schema() -> str:
    schema = os.environ.get("MAIN_DB_SCHEMA", "public")
    return f"{schema}." if schema else ""


def get_env(key: str) -> str:
    value = os.environ.get(key)
    if not value:
        raise ValueError(f"Missing environment variable: {key}")
    return value


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def generate_token(length: int = 32) -> str:
    return secrets.token_urlsafe(length)


def create_jwt(user_id: int, secret: str, expires_in: int = 900) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(seconds=expires_in),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, secret, algorithm="HS256")


def get_auth_token(cursor, token: str) -> Optional[dict]:
    token_hash = hash_token(token)
    schema = get_schema()
    cursor.execute(f"""
        SELECT telegram_id, telegram_username, telegram_first_name,
               telegram_last_name, telegram_photo_url, expires_at, used
        FROM {schema}telegram_auth_tokens
        WHERE token_hash = %s
    """, (token_hash,))
    row = cursor.fetchone()
    if not row:
        return None
    return {
        "telegram_id": row[0],
        "telegram_username": row[1],
        "telegram_first_name": row[2],
        "telegram_last_name": row[3],
        "telegram_photo_url": row[4],
        "expires_at": row[5],
        "used": row[6],
    }


def mark_token_used(cursor, token: str) -> bool:
    token_hash = hash_token(token)
    schema = get_schema()
    cursor.execute(f"""
        UPDATE {schema}telegram_auth_tokens
        SET used = TRUE
        WHERE token_hash = %s AND used = FALSE
        RETURNING id
    """, (token_hash,))
    return cursor.fetchone() is not None


def find_user_by_telegram_id(cursor, telegram_id: str) -> Optional[dict]:
    schema = get_schema()
    cursor.execute(f"""
        SELECT id, email, name, avatar_url, telegram_id
        FROM {schema}users
        WHERE telegram_id = %s
    """, (telegram_id,))
    row = cursor.fetchone()
    if row:
        return {"id": row[0], "email": row[1], "name": row[2], "avatar_url": row[3], "telegram_id": row[4]}
    return None


def create_or_update_user(cursor, telegram_id, username, first_name, last_name, photo_url) -> dict:
    schema = get_schema()
    name_parts = []
    if first_name:
        name_parts.append(first_name)
    if last_name:
        name_parts.append(last_name)
    display_name = " ".join(name_parts) if name_parts else username or f"User {telegram_id}"

    existing = find_user_by_telegram_id(cursor, telegram_id)
    if existing:
        cursor.execute(f"""
            UPDATE {schema}users
            SET name = COALESCE(%s, name),
                avatar_url = COALESCE(%s, avatar_url),
                last_login_at = NOW(),
                updated_at = NOW()
            WHERE telegram_id = %s
            RETURNING id, email, name, avatar_url, telegram_id
        """, (display_name, photo_url, telegram_id))
    else:
        cursor.execute(f"""
            INSERT INTO {schema}users (telegram_id, name, avatar_url, email_verified, password_hash, created_at, updated_at, last_login_at)
            VALUES (%s, %s, %s, TRUE, '', NOW(), NOW(), NOW())
            RETURNING id, email, name, avatar_url, telegram_id
        """, (telegram_id, display_name, photo_url))

    row = cursor.fetchone()
    return {"id": row[0], "email": row[1], "name": row[2], "avatar_url": row[3], "telegram_id": row[4]}


def save_refresh_token(cursor, user_id: int, token_hash: str, expires_at: datetime) -> None:
    schema = get_schema()
    cursor.execute(f"""
        INSERT INTO {schema}refresh_tokens (user_id, token_hash, expires_at)
        VALUES (%s, %s, %s)
    """, (user_id, token_hash, expires_at))


def find_refresh_token(cursor, token_hash: str) -> Optional[dict]:
    schema = get_schema()
    cursor.execute(f"""
        SELECT user_id, expires_at
        FROM {schema}refresh_tokens
        WHERE token_hash = %s AND expires_at > NOW()
    """, (token_hash,))
    row = cursor.fetchone()
    if row:
        return {"user_id": row[0], "expires_at": row[1]}
    return None


def invalidate_refresh_token(cursor, token_hash: str) -> None:
    schema = get_schema()
    cursor.execute(f"""
        UPDATE {schema}refresh_tokens
        SET expires_at = NOW() - INTERVAL '1 second'
        WHERE token_hash = %s
    """, (token_hash,))


def get_user_by_id(cursor, user_id: int) -> Optional[dict]:
    schema = get_schema()
    cursor.execute(f"""
        SELECT id, email, name, avatar_url, telegram_id
        FROM {schema}users WHERE id = %s
    """, (user_id,))
    row = cursor.fetchone()
    if row:
        return {"id": row[0], "email": row[1], "name": row[2], "avatar_url": row[3], "telegram_id": row[4]}
    return None


def get_cors_headers() -> dict:
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }


def cors_response(status: int, body: dict) -> dict:
    return {
        "statusCode": status,
        "headers": {**get_cors_headers(), "Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def options_response() -> dict:
    return {"statusCode": 204, "headers": get_cors_headers(), "body": ""}


def handle_callback(cursor, body: dict) -> dict:
    token = body.get("token")
    if not token:
        return cors_response(400, {"error": "Missing token"})

    token_data = get_auth_token(cursor, token)
    if not token_data:
        return cors_response(404, {"error": "Token not found"})

    expires_at = token_data["expires_at"]
    now = datetime.now(timezone.utc)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        return cors_response(410, {"error": "Token expired"})

    if token_data["used"]:
        return cors_response(410, {"error": "Token already used"})

    if not token_data["telegram_id"]:
        return cors_response(400, {"error": "Token not authenticated"})

    jwt_secret = get_env("JWT_SECRET")

    user = create_or_update_user(
        cursor,
        telegram_id=token_data["telegram_id"],
        username=token_data["telegram_username"],
        first_name=token_data["telegram_first_name"],
        last_name=token_data["telegram_last_name"],
        photo_url=token_data["telegram_photo_url"],
    )

    mark_token_used(cursor, token)

    access_token = create_jwt(user["id"], jwt_secret)
    refresh_token = generate_token(48)
    refresh_token_hash = hash_token(refresh_token)
    refresh_expires = datetime.now(timezone.utc) + timedelta(days=30)

    save_refresh_token(cursor, user["id"], refresh_token_hash, refresh_expires)

    return cors_response(200, {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": 900,
        "user": user,
    })


def handle_refresh(cursor, body: dict) -> dict:
    refresh_token = body.get("refresh_token")
    if not refresh_token:
        return cors_response(400, {"error": "Missing refresh_token"})

    jwt_secret = get_env("JWT_SECRET")
    token_hash = hash_token(refresh_token)
    token_data = find_refresh_token(cursor, token_hash)
    if not token_data:
        return cors_response(401, {"error": "Invalid or expired refresh token"})

    user = get_user_by_id(cursor, token_data["user_id"])
    if not user:
        return cors_response(401, {"error": "User not found"})

    access_token = create_jwt(user["id"], jwt_secret)
    return cors_response(200, {"access_token": access_token, "expires_in": 900, "user": user})


def handle_logout(cursor, body: dict) -> dict:
    refresh_token = body.get("refresh_token")
    if refresh_token:
        token_hash = hash_token(refresh_token)
        invalidate_refresh_token(cursor, token_hash)
    return cors_response(200, {"success": True})


def handler(event, context):
    """Авторизация через Telegram бот: обмен токена на JWT, refresh, logout."""
    method = event.get("httpMethod", "GET")

    if method == "OPTIONS":
        return options_response()

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")

    body = {}
    if method == "POST":
        raw_body = event.get("body", "{}")
        try:
            body = json.loads(raw_body) if raw_body else {}
        except json.JSONDecodeError:
            return cors_response(400, {"error": "Invalid JSON"})

    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        if action == "callback" and method == "POST":
            response = handle_callback(cursor, body)
        elif action == "refresh" and method == "POST":
            response = handle_refresh(cursor, body)
        elif action == "logout" and method == "POST":
            response = handle_logout(cursor, body)
        else:
            response = cors_response(400, {"error": f"Unknown action: {action}"})

        conn.commit()
        return response

    except ValueError:
        return cors_response(500, {"error": "Server configuration error"})
    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Error: {e}")
        return cors_response(500, {"error": "Internal server error"})
    finally:
        if conn:
            conn.close()

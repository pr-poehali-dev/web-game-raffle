import json
import os
import hmac
import hashlib
from urllib.parse import parse_qsl, unquote
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")

def verify_tg_init_data(init_data: str, bot_token: str) -> dict | None:
    """Проверяет подпись Telegram initData и возвращает данные пользователя."""
    params = dict(parse_qsl(init_data, keep_blank_values=True))
    received_hash = params.pop("hash", None)
    if not received_hash:
        return None

    data_check_string = "\n".join(
        f"{k}={v}" for k, v in sorted(params.items())
    )

    secret_key = hmac.new(
        b"WebAppData", bot_token.encode(), hashlib.sha256
    ).digest()

    expected_hash = hmac.new(
        secret_key, data_check_string.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_hash, received_hash):
        return None

    user_json = params.get("user")
    if not user_json:
        return None

    return json.loads(unquote(user_json))


def handler(event: dict, context) -> dict:
    """Авторизация и авторегистрация игрока через Telegram WebApp initData."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = json.loads(event.get("body") or "{}")
    init_data = body.get("initData", "")
    bot_token = os.environ.get("TG_BOT_TOKEN", "")

    tg_user = None

    # В режиме разработки (без токена или пустой initData) — пропускаем верификацию
    if bot_token and init_data:
        tg_user = verify_tg_init_data(init_data, bot_token)
        if tg_user is None:
            return {
                "statusCode": 401,
                "headers": cors,
                "body": json.dumps({"error": "Invalid initData signature"}),
            }
    elif init_data:
        # Попробуем распарсить без проверки (dev-режим)
        try:
            from urllib.parse import parse_qsl, unquote
            params = dict(parse_qsl(init_data, keep_blank_values=True))
            user_json = params.get("user")
            if user_json:
                tg_user = json.loads(unquote(user_json))
        except Exception:
            pass

    if not tg_user:
        # Тестовый пользователь если initData отсутствует (браузерная превью)
        tg_user = {
            "id": 0,
            "first_name": "Demo",
            "last_name": "",
            "username": "demo_player",
            "photo_url": None,
        }

    tg_id = tg_user.get("id", 0)
    first_name = tg_user.get("first_name", "")
    last_name = tg_user.get("last_name") or None
    username = tg_user.get("username") or None
    photo_url = tg_user.get("photo_url") or None

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    is_new = False

    # Ищем игрока
    cur.execute(
        f"SELECT id, tg_id, username, first_name, last_name, photo_url, balance, games_played, games_won, daily_streak, daily_last_claimed, city, pvz_address, created_at FROM {SCHEMA}.players WHERE tg_id = %s",
        (tg_id,),
    )
    row = cur.fetchone()

    if row is None:
        is_new = True
        # Регистрируем нового игрока
        cur.execute(
            f"""
            INSERT INTO {SCHEMA}.players
              (tg_id, username, first_name, last_name, photo_url, balance)
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id, tg_id, username, first_name, last_name, photo_url, balance,
                      games_played, games_won, daily_streak, daily_last_claimed, city, pvz_address, created_at
            """,
            (tg_id, username, first_name, last_name, photo_url, 1000),
        )
        row = cur.fetchone()
    else:
        # Обновляем данные из TG (имя/фото могли измениться)
        cur.execute(
            f"""
            UPDATE {SCHEMA}.players
            SET username = %s, first_name = %s, last_name = %s, photo_url = %s, updated_at = NOW()
            WHERE tg_id = %s
            """,
            (username, first_name, last_name, photo_url, tg_id),
        )

    conn.commit()
    cur.close()
    conn.close()

    cols = ["id", "tg_id", "username", "first_name", "last_name", "photo_url",
            "balance", "games_played", "games_won", "daily_streak",
            "daily_last_claimed", "city", "pvz_address", "created_at"]
    player = dict(zip(cols, row))

    # Сериализуем даты
    if player.get("daily_last_claimed"):
        player["daily_last_claimed"] = str(player["daily_last_claimed"])
    if player.get("created_at"):
        player["created_at"] = str(player["created_at"])

    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({"player": player, "is_new": is_new}, ensure_ascii=False),
    }

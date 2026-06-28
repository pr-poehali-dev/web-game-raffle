import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")


def handler(event: dict, context) -> dict:
    """Сохраняет данные профиля игрока (имя, фамилия, город, адрес ПВЗ)."""
    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    body = json.loads(event.get("body") or "{}")
    player_id = body.get("player_id")
    if not player_id:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "player_id required"})}

    first_name = body.get("first_name", "").strip()
    last_name = body.get("last_name", "").strip() or None
    city = body.get("city", "").strip() or None
    pvz_address = body.get("pvz_address", "").strip() or None

    if not first_name:
        return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "first_name required"})}

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    cur = conn.cursor()

    cur.execute(
        f"""
        UPDATE {SCHEMA}.players
        SET first_name = %s,
            last_name = %s,
            city = %s,
            pvz_address = %s,
            updated_at = NOW()
        WHERE id = %s
        RETURNING id, first_name, last_name, city, pvz_address
        """,
        (first_name, last_name, city, pvz_address, player_id),
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()

    if not row:
        return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "Player not found"})}

    return {
        "statusCode": 200,
        "headers": cors,
        "body": json.dumps({
            "ok": True,
            "id": row[0],
            "first_name": row[1],
            "last_name": row[2],
            "city": row[3],
            "pvz_address": row[4],
        }, ensure_ascii=False),
    }

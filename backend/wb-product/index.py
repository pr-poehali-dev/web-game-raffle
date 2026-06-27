import json
import urllib.request
import urllib.error

def get_basket_host(nm_id: int) -> str:
    """Определяет хост basket по артикулу WB."""
    vol = nm_id // 100000
    if vol <= 143: return "basket-01.wbbasket.ru"
    elif vol <= 287: return "basket-02.wbbasket.ru"
    elif vol <= 431: return "basket-03.wbbasket.ru"
    elif vol <= 719: return "basket-04.wbbasket.ru"
    elif vol <= 1007: return "basket-05.wbbasket.ru"
    elif vol <= 1061: return "basket-06.wbbasket.ru"
    elif vol <= 1115: return "basket-07.wbbasket.ru"
    elif vol <= 1169: return "basket-08.wbbasket.ru"
    elif vol <= 1313: return "basket-09.wbbasket.ru"
    elif vol <= 1601: return "basket-10.wbbasket.ru"
    elif vol <= 1655: return "basket-11.wbbasket.ru"
    elif vol <= 1919: return "basket-12.wbbasket.ru"
    elif vol <= 2045: return "basket-13.wbbasket.ru"
    elif vol <= 2189: return "basket-14.wbbasket.ru"
    elif vol <= 2405: return "basket-15.wbbasket.ru"
    elif vol <= 2621: return "basket-16.wbbasket.ru"
    elif vol <= 2837: return "basket-17.wbbasket.ru"
    else: return "basket-18.wbbasket.ru"

def handler(event: dict, context) -> dict:
    """Получение названия товара Wildberries по артикулу через basket API."""
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    article = params.get('article', '').strip()

    if not article or not article.isdigit():
        return {
            'statusCode': 400,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный артикул'})
        }

    nm_id = int(article)
    vol = nm_id // 100000
    part = nm_id // 1000
    host = get_basket_host(nm_id)

    url = f'https://{host}/vol{vol}/part{part}/{nm_id}/info/ru/card.json'
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
        'Accept': 'application/json, text/plain, */*',
        'Referer': f'https://www.wildberries.ru/catalog/{nm_id}/detail.aspx',
        'Origin': 'https://www.wildberries.ru'
    })

    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
    except urllib.error.HTTPError:
        return {
            'statusCode': 404,
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Товар не найден'})
        }

    name = data.get('imt_name', '') or data.get('subj_name', '')
    brand = (data.get('selling') or {}).get('brand_name', '') or ''
    full_name = f'{brand} {name}'.strip() if brand else name

    wb_url = f'https://www.wildberries.ru/catalog/{nm_id}/detail.aspx'

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'name': full_name or f'Товар {article}',
            'url': wb_url,
            'article': article
        }, ensure_ascii=False)
    }

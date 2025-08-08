# MenuSwap Scraper (NL)

## Prereqs
- Python 3.11+
- Postgres running locally
- `createdb menuswap`
- `psql -d menuswap -f sql/schema.sql`

## Setup
```bash
cp .env.example .env
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

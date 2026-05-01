from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("UPDATE buyers SET gstins = '[]'::jsonb WHERE gstins IS NULL"))
    conn.commit()
    print(f'Updated {result.rowcount} rows')

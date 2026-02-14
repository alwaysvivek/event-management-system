import psycopg2
from psycopg2 import sql

DB_CONFIG = {
    "user": "postgres",
    "password": "02042007",
    "host": "localhost",
    "port": "5432",
    "database": "postgres"  # Connect to default database
}

TARGET_DB = "event_db"

def create_database():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.autocommit = True
        cur = conn.cursor()

        # Check if database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (TARGET_DB,))
        exists = cur.fetchone()

        if not exists:
            print(f"Creating database '{TARGET_DB}'...")
            cur.execute(sql.SQL("CREATE DATABASE {}").format(
                sql.Identifier(TARGET_DB))
            )
            print(f"Database '{TARGET_DB}' created successfully.")
        else:
            print(f"Database '{TARGET_DB}' already exists.")

        cur.close()
        conn.close()

    except Exception as e:
        print(f"Error creating database: {e}")

if __name__ == "__main__":
    create_database()

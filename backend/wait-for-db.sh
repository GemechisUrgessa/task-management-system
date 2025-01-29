# wait-for-db.sh
#!/bin/sh

# Wait for the database to be ready
until nc -z db 5432; do
  echo "Waiting for PostgreSQL to start..."
  sleep 1
done

echo "PostgreSQL started"

# Run migrations
PGPASSWORD=app_password psql -h db -U app_user -d task_management -f /app/migrations/20231001_create_indexes.sql

# Start the application
npm run dev
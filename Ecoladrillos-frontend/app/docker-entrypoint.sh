#!/bin/bash

echo "Starting Django application..."

if [ "$DATABASE" = "mysql" ]
then
    echo "Waiting for MySQL database..."
    echo "Checking connection to $SQL_HOST:$SQL_PORT"
    
    # Wait for MySQL to be ready
    while ! nc -z $SQL_HOST $SQL_PORT; do
      echo "MySQL is unavailable - sleeping"
      sleep 1
    done
    
    echo "MySQL is up - executing command"
fi

# Wait a bit more to ensure MySQL is fully ready
sleep 5

echo "Applying database migrations..."
python manage.py makemigrations 
python manage.py migrate

echo "Starting Django server..."
exec "$@"

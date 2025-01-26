release: PYTHONPATH=./backend python manage.py migrate
web: PYTHONPATH=./backend daphne -b 0.0.0.0 -p $PORT backend.core.asgi:application

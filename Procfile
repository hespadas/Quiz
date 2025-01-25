release: PYTHONPATH=./backend python backend/manage.py migrate
web: PYTHONPATH=./backend daphne -b 0.0.0.0 -p $PORT core.asgi:application

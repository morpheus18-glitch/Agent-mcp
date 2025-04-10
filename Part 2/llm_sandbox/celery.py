import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'llm_sandbox.settings')

app = Celery('llm_sandbox')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

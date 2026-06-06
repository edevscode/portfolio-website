import threading
import time
import logging
import urllib.request

from django.apps import AppConfig

logger = logging.getLogger(__name__)


def _keep_alive_loop(url: str, interval: int) -> None:
    while True:
        time.sleep(interval)
        try:
            urllib.request.urlopen(url, timeout=10)
            logger.info("Keep-alive ping sent to %s", url)
        except Exception as exc:
            logger.warning("Keep-alive ping failed: %s", exc)


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self) -> None:
        from django.conf import settings
        import os

        if settings.DEBUG:
            return

        base_url = os.environ.get('RENDER_EXTERNAL_URL', '').rstrip('/')
        if not base_url:
            return

        ping_url = f"{base_url}/"
        interval = 14 * 60  # 14 minutes — just under Render's 15-min inactivity timeout

        thread = threading.Thread(
            target=_keep_alive_loop,
            args=(ping_url, interval),
            daemon=True,
            name='render-keep-alive',
        )
        thread.start()
        logger.info("Render keep-alive thread started (pinging %s every %ds)", ping_url, interval)

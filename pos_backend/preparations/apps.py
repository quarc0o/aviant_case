from django.apps import AppConfig


class PreparationsConfig(AppConfig):
    name = 'preparations'

    def ready(self):
        import preparations.signals  # noqa: F401

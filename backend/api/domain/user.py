from models.domain import WorkerKind
import globals

def resolve_user(_, info, email=None, slug=None):
    if email is not None:
        return globals.omni_models.workers.get_by_email(email)
    elif slug is not None:
        return globals.omni_models.workers.get_by_slug(slug)
    else:
        return None
 
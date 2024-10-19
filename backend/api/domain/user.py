from models.domain import WorkerKind
import globals

def resolve_user(_, info, email=None):
    if email is not None:
        return globals.omni_models.workers.get_by_email(email)
    else:
        return None
 
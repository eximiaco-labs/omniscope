from models.domain import WorkerKind
import globals


def resolve_user(_, info, email=None, slug=None):
    if not email and not slug:
        return None

    worker = None
    if email:
        worker = globals.omni_models.workers.get_by_email(email)
    elif slug:
        worker = globals.omni_models.workers.get_by_slug(slug)

    if not worker:
        return None

    result = {
        "id": worker.id,
        "name": worker.name,
        "email": worker.email,
        "slug": worker.slug,
        "kind": worker.kind,
        "position": worker.position,
        "photo_url": worker.photo_url,
        # Add other attributes as needed
    }
    kind_map = {
        WorkerKind.ACCOUNT_MANAGER: "ACCOUNT_MANAGER",
        WorkerKind.CONSULTANT: "CONSULTANT"
    }
    result["kind"] = kind_map.get(result["kind"], result["kind"])

    return result
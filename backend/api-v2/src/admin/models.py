from pydantic import BaseModel, Field
from core.fields import Id
from omni_models.domain import WorkerKind

class User(BaseModel):
    email: str = Id(description="The email address of the user")
    slug: str = Id( description="The URL-friendly identifier of the user")
    
    name: str = Field(..., description="The name of the user") 
    kind: str = Field(..., description="The kind/role of the user")
    position: str = Field(..., description="The position/title of the user")
    photo_url: str = Field(..., description="The URL of the user's photo")

    @staticmethod
    def from_domain(worker):
        kind_map = {
            WorkerKind.ACCOUNT_MANAGER: "ACCOUNT_MANAGER",
            WorkerKind.CONSULTANT: "CONSULTANT"
        }
        
        return User(
            id=str(worker.id),
            name=worker.name,
            email=worker.email,
            slug=worker.slug,
            kind=kind_map.get(worker.kind, str(worker.kind)),
            position=worker.position,
            photo_url=worker.photo_url
        )

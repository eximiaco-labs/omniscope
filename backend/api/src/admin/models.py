from pydantic import BaseModel, Field
from core.fields import Id
from omni_models.domain import WorkerKind
from datetime import datetime
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
        
class CacheItem(BaseModel):
    key: str = Id(description="The key of the cache item")
    created_at: datetime = Field(..., description="The date and time the cache item was created")
    
class Inconsistence(BaseModel):
    entity_kind: str = Field(..., description="The entity that is inconsistent")
    entity: str = Field(..., description="The id of the entity that is inconsistent")
    description: str = Field(..., description="The description of the inconsistency")
    

from typing import Dict, List
from pydantic import BaseModel, Field
from core.fields import Id


class AccountManager(BaseModel):
    id: int = Id(description="The unique identifier of the account manager")
    slug: str = Id(description="URL-friendly identifier of the account manager")
    name: str = Field(..., description="The full name of the account manager")
    email: str = Field(..., description="The email address of the account manager")
    ontology_url: str = Field(..., description="The URL of the ontology entry of the account manager")
    photo_url: str = Field(..., description="The URL of the photo of the account manager")

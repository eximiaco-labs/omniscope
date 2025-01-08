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

# Mock data
account_managers: Dict[str, AccountManager] = {
    "1": AccountManager(
        id=1,
        slug="john-doe",
        name="John Doe",
        email="john.doe@company.com",
        ontology_url="https://ontology.company.com/john-doe",
        photo_url="https://photos.company.com/john-doe.jpg"
    ),
    "2": AccountManager(
        id=2,
        slug="jane-smith", 
        name="Jane Smith",
        email="jane.smith@company.com",
        ontology_url="https://ontology.company.com/jane-smith",
        photo_url="https://photos.company.com/jane-smith.jpg"
    ),
}

def get_account_managers() -> List[AccountManager]:
    return list(account_managers.values())

def get_account_manager_by_id(id: str) -> AccountManager | None:
    return account_managers.get(id)

def get_account_manager_by_slug(slug: str) -> AccountManager | None:
    return next(
        (manager for manager in account_managers.values() if manager.slug == slug),
        None
    ) 
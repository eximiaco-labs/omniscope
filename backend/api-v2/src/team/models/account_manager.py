from typing import Dict, List
from pydantic import BaseModel, Field
from .fields import Id

class AccountManager(BaseModel):
    id: str = Id(description="The unique identifier of the account manager")
    slug: str = Id(description="URL-friendly identifier of the account manager")
    name: str = Field(..., description="The full name of the account manager")
    age: int = Field(..., description="The age of the account manager")

# Mock data
account_managers: Dict[str, AccountManager] = {
    "1": AccountManager(id="1", slug="john-doe", name="John Doe", age=30),
    "2": AccountManager(id="2", slug="jane-smith", name="Jane Smith", age=25),
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
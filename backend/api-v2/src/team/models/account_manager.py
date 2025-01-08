from typing import Dict, List
from pydantic import BaseModel, Field

class AccountManager(BaseModel):
    id: str = Field(..., description="The unique identifier of the account manager")
    name: str = Field(..., description="The full name of the account manager")
    age: int = Field(..., description="The age of the account manager")

# Mock data
account_managers: Dict[str, AccountManager] = {
    "1": AccountManager(id="1", name="John Doe", age=30),
    "2": AccountManager(id="2", name="Jane Smith", age=25),
}

def get_account_managers() -> List[AccountManager]:
    return list(account_managers.values()) 
from pydantic import BaseModel
import omni_utils.helpers.slug as slug

class AccountManager(BaseModel):
    id: int
    name: str

    @property
    def slug(self) -> str:
        return slug.generate(self.name) 
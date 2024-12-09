from pydantic import BaseModel, HttpUrl
from typing import Optional, Dict

from omni_models.base.semanticmodel import SemanticModel
from omni_models.syntactic import Pipedrive, Person as PipedrivePerson

from omni_shared.settings import api_settings

from omni_utils.decorators import c4_external_system


class Person(BaseModel):
    id: int
    name: str
    job_title: Optional[str] = None
    photo_url: Optional[HttpUrl] = None

    company: Optional[str] = None
    linkedin_url: Optional[HttpUrl] = None

    primary_phone: Optional[str] = None
    primary_email: Optional[str] = None

    @staticmethod
    def from_pipedrive(source: PipedrivePerson) -> 'Person':
        return Person(
            id=source.id,
            name=source.name,
            job_title=source.job_title,
            photo_url=source.picture_url,
            company=source.company,
            linkedin_url=source.linkedin_url,
            primary_phone=source.primary_phone,
            primary_email=source.primary_email,
        )


@c4_external_system(
    "CRM (Pipedrive)",
    "Serves as the company's CRM system, golden source for Clients and Contact Infos"
)
class CRM(SemanticModel):
    def __init__(self, pipedrive=None):
        self.pipedrive = pipedrive or Pipedrive(api_settings["pipedrive_api_key"])

    @property
    def people(self) -> Dict[int, Person]:
        people = self.pipedrive.fetch_people()
        return {
            person.id: Person.from_pipedrive(person)
            for person in people
        }

    def find_person_by_name(self, name: str) -> Optional[Person]:
        return next((
            person
            for person in self.people.values()
            if person.name == name
        ), None)

from pydantic import BaseModel
from typing import Dict, Optional

from omni_models.semantic import CRM
from omni_models.domain.cases import CasesRepository
import omni_utils.helpers.slug as sl


class Sponsor(BaseModel):
    slug: str
    name: str
    photo_url: Optional[str] = '/images/who_is_it.jpeg'
    client_id: Optional[int] = None

    crm_id: Optional[str] = None
    job_title: Optional[str] = None
    linkedin_url: Optional[str] = None

    @property
    def omni_url(self):
        return f'sponsors/{self.slug}'


class SponsorsRepository:
    def __init__(self, cases_repository: CasesRepository, crm: CRM):
        self.cases_repository = cases_repository
        self.crm = crm
        self.__data = None

    def get_all(self) -> Dict[str, Sponsor]:
        if self.__data is None:
            self.__build_data()

        return self.__data

    def get_by_slug(self, slug: str) -> Sponsor:
        if self.__data is None:
            self.__build_data()

        return self.__data.get(slug)

    def __build_data(self):
        all_cases = self.cases_repository.get_all().values()

        def instantiate(sponsor_name: str, client_id: str):
            crm_person = self.crm.find_person_by_name(sponsor_name)

            result = Sponsor(
                slug=sl.generate(sponsor_name),
                name=sponsor_name,
                client_id=client_id
            )

            if crm_person:
                result.crm_id = crm_person.id
                result.job_title = crm_person.job_title

                if crm_person.photo_url:
                    result.photo_url = crm_person.photo_url

                result.linkedin_url = crm_person.linkedin_url

            return result

        self.__data = {
            sl.generate(sponsor): instantiate(sponsor, case.client_id)
            for case in all_cases
            if case.sponsor is not None and case.sponsor != 'N/A'
            for sponsor in case.sponsor.split(';')
        }

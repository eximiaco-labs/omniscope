from datetime import datetime
from pydantic import BaseModel

class TimesheetAppointment(BaseModel):
    date: datetime
    time_in_hs: float
    worker_name: str
    worker_slug: str
    client_id: str
    client_name: str
    case_id: str
    case_title: str
    project_id: str
    products_or_services: str
    kind: str
    sponsor: str
    account_manager_name: str
    account_manager_slug: str
    week: str 
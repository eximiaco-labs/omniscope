from typing import Optional
from pydantic import BaseModel, conint
from datetime import datetime
import pytz

class Appointment(BaseModel):
    id: int
    created_at: datetime
    date: datetime
    user_id: int
    comment: Optional[str] = None
    time: conint(ge=0)
    project_id: str

    @property
    def created_at_sp(self) -> datetime:
        utc_timezone = pytz.utc
        utc_time = utc_timezone.localize(self.created_at)
        sp_timezone = pytz.timezone('America/Sao_Paulo')
        sp_time = utc_time.astimezone(sp_timezone)
        return sp_time

    class Config:
        population_by_name = True

    @staticmethod
    def from_json(json):
        return Appointment(
            id=json['id'],
            created_at=json['createdAt'],
            date=datetime.strptime(json['date'], "%Y-%m-%d"),
            comment=json['comment'] if 'comment' in json else None,
            user_id=json['user'],
            time=int(json['time']),
            project_id=json['task']['projects'][0]
        ) 
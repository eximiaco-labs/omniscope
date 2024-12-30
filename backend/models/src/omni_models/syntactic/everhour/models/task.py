from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class Task(BaseModel):
    id: str
    name: str
    due_on: Optional[datetime] = None
    projects: List[str]
    
    @staticmethod
    def from_json(json):
        return Task(
            id=json['id'],
            name=json['name'],
            due_on=datetime.strptime(json['dueOn'], "%Y-%m-%d") if json.get('dueOn') else None,
            projects=json['projects']
        ) 
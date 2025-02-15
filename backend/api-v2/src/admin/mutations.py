from pydantic import BaseModel
from datetime import datetime
from omni_utils.decorators.cache import forget
from omni_shared import globals

class Mutations(BaseModel):
    @staticmethod
    def invalidate_cache(key: str):
        try:
            forget(key)
            globals.update()
            return True
        except Exception as e:
            print(f"Error invalidating cache: {str(e)}")
            return False

    @staticmethod
    def invalidate_timesheet_cache(after: datetime, before: datetime):
        try:
            globals.omni_datasets.timesheets.memory.invalidate(after, before)
            return True
        except Exception as e:
            print(f"Error invalidating timesheet cache: {str(e)}")
            return False
    
    @staticmethod
    def force_update_globals():
        try:
            globals.update()
            return True
        except Exception as e:
            print(f"Error restarting globals: {str(e)}")
            return False

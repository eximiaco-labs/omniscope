from ariadne import MutationType
from omni_shared import globals
from omni_utils.decorators.cache import forget

mutation = MutationType()

@mutation.field("refreshData")
def resolve_refresh_data(_, info):
    try:
        globals.update()
        return True
    except Exception as e:
        print(f"Error refreshing data: {str(e)}")
        return False
    
@mutation.field("invalidateCache")
def resolve_invalidate_cache(_, info, key: str):
    try:
        forget(key)
        globals.update()
        return True
    except Exception as e:
        print(f"Error invalidating cache: {str(e)}")
        return False

@mutation.field("invalidateTimesheetCache")
def resolve_invalidate_timesheet_cache(_, info, after = None, before = None):
    try:
        globals.omni_datasets.timesheets.memory.invalidate(after, before)
        return True
    except Exception as e:
        print(f"Error invalidating timesheet cache: {str(e)}")
        return False

__all__ = ['mutation']

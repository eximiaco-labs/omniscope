from ariadne import MutationType
import globals

mutation = MutationType()

@mutation.field("refreshData")
def resolve_refresh_data(_, info):
    try:
        globals.update()
        return True
    except Exception as e:
        print(f"Error refreshing data: {str(e)}")
        return False

__all__ = ['mutation']

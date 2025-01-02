from datetime import datetime
from omni_models.base.powerdataframe import SummarizablePowerDataFrame

class TimesheetMemoryCache:
    def __init__(self):
        self.cache = []

    def get(self, after: datetime, before: datetime) -> SummarizablePowerDataFrame:
        for m in self.cache:
            if m['after'] <= after and m['before'] >= before:
                df = m['result'].data
                df = df[df['Date'] >= after.date()]
                df = df[df['Date'] <= before.date()]
                return SummarizablePowerDataFrame(df)
        return None
    
    def add(self, after: datetime, before: datetime, result: SummarizablePowerDataFrame):
        self.cache.append({
            "after": after,
            "before": before,
            "result": result, 
            "created_at": datetime.now()
        })

    def list_cache(self, after, before):
        if after:
            if isinstance(after, str):
                after = datetime.strptime(after, '%Y-%m-%d').date()
            elif isinstance(after, datetime):
                after = after.date()
                
        if before:
            if isinstance(before, str):
                before = datetime.strptime(before, '%Y-%m-%d').date()
            elif isinstance(before, datetime):
                before = before.date()
        
        return [
            {
                "after": m['after'],
                "before": m['before'],
                "created_at": m['created_at']
            }
            for m in self.cache
            if (after is None or after >= m['after']) and (before is None or before <= m['before'])
        ]
        
    def invalidate(self, after, before):
        if after:
            if isinstance(after, str):
                after = datetime.strptime(after, '%Y-%m-%d').date()
            elif isinstance(after, datetime):
                after = after.date()
                
        if before:
            if isinstance(before, str):
                before = datetime.strptime(before, '%Y-%m-%d').date()
            elif isinstance(before, datetime):
                before = before.date()
                
        self.cache = [
            m 
            for m in self.cache 
            if (after is None or after >= m['after']) and (before is None or before <= m['before'])
        ] 
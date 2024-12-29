from datetime import datetime
from dataclasses import dataclass
from typing import Dict, Any

from omni_models.analytics.forecast import ForecastDates, ForecastNumberOfWorkingDays
from omni_models.omnidatasets import SummarizablePowerDataFrame
from omni_shared import globals
import pandas as pd

contexts_dates = [
    "date_of_interest", 
    "last_day_of_last_month", 
    "last_day_of_two_months_ago", 
    "last_day_of_three_months_ago", 
    "same_day_last_month", 
    "same_day_two_months_ago", 
    "same_day_three_months_ago"
    ]

contexts_allocations = [
    "in_analysis",
    "one_month_ago",
    "same_day_one_month_ago",
    "two_months_ago",
    "same_day_two_months_ago",
    "three_months_ago",
    "same_day_three_months_ago" 
]


@dataclass
class ConsultantAllocation:
    # Basic info
    name: str
    slug: str
    
    # Current period values
    in_analysis: float = 0
    one_month_ago: float = 0
    same_day_one_month_ago: float = 0
    two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    
    # Projections
    expected_historical: float = 0
    
    def get(self, context: str = None, idx: int = 0) -> pd.DataFrame:
        if context is None:
            context = contexts_dates[idx]
            
        return getattr(self, context)
    
    def set(self, context: str = None, idx: int = 0, value: float = 0):
        if context is None:
            context = contexts_allocations[idx]
            
        if context == "date_of_interest":
            context = "in_analysis"
            
        setattr(self, context, value)
        
@dataclass
class InConsultingTimesheets:
    date_of_interest: pd.DataFrame
    last_day_of_last_month: pd.DataFrame
    last_day_of_two_months_ago: pd.DataFrame
    last_day_of_three_months_ago: pd.DataFrame
    same_day_last_month: pd.DataFrame
    same_day_two_months_ago: pd.DataFrame
    same_day_three_months_ago: pd.DataFrame
    
    def get(self, context: str = None, idx: int = 0) -> pd.DataFrame:
        if context is None:
            context = contexts_dates[idx]
            
        if context == "date_of_interest":
            return self.date_of_interest
        elif context == "last_day_of_last_month":
            return self.last_day_of_last_month
        elif context == "last_day_of_two_months_ago":
            return self.last_day_of_two_months_ago
        elif context == "last_day_of_three_months_ago":
            return self.last_day_of_three_months_ago
        elif context == "same_day_last_month":
            return self.same_day_last_month
        elif context == "same_day_two_months_ago":
            return self.same_day_two_months_ago
        elif context == "same_day_three_months_ago":
            return self.same_day_three_months_ago
        else:
            raise ValueError(f"Invalid context: {context}")
    
    def __init__(self, forecast_dates: ForecastDates, filters: Dict[str, Any]):
        def get_timesheet(d: datetime) -> pd.DataFrame:
            start_date = d.replace(day=1, hour=0, minute=0, second=0)
            end_date = d.replace(hour=23, minute=59, second=59)
            dataset_slug = f"timesheet-{start_date.strftime('%d-%m-%Y')}-{end_date.strftime('%d-%m-%Y')}"
            dataset = globals.omni_datasets.get_by_slug(dataset_slug)
            
            df = dataset.data
            df = df[df["Kind"] == "Consulting"]
            df, result = globals.omni_datasets.apply_filters(
                globals.omni_datasets.timesheets,
                df,
                filters
            )
            
            return df
        self.date_of_interest = get_timesheet(forecast_dates.in_analysis)
        self.last_day_of_last_month = get_timesheet(forecast_dates.last_day_of_one_month_ago)
        self.last_day_of_two_months_ago = get_timesheet(forecast_dates.last_day_of_two_months_ago)
        self.last_day_of_three_months_ago = get_timesheet(forecast_dates.last_day_of_three_months_ago)
        self.same_day_last_month = get_timesheet(forecast_dates.same_day_one_month_ago)
        self.same_day_two_months_ago = get_timesheet(forecast_dates.same_day_two_months_ago)
        self.same_day_three_months_ago = get_timesheet(forecast_dates.same_day_three_months_ago)
        
def resolve_in_consulting(_, info, date_of_interest = None, filters = None):
    if date_of_interest is None:
        date_of_interest = datetime.now()

    if isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')
        
    result = {}
        
    forecast_dates = ForecastDates(date_of_interest)
    forecast_working_days = ForecastNumberOfWorkingDays(date_of_interest, forecast_dates)
    in_consulting_timesheets = InConsultingTimesheets(forecast_dates, filters)
    
    consutants = {}
    
    for i in range(7):
        df = in_consulting_timesheets.get(idx=i)
        
        if len(df) > 0:
            summary = df.groupby(["WorkerName", "WorkerSlug"])["TimeInHs"].sum().reset_index()
            for _, row in summary.iterrows():
                worker_name = row["WorkerName"]
                if worker_name not in consutants:
                    consutants[worker_name] = ConsultantAllocation(
                        name=worker_name,
                        slug=row["WorkerSlug"]
                    )
                consutants[worker_name].set(idx=i, value=row["TimeInHs"])
    
    consultants = sorted(list(consutants.values()), key=lambda x: x.name)
    result["working_days"] = forecast_working_days
    result["by_worker"] = consultants
    result["dates"] = forecast_dates
    
    return result
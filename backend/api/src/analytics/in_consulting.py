from datetime import datetime
from dataclasses import dataclass
from typing import Dict, Any, List, Optional

from omni_models.analytics.forecast import ForecastDates, ForecastNumberOfWorkingDays
from omni_models.omnidatasets import SummarizablePowerDataFrame
from omni_shared import globals
import pandas as pd

contexts_dates: List[str] = [
    "date_of_interest", 
    "last_day_of_last_month", 
    "same_day_last_month", 
    "last_day_of_two_months_ago",
    "same_day_two_months_ago",
    "last_day_of_three_months_ago",
    "same_day_three_months_ago"
    ]

contexts_allocations: List[str] = [
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
    normalized_in_analysis: float = 0   
    one_month_ago: float = 0
    normalized_one_month_ago: float = 0
    same_day_one_month_ago: float = 0
    normalized_same_day_one_month_ago: float = 0
    two_months_ago: float = 0
    normalized_two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    normalized_same_day_two_months_ago: float = 0
    three_months_ago: float = 0
    normalized_three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    normalized_same_day_three_months_ago: float = 0
    
    # Projections
    projected: float = 0
    normalized_projected: float = 0
    expected_historical: float = 0
    normalized_expected_historical: float = 0
    
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
    
    def get(self, context: Optional[str] = None, idx: int = 0) -> pd.DataFrame:
        if context is None:
            context = contexts_dates[idx]
            
        if not hasattr(self, context):
            raise ValueError(f"Invalid context: {context}")
            
        return getattr(self, context)
    
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
        
def resolve_in_consulting(
    _,
    info,
    date_of_interest: Optional[datetime] = None,
    filters: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    if date_of_interest is None:
        date_of_interest = datetime.now()
    elif isinstance(date_of_interest, str):
        date_of_interest = datetime.strptime(date_of_interest, '%Y-%m-%d')
        
    result = {}
        
    forecast_dates = ForecastDates(date_of_interest)
    forecast_working_days = ForecastNumberOfWorkingDays(date_of_interest, forecast_dates)
    in_consulting_timesheets = InConsultingTimesheets(forecast_dates, filters)
    
    consultants = {}
    
    for i in range(7):
        df = in_consulting_timesheets.get(idx=i)
        
        if len(df) > 0:
            summary = df.groupby(["WorkerName", "WorkerSlug"])["TimeInHs"].sum().reset_index()
            for _, row in summary.iterrows():
                worker_name = row["WorkerName"]
                if worker_name not in consultants:
                    consultants[worker_name] = ConsultantAllocation(
                        name=worker_name,
                        slug=row["WorkerSlug"]
                    )
                    
                consultants[worker_name].set(idx=i, value=row["TimeInHs"])
                num_working_days = getattr(forecast_working_days, contexts_allocations[i]) if i != 0 else forecast_working_days.in_analysis_partial
                consultants[worker_name].set(context=f"normalized_{contexts_allocations[i]}", value=row["TimeInHs"] / num_working_days)
                
    for consultant in consultants.values():
        consultant.projected = consultant.in_analysis / forecast_working_days.in_analysis_partial * forecast_working_days.in_analysis
                
        previous_value = consultant.one_month_ago
        two_months_ago_value = consultant.two_months_ago
        three_months_ago_value = consultant.three_months_ago
                
        if previous_value == 0 and two_months_ago_value == 0 and three_months_ago_value == 0:
            consultant.expected_historical = consultant.projected if consultant.projected else 0
        elif two_months_ago_value == 0 and three_months_ago_value == 0:
            consultant.expected_historical = previous_value
        elif three_months_ago_value == 0:
            consultant.expected_historical = previous_value * 0.8 + two_months_ago_value * 0.2
        else:
            consultant.expected_historical = previous_value * 0.6 + two_months_ago_value * 0.25 + three_months_ago_value * 0.15
                
        consultant.normalized_expected_historical = consultant.expected_historical / forecast_working_days.in_analysis
        # O valor normalizado projetado deve ser igual à média diária
        consultant.normalized_projected = consultant.projected / forecast_working_days.in_analysis
           
    consultants = sorted(list(consultants.values()), key=lambda x: x.name)
    totals = ConsultantAllocation(
        name="Total",
        slug="total"
    )
    
    for consultant in consultants:
        totals.in_analysis += consultant.in_analysis
        totals.normalized_in_analysis += consultant.normalized_in_analysis
        totals.one_month_ago += consultant.one_month_ago
        totals.normalized_one_month_ago += consultant.normalized_one_month_ago
        totals.same_day_one_month_ago += consultant.same_day_one_month_ago
        totals.normalized_same_day_one_month_ago += consultant.normalized_same_day_one_month_ago
        totals.two_months_ago += consultant.two_months_ago
        totals.normalized_two_months_ago += consultant.normalized_two_months_ago
        totals.same_day_two_months_ago += consultant.same_day_two_months_ago
        totals.normalized_same_day_two_months_ago += consultant.normalized_same_day_two_months_ago
        totals.three_months_ago += consultant.three_months_ago
        totals.normalized_three_months_ago += consultant.normalized_three_months_ago
        totals.same_day_three_months_ago += consultant.same_day_three_months_ago
        totals.normalized_same_day_three_months_ago += consultant.normalized_same_day_three_months_ago
        totals.projected += consultant.projected
        totals.normalized_projected += consultant.normalized_projected
        totals.expected_historical += consultant.expected_historical
        totals.normalized_expected_historical += consultant.normalized_expected_historical
    
    result["working_days"] = forecast_working_days
    result["totals"] = totals
    result["by_worker"] = consultants
    result["dates"] = forecast_dates
    
    return result
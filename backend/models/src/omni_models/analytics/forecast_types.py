from dataclasses import dataclass
from typing import Optional, List

@dataclass
class ConsultantForecast:
    # Basic info
    name: str
    slug: str
    
    # Current period values
    in_analysis: float = 0
    in_analysis_consulting_hours: float = 0
    in_analysis_consulting_pre_hours: float = 0
    
    # One month ago values
    one_month_ago: float = 0
    same_day_one_month_ago: float = 0
    one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_pre_hours: float = 0
    same_day_one_month_ago_consulting_hours: float = 0
    
    # Two months ago values
    two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_pre_hours: float = 0
    same_day_two_months_ago_consulting_hours: float = 0
    
    # Three months ago values
    three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_pre_hours: float = 0
    same_day_three_months_ago_consulting_hours: float = 0
    
    # Projections
    projected: float = 0
    expected_historical: float = 0

@dataclass
class ProjectForecast:
    # Basic info
    name: str
    slug: str
    case_slug: str
    
    # Current period values
    in_analysis: float = 0
    in_analysis_consulting_hours: float = 0
    in_analysis_consulting_pre_hours: float = 0
    in_analysis_consulting_fee_new: float = 0
    
    # One month ago values
    one_month_ago: float = 0
    same_day_one_month_ago: float = 0
    one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_pre_hours: float = 0
    same_day_one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_fee_new: float = 0
    same_day_one_month_ago_consulting_fee_new: float = 0
    
    # Two months ago values
    two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_pre_hours: float = 0
    same_day_two_months_ago_consulting_hours: float = 0
    same_day_two_months_ago_consulting_pre_hours: float = 0
    two_months_ago_consulting_fee_new: float = 0
    same_day_two_months_ago_consulting_fee_new: float = 0
    
    # Three months ago values
    three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_pre_hours: float = 0
    same_day_three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_fee_new: float = 0
    same_day_three_months_ago_consulting_fee_new: float = 0
    
    # Projections
    projected: float = 0
    expected_historical: float = 0

@dataclass
class CaseForecast:
    # Basic info
    title: str
    slug: str
    sponsor_slug: str
    client_slug: str
    consulting_fee_new: float = 0
    
    # Current period values
    in_analysis: float = 0
    in_analysis_consulting_hours: float = 0
    in_analysis_consulting_pre_hours: float = 0
    in_analysis_consulting_fee_new: float = 0
    
    # One month ago values
    one_month_ago: float = 0
    same_day_one_month_ago: float = 0
    one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_pre_hours: float = 0
    same_day_one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_fee_new: float = 0
    same_day_one_month_ago_consulting_fee_new: float = 0
    
    # Two months ago values
    two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_pre_hours: float = 0
    same_day_two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_fee_new: float = 0
    same_day_two_months_ago_consulting_fee_new: float = 0
    
    # Three months ago values
    three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_pre_hours: float = 0
    same_day_three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_fee_new: float = 0
    same_day_three_months_ago_consulting_fee_new: float = 0
    
    # Projections
    projected: float = 0
    expected: float = 0
    expected_one_month_later: float = 0
    expected_two_months_later: float = 0
    expected_three_months_later: float = 0
    expected_historical: float = 0

@dataclass
class SponsorForecast:
    # Basic info
    name: str
    slug: str
    client_slug: str
    
    # Current period values
    in_analysis: float = 0
    in_analysis_consulting_hours: float = 0
    in_analysis_consulting_pre_hours: float = 0
    in_analysis_consulting_fee_new: float = 0
    
    # One month ago values
    one_month_ago: float = 0
    same_day_one_month_ago: float = 0
    one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_pre_hours: float = 0
    same_day_one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_fee_new: float = 0
    same_day_one_month_ago_consulting_fee_new: float = 0
    
    # Two months ago values
    two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_pre_hours: float = 0
    same_day_two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_fee_new: float = 0
    same_day_two_months_ago_consulting_fee_new: float = 0
    
    # Three months ago values
    three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_pre_hours: float = 0
    same_day_three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_fee_new: float = 0
    same_day_three_months_ago_consulting_fee_new: float = 0
    
    # Projections
    projected: float = 0
    expected: float = 0
    expected_one_month_later: float = 0
    expected_two_months_later: float = 0
    expected_three_months_later: float = 0
    expected_historical: float = 0

@dataclass
class ClientForecast:
    # Basic info
    name: str
    slug: str
    
    # Current period values
    in_analysis: float = 0
    in_analysis_consulting_hours: float = 0
    in_analysis_consulting_pre_hours: float = 0
    in_analysis_consulting_fee_new: float = 0
    
    # One month ago values
    one_month_ago: float = 0
    same_day_one_month_ago: float = 0
    one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_pre_hours: float = 0
    same_day_one_month_ago_consulting_hours: float = 0
    one_month_ago_consulting_fee_new: float = 0
    same_day_one_month_ago_consulting_fee_new: float = 0
    
    # Two months ago values
    two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_pre_hours: float = 0
    same_day_two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_fee_new: float = 0
    same_day_two_months_ago_consulting_fee_new: float = 0
    
    # Three months ago values
    three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_pre_hours: float = 0
    same_day_three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_fee_new: float = 0
    same_day_three_months_ago_consulting_fee_new: float = 0
    
    # Projections
    projected: float = 0
    expected: float = 0
    expected_one_month_later: float = 0
    expected_two_months_later: float = 0
    expected_three_months_later: float = 0
    expected_historical: float = 0

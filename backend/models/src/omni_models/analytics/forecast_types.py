from dataclasses import dataclass
from typing import Optional, List

from datetime import date
from pydantic import BaseModel

class ConsultantForecast(BaseModel):
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
    same_day_one_month_ago_consulting_pre_hours: float = 0
    
    # Two months ago values
    two_months_ago: float = 0
    same_day_two_months_ago: float = 0
    two_months_ago_consulting_hours: float = 0
    two_months_ago_consulting_pre_hours: float = 0
    same_day_two_months_ago_consulting_hours: float = 0
    same_day_two_months_ago_consulting_pre_hours: float = 0
    
    # Three months ago values
    three_months_ago: float = 0
    same_day_three_months_ago: float = 0
    three_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_pre_hours: float = 0
    same_day_three_months_ago_consulting_hours: float = 0
    same_day_three_months_ago_consulting_pre_hours: float = 0
    
    # Projections
    projected: float = 0
    expected_historical: float = 0

class ProjectForecast(BaseModel):
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
    expected: float = 0
    expected_one_month_later: float = 0
    expected_two_months_later: float = 0
    expected_three_months_later: float = 0
    expected_historical: float = 0

class CaseForecast(BaseModel):
    # Basic info
    title: str
    slug: str
    sponsor_slug: str
    client_slug: str
    
    start_of_contract: Optional[date] = None
    end_of_contract: Optional[date] = None
    weekly_approved_hours: float = 0
    
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

class SponsorForecast(BaseModel):
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

class ClientForecast(BaseModel):
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

class Totals(BaseModel):
    # Basic values
    in_analysis: float = 0
    one_month_ago: float = 0
    two_months_ago: float = 0
    three_months_ago: float = 0
    same_day_one_month_ago: float = 0
    same_day_two_months_ago: float = 0
    same_day_three_months_ago: float = 0
    
    # Projections
    projected: float = 0
    expected: float = 0
    expected_one_month_later: float = 0
    expected_two_months_later: float = 0
    expected_three_months_later: float = 0
    expected_historical: float = 0
    
    # Consulting hours
    in_analysis_consulting_hours: float = 0
    one_month_ago_consulting_hours: float = 0
    two_months_ago_consulting_hours: float = 0
    three_months_ago_consulting_hours: float = 0
    same_day_one_month_ago_consulting_hours: float = 0
    same_day_two_months_ago_consulting_hours: float = 0
    same_day_three_months_ago_consulting_hours: float = 0
    
    # Consulting pre hours
    in_analysis_consulting_pre_hours: float = 0
    one_month_ago_consulting_pre_hours: float = 0
    two_months_ago_consulting_pre_hours: float = 0
    three_months_ago_consulting_pre_hours: float = 0
    
    # Consulting fees
    in_analysis_consulting_fee_new: float = 0
    one_month_ago_consulting_fee_new: float = 0
    two_months_ago_consulting_fee_new: float = 0
    three_months_ago_consulting_fee_new: float = 0
    same_day_one_month_ago_consulting_fee_new: float = 0
    same_day_two_months_ago_consulting_fee_new: float = 0
    same_day_three_months_ago_consulting_fee_new: float = 0

    @classmethod
    def build(cls, by_client: list[ClientForecast]) -> 'Totals':
        return cls(
            # Basic values
            in_analysis=sum(client.in_analysis for client in by_client),
            one_month_ago=sum(client.one_month_ago for client in by_client),
            two_months_ago=sum(client.two_months_ago for client in by_client),
            three_months_ago=sum(client.three_months_ago for client in by_client),
            same_day_one_month_ago=sum(client.same_day_one_month_ago for client in by_client),
            same_day_two_months_ago=sum(client.same_day_two_months_ago for client in by_client),
            same_day_three_months_ago=sum(client.same_day_three_months_ago for client in by_client),
            
            # Projections
            projected=sum(client.projected for client in by_client),
            expected=sum(client.expected for client in by_client),
            expected_one_month_later=sum(client.expected_one_month_later for client in by_client),
            expected_two_months_later=sum(client.expected_two_months_later for client in by_client),
            expected_three_months_later=sum(client.expected_three_months_later for client in by_client),
            expected_historical=sum(client.expected_historical for client in by_client),
            
            # Consulting hours
            in_analysis_consulting_hours=sum(client.in_analysis_consulting_hours for client in by_client),
            one_month_ago_consulting_hours=sum(client.one_month_ago_consulting_hours for client in by_client),
            two_months_ago_consulting_hours=sum(client.two_months_ago_consulting_hours for client in by_client),
            three_months_ago_consulting_hours=sum(client.three_months_ago_consulting_hours for client in by_client),
            same_day_one_month_ago_consulting_hours=sum(client.same_day_one_month_ago_consulting_hours for client in by_client),
            same_day_two_months_ago_consulting_hours=sum(client.same_day_two_months_ago_consulting_hours for client in by_client),
            same_day_three_months_ago_consulting_hours=sum(client.same_day_three_months_ago_consulting_hours for client in by_client),
            
            # Consulting pre hours
            in_analysis_consulting_pre_hours=sum(client.in_analysis_consulting_pre_hours for client in by_client),
            one_month_ago_consulting_pre_hours=sum(client.one_month_ago_consulting_pre_hours for client in by_client),
            two_months_ago_consulting_pre_hours=sum(client.two_months_ago_consulting_pre_hours for client in by_client),
            three_months_ago_consulting_pre_hours=sum(client.three_months_ago_consulting_pre_hours for client in by_client),
            
            # Consulting fees
            in_analysis_consulting_fee_new=sum(client.in_analysis_consulting_fee_new for client in by_client),
            one_month_ago_consulting_fee_new=sum(client.one_month_ago_consulting_fee_new for client in by_client),
            two_months_ago_consulting_fee_new=sum(client.two_months_ago_consulting_fee_new for client in by_client),
            three_months_ago_consulting_fee_new=sum(client.three_months_ago_consulting_fee_new for client in by_client),
            same_day_one_month_ago_consulting_fee_new=sum(client.same_day_one_month_ago_consulting_fee_new for client in by_client),
            same_day_two_months_ago_consulting_fee_new=sum(client.same_day_two_months_ago_consulting_fee_new for client in by_client),
            same_day_three_months_ago_consulting_fee_new=sum(client.same_day_three_months_ago_consulting_fee_new for client in by_client)
        )



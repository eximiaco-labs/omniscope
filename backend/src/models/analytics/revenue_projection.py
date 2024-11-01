from datetime import datetime, date
import pandas as pd
import calendar
from typing import List

from models.analytics.approved_vs_actual import compute_approved_vs_actual
import globals
from dataclasses import dataclass

@dataclass
class CaseInfo:
    id: str
    title: str
    total_expected_work_hours: List[float]
    pre_contracted_expected_work_hours: List[float]

@dataclass
class MonthInfo:
    date_of_interest: datetime
    total_expected_work_hours: List[float]
    pre_contracted_expected_work_hours: List[float]
    by_case: List[CaseInfo]

def compute_revenue_projection(date_of_interest: str | date) -> MonthInfo:
    # Convertendo para datetime se necessário
    if isinstance(date_of_interest, str):
        date_of_interest = datetime.fromisoformat(date_of_interest).date()
    
    # Obtendo início e fim do mês
    start = date_of_interest.replace(day=1)
    _, last_day = calendar.monthrange(date_of_interest.year, date_of_interest.month)
    end = date_of_interest.replace(day=last_day)

    approved_vs_actual = compute_approved_vs_actual(start, end)

    # Inicializando resultado
    result = MonthInfo(
        date_of_interest=date_of_interest,
        total_expected_work_hours=[0] * last_day,
        pre_contracted_expected_work_hours=[0] * last_day,
        by_case=[]
    )

    for case in approved_vs_actual.cases:
        case_ = globals.omni_models.cases.get_by_id(case.id)
        case_info = CaseInfo(
            id=case.id,
            title=case.title,
            total_expected_work_hours=[0] * last_day,
            pre_contracted_expected_work_hours=[0] * last_day
        )

        for week in case.weeks:
            week_start = week.start
            week_end = week.end
            is_first_week = week_start <= start <= week_end
            
            # Na primeira semana do mês, usamos difference para considerar horas já executadas
            approved_hours = week.difference if is_first_week else week.approved_hours
            if approved_hours < 0:
                approved_hours = 0

            # Calculando dias úteis na semana dentro do mês
            working_days_in_week = sum(1 for d in pd.date_range(week_start, week_end) 
                                     if d.month == date_of_interest.month and d.weekday() < 5)
            
            # Se não houver dias úteis, pula a semana
            if working_days_in_week == 0:
                continue

            # Distribuindo as horas pelos dias úteis
            daily_hours = approved_hours / working_days_in_week
            
            current_date = week_start
            while current_date <= week_end:
                if current_date.month != date_of_interest.month:
                    current_date += pd.Timedelta(days=1)
                    continue

                if current_date.weekday() >= 5:  # Saturday (5) or Sunday (6)
                    current_date += pd.Timedelta(days=1)
                    continue
                    
                day_of_month = current_date.day
                case_info.total_expected_work_hours[day_of_month - 1] = daily_hours
                result.total_expected_work_hours[day_of_month - 1] += daily_hours
                
                if case_.pre_contracted_value:
                    result.pre_contracted_expected_work_hours[day_of_month - 1] += daily_hours
                    case_info.pre_contracted_expected_work_hours[day_of_month - 1] += daily_hours

                current_date += pd.Timedelta(days=1)

        result.by_case.append(case_info)

    return result
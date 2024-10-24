import calendar
from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Tuple

from models.base.powerdataframe import SummarizablePowerDataFrame
from models.helpers.weeks import Weeks


class OmniDataset(ABC):

    @abstractmethod
    def get(self, after: datetime, before: datetime) -> SummarizablePowerDataFrame:
        pass

    @abstractmethod
    def get_common_fields(self) -> List[str]:
        pass

    @abstractmethod
    def get_all_fields(self) -> List[str]:
        pass

    @abstractmethod
    def get_treemap_path(self) -> Tuple[str, List[str]]:
        pass

    @abstractmethod
    def get_filterable_fields(self) -> List[str]:
        pass

    def get_last_six_weeks(self, reference_date: datetime = None) -> SummarizablePowerDataFrame:
        after, before = Weeks.get_n_weeks_dates(6, reference_date)
        return self.get(after, before)

    def get_specific_month(self, year: int, month: int) -> SummarizablePowerDataFrame:
        start_date = datetime(year, month, 1, microsecond=0)
        last_day = calendar.monthrange(year, month)[1]
        end_date = datetime(year, month, last_day, 23, 59, 59, microsecond=999999)
        return self.get(start_date, end_date)

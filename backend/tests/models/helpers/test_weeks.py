import pytest
from datetime import datetime, timedelta
import re
from models.helpers.weeks import Weeks

def test_get_week_dates():
    test_date = datetime(2023, 5, 10)  # Wednesday
    start, end = Weeks.get_week_dates(test_date)
    assert start == datetime(2023, 5, 7)  # Sunday
    assert end == datetime(2023, 5, 13, 23, 59, 59, 999999)  # Saturday

def test_get_current_dates():
    start, end = Weeks.get_current_dates()
    assert start.weekday() == 6  # Sunday
    assert end.weekday() == 5  # Saturday

def test_get_previous_dates():
    current_start, _ = Weeks.get_current_dates()
    prev_start, prev_end = Weeks.get_previous_dates()
    assert current_start - prev_end == timedelta(microseconds=1)

def test_get_previous_string():
    prev_string = Weeks.get_previous_string()
    assert re.match(r'\d{2}/\d{2} - \d{2}/\d{2}', prev_string)

def test_get_n_weeks_dates():
    end_date = datetime(2023, 5, 13)  # Saturday
    start, end = Weeks.get_n_weeks_dates(4, end_date)
    assert start == datetime(2023, 4, 9)
    assert end == datetime(2023, 5, 13, 23, 59, 59, 999999)

def test_get_current_string():
    current_string = Weeks.get_current_string()
    assert re.match(r'\d{2}/\d{2} - \d{2}/\d{2}', current_string)

def test_get_week_string():
    test_date = datetime(2023, 5, 10)
    week_string = Weeks.get_week_string(test_date)
    assert week_string == '07/05 - 13/05'

@pytest.mark.parametrize("start, end, expected", [
    (datetime(2023, 5, 7), datetime(2023, 5, 13), '07/05 - 13/05'),
    ('2023-05-07', '2023-05-13', '07/05 - 13/05'),
])
def test_to_string(start, end, expected):
    assert Weeks.to_string(start, end) == expected

import pytest
from datetime import datetime
from models.helpers.beauty import beautify, format_date_with_suffix, convert_to_label

def test_beautify():
    assert beautify(3.14159) == '3.1'
    assert beautify(42) == 42
    assert beautify('hello') == 'hello'

@pytest.mark.parametrize("date, expected", [
    (datetime(2023, 5, 1), 'May 1st'),
    (datetime(2023, 5, 2), 'May 2nd'),
    (datetime(2023, 5, 3), 'May 3rd'),
    (datetime(2023, 5, 4), 'May 4th'),
    (datetime(2023, 5, 11), 'May 11th'),
    (datetime(2023, 5, 21), 'May 21st'),
    ('-', '-'),
])
def test_format_date_with_suffix(date, expected):
    assert format_date_with_suffix(date) == expected

@pytest.mark.parametrize("input_text, expected", [
    ('customerName', 'customer'),
    ('FirstName', 'First'),
    ('LastNameSuffix', 'Last Name Suffix'),
])
def test_convert_to_label(input_text, expected):
    assert convert_to_label(input_text) == expected

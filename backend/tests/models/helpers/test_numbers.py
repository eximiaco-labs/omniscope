import pytest
from models.helpers.numbers import can_convert_to_int

@pytest.mark.parametrize("input_str, expected", [
    ('123', True),
    ('-456', True),
    ('0', True),
    ('12.34', False),
    ('abc', False),
    ('', False),
    ('1.23e4', False),
])
def test_can_convert_to_int(input_str, expected):
    assert can_convert_to_int(input_str) == expected

import pytest
from models.helpers.list import find_first_occurrence

@pytest.fixture
def test_list():
    return [
        {'key': 'A', 'value': 1},
        {'key': 'B', 'value': 2},
        {'key': 'C', 'value': 3}
    ]

def test_find_first_occurrence(test_list):
    assert find_first_occurrence(test_list, 'B') == {'key': 'B', 'value': 2}
    assert find_first_occurrence(test_list, 'D') is None

def test_find_first_occurrence_custom_key():
    test_list_custom = [
        {'id': 'A', 'value': 1},
        {'id': 'B', 'value': 2},
        {'id': 'C', 'value': 3}
    ]
    assert find_first_occurrence(test_list_custom, 'B', key='id') == {'id': 'B', 'value': 2}

def test_find_first_occurrence_dict_input():
    test_dict = {'A': 1, 'B': 2, 'C': 3}
    assert find_first_occurrence(test_dict, 'B') == 2
    assert find_first_occurrence(test_dict, 'D') is None

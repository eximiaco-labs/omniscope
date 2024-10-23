import pytest
from models.helpers.dict import invert_dict

def test_invert_dict():
    input_dict = {
        'A': [1, 2, 3],
        'B': [2, 3, 4],
        'C': [3, 4, 5]
    }
    expected_output = {
        1: ['A'],
        2: ['A', 'B'],
        3: ['A', 'B', 'C'],
        4: ['B', 'C'],
        5: ['C']
    }
    assert invert_dict(input_dict) == expected_output

def test_invert_dict_empty():
    assert invert_dict({}) == {}

def test_invert_dict_single_pair():
    assert invert_dict({'A': [1]}) == {1: ['A']}

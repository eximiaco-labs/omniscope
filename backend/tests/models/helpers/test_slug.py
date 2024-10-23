import pytest
from models.helpers.slug import generate

@pytest.mark.parametrize("input_str, expected", [
    ('Hello World', 'hello-world'),
    ('This is a test', 'this-is-a-test'),
    ('Árvíztűrő tükörfúrógép', 'arvizturo-tukorfurogep'),
    ('  Spaces  at  ends  ', 'spaces-at-ends'),
    ('Multiple---Dashes', 'multiple-dashes'),
    ('123 Numbers', '123-numbers'),
    ('', None),
    (None, None),
])
def test_generate(input_str, expected):
    assert generate(input_str) == expected

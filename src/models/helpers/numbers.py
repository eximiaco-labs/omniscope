
def can_convert_to_int(input: str) -> bool:
    try:
        int(input)
        return True
    except ValueError:
        return False

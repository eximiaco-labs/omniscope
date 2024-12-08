
def can_convert_to_int(input: str) -> bool:
    if not input:
        return False

    try:
        int(input)
        return True
    except ValueError:
        return False

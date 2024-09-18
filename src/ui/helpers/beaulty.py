from datetime import datetime

def beautify(input):
    if isinstance(input, float):
        return f'{input:.1f}'
    return input


def format_date_with_suffix(date: datetime) -> str:
    if date == '-':
        return '-'

    day = date.day
    if 4 <= day <= 20 or 24 <= day <= 30:
        suffix = "th"
    else:
        suffix = ["st", "nd", "rd"][day % 10 - 1]

    return date.strftime(f'%b {day}{suffix}')

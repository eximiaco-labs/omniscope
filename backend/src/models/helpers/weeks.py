from datetime import timedelta, datetime

class Weeks:

    @staticmethod
    def get_week_dates(reference_date: datetime) -> (datetime, datetime):
        if reference_date.weekday() == 6:
            start_of_week = reference_date
        else:
            start_of_week = reference_date - timedelta(days=reference_date.weekday() + 1)
        end_of_week = start_of_week + timedelta(days=6)
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_week = end_of_week.replace(hour=23, minute=59, second=59, microsecond=999999)
        return start_of_week, end_of_week

    @staticmethod
    def get_current_dates() -> (datetime, datetime):
        today = datetime.now()
        return Weeks.get_week_dates(today)

    @staticmethod
    def get_previous_dates(n=1) -> (datetime, datetime):
        today = datetime.now()
        week_date = today - timedelta(days=7 * n)
        return Weeks.get_week_dates(week_date)

    @staticmethod
    def get_previous_string(n=1):
        today = datetime.now()
        week_date = today - timedelta(days=7 * n)
        start, end = Weeks.get_week_dates(week_date)
        return Weeks.to_string(start, end)

    @staticmethod
    def get_n_weeks_dates(number_of_weeks, last_week_reference_date: datetime = None) -> (datetime, datetime):
        if last_week_reference_date is None:
            last_week_reference_date = datetime.now()

        _, end = Weeks.get_week_dates(last_week_reference_date)
        start = last_week_reference_date - timedelta(days=number_of_weeks * 7)
        start, _ = Weeks.get_week_dates(start)
        return start, end

    @staticmethod
    def get_current_string():
        start, end = Weeks.get_current_dates()
        return Weeks.to_string(start, end)

    @staticmethod
    def get_week_string(reference_date):
        start, end = Weeks.get_week_dates(reference_date)
        return Weeks.to_string(start, end)

    @staticmethod
    def to_string(start, end):
        if isinstance(start, str):
            start = datetime.fromisoformat(start)

        if isinstance(end, str):
            end = datetime.fromisoformat(end)

        star_f = start.strftime('%d/%m')
        end_f = end.strftime('%d/%m')
        return f'{star_f} - {end_f}'

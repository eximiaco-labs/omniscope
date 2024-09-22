import pandas as pd
import numpy as np
from datetime import datetime
from models.helpers.weeks import Weeks


class PowerDataFrame:
    def __init__(self, data, source_columns: list[str] = None):
        self.data = PowerDataFrame.__transform_column_names(data)
        self.create_at = datetime.now()
        self.__source_columns = source_columns or ['Id', 'Name', 'Url']
        self.__mergeable_data = None

    @staticmethod
    def __transform_column_names(df: pd.DataFrame) -> pd.DataFrame:
        def transform_name(name: str) -> str:
            if name == 'ID':
                return 'Id'
            elif '_' in name:
                parts = name.split('_')
                transformed_parts = [part.capitalize() for part in parts]
                return ''.join(transformed_parts)
            else:
                return name[0].upper() + name[1:] if name else name

        df.columns = [transform_name(col) for col in df.columns]
        return df

    def filter_by(self, by,
                  equals_to=None,
                  not_equals_to=None,
                  starts_with=None,
                  not_starts_with=None,
                  is_in=None,
                  contains=None,
                  ):
        result = self.data

        if equals_to is not None:
            result = self.filter_equals(result, by, equals_to).data

        if not_equals_to is not None:
            result = self.filter_not_equals(result, by, not_equals_to).data

        if starts_with is not None:
            result = self.filter_starts_with(result, by, starts_with).data

        if not_starts_with is not None:
            result = self.filter_not_starts_with(result, by, not_starts_with).data

        if is_in is not None:
            result = self.filter_is_in(result, by, is_in).data

        if contains is not None:
            result = self.filter_contains(result, by, contains).data

        return self.__class__(result)

    def filter_equals(self, df, column, value):
        filtered_data = df[df[column] == value]
        return self.__class__(filtered_data)

    def filter_not_equals(self, df, column, value):
        filtered_data = df[df[column] != value]
        return self.__class__(filtered_data)

    def filter_starts_with(self, df, column, prefix):
        filtered_data = df[df[column].str.startswith(prefix, na=False)]
        return self.__class__(filtered_data)

    def filter_not_starts_with(self, df, column, prefix):
        filtered_data = df[~df[column].str.startswith(prefix, na=False)]
        return self.__class__(filtered_data)

    def filter_is_in(self, df: pd.DataFrame, column, values):
        filtered_data = df[df[column].isin(values)]
        return self.__class__(filtered_data)

    def filter_contains(self, df: pd.DataFrame, column, value):
        filtered_data = df[df[column].str.contains(value, na=True)]
        return self.__class__(filtered_data)


    def to_list_of(self, column):
        result = sorted(self.data[column].unique())
        return result

    def to_dict(self, column_key, column_value):
        return self.data.set_index(column_key)[column_value].to_dict()

    def len(self):
        return len(self.data)

    def to_ui(self):
        return self.data

    @property
    def mergeable_data(self) -> pd.DataFrame:
        if self.__mergeable_data is None:
            df = self.data[self.__source_columns].copy()
            self.__mergeable_data = df

        return self.__mergeable_data

    def enrich(self,
               df_dest: pd.DataFrame,
               on_source, on_dest,
               source_columns: list[str] = None,
               dest_columns: list[str] = None
               ) -> pd.DataFrame:

        # Select the relevant columns from the source
        if source_columns is None:
            my = self.mergeable_data.copy()
        else:
            my = self.data[source_columns].copy()

        # Rename the column directly
        if on_source != on_dest:
            my = my.rename(columns={on_source: on_dest})

        # Ensure the renamed column is the last column
        columns = [col for col in my.columns if col != on_dest] + [on_dest]
        my = my[columns]

        # Rename columns if dest_columns are provided
        if dest_columns:
            new_columns = [dest_columns[i] if i < len(dest_columns) else col for i, col in enumerate(my.columns)]
            my.columns = new_columns

        # Perform the merge operation
        result = pd.merge(df_dest, my, on=on_dest, how='left')

        return result


class SummarizablePowerDataFrame(PowerDataFrame):
    def __init__(self, data):
        super().__init__(data)

    def get_weekly_summary(self, by, alias=None, operation="sum", on='TimeInHs',
                           week_column='Week', date_column=None):

        if date_column is None:
            if 'CreatedAt' in self.data.columns:
                date_column = 'CreatedAt'
            else:
                raise ValueError("date_column must be provided if 'Created' column is not present in the data")

        data = self.data.sort_values(date_column)

        if week_column not in data.columns:
            data[week_column] = data[date_column].apply(
                lambda x: Weeks.get_week_string(datetime.fromisoformat(x))
            )

        if data.empty:
            return pd.DataFrame()

        weeks = data[week_column].unique()
        results = []

        for week in weeks:
            df = data[data[week_column] == week]
            if operation == 'sum':
                summary_df = df.groupby(by)[on].sum().round(1).reset_index(name=week)
            else:
                summary_df = df.groupby(by).size().reset_index(name='Count')
                summary_df['Count'] = summary_df['Count'].astype(int)

            summary_df.set_index(by, inplace=True)
            results.append(summary_df)

        result = pd.concat(results, axis=1, sort=False)
        result.columns = pd.MultiIndex.from_tuples([("Weeks", week) for week in weeks])

        current_week = Weeks.get_current_string()
        if current_week not in result.columns.get_level_values(1):
            result[("Weeks", current_week)] = np.nan

        result.fillna(0, inplace=True)
        result.reset_index(inplace=True)

        if alias is not None:
            result.rename(columns={by: alias}, inplace=True)

        return result


from dash import dcc
import plotly.express as px
import pandas as pd
from typing import Optional

import globals


def render(df,
           proj_color: Optional[str] = "#DAA520",
           actual_color: Optional[str] = "#228B22"
           ):
    # Calculating the sum of values for each column (excluding the index column)
    total_values = df.sum(axis=0, numeric_only=True)

    # Resetting the index to convert the MultiIndex Series to a DataFrame
    total_values = total_values.reset_index()
    total_values.columns = ['Type', 'Week', 'Total']

    # Filtering only the columns that contain the week data
    total_values = total_values[total_values['Type'] == 'Weeks']

    # Compute projected values
    projected_values = total_values.copy()

    if len(total_values) >= 2:
        projected_values.loc[1, 'Total'] = total_values.loc[0, 'Total']

    if len(total_values) >= 3:
        projected_values.loc[2, 'Total'] = (
            0.2 * total_values.loc[0, 'Total'] +
            0.8 * total_values.loc[1, 'Total']
        )

    for i in range(3, len(total_values)):
        projected_values.loc[i, 'Total'] = (
                0.7 * total_values.loc[i - 1, 'Total'] +
                0.2 * total_values.loc[i - 2, 'Total'] +
                0.1 * total_values.loc[i - 3, 'Total']
        )

    # Add a new column to distinguish between actual and projected
    total_values['Type'] = 'Actual'
    projected_values['Type'] = 'Projected'

    # Concatenate the actual and projected values
    combined_values = pd.concat([projected_values, total_values])

    # Creating the Plotly figure
    fig = px.bar(combined_values, x='Week', y='Total', color='Type', barmode='group',
                 title='Projected vs Actual Work per Week',
                 color_discrete_map={'Projected': proj_color, 'Actual': actual_color},
                 template=globals.template)

    # Disabling the toolbar
    fig.update_layout(
        xaxis_title='Week',
        yaxis_title='Total',
        title='Projected vs Actual Work per Week',
        showlegend=True
    )

    # Returning the dcc.Graph component
    return dcc.Graph(figure=fig, config={'displayModeBar': False})
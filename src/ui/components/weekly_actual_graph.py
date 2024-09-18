from dash import dcc
import plotly.express as px
import globals


def render(df):
    # Calculating the sum of values for each column (excluding the index column)
    total_values = df.sum(axis=0, numeric_only=True)

    # Resetting the index to convert the MultiIndex Series to a DataFrame
    total_values = total_values.reset_index()
    total_values.columns = ['Type', 'Week', 'Total']

    # Filtering only the columns that contain the week data
    total_values = total_values[total_values['Type'] == 'Weeks']

    # Creating the Plotly figure
    fig = px.bar(total_values, x='Week', y='Total', title='', color_discrete_sequence=['red'], template=globals.template)

    # Disabling the toolbar
    fig.update_layout(
        xaxis_title='Week',
        yaxis_title='Total',
        title='',
    )

    # Returning the dcc.Graph component
    return dcc.Graph(figure=fig, config={'displayModeBar': False})

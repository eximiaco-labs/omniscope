import dash_ag_grid as dag
from dash import Dash, html, dcc
import pandas as pd

data = {
    "ticker": ["AAPL", "MSFT", "AMZN", "GOOGL"],
    "link": ["<a href='elemarjr.com'>Elemar</a>","<a href='elemarjr.com'>Microsoft</a>","<a href='elemarjr.com'>Elemar</a>","<a href='elemarjr.com'>Elemar</a>"],
    "company": ["Apple", "Microsoft", "Amazon", "Alphabet"],
    "quantity": [75, 40, 100, 50],
}
df = pd.DataFrame(data)

columnDefs = [
    {
        "headerName": "Stock Ticker",
        "field": "ticker",
        # stockLink function is defined in the dashAgGridComponentFunctions.js in assets folder
        "cellRenderer": "StockLink",
    },
    {
        "headerName": "Link",
        "field": "link",
        # stockLink function is defined in the dashAgGridComponentFunctions.js in assets folder
        "cellRenderer": "OmniHtml",
    },
    {
        "headerName": "Company",
        "field": "company",
    },
    {
        "headerName": "Shares",
        "field": "quantity",
        "editable": True,
    },
]


grid = dag.AgGrid(
    id="simple-column-example-1",
    columnDefs=columnDefs,
    rowData=df.to_dict("records"),
    columnSize="sizeToFit"
)


app = Dash(__name__)

app.layout = html.Div([dcc.Markdown("Adding links with cellRenderer"), grid])

if __name__ == "__main__":
    app.run()
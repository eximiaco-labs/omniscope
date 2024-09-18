from models.omnimodels import OmniModels
from models.omnidatasets import OmniDatasets
from datetime import datetime
from dash import Dash

omni: OmniModels = OmniModels()
datasets: OmniDatasets = OmniDatasets(omni)
last_update_time = None
data = None
url_path = "/"
app: Dash = None
cache = {}
template = None

def update():
    global omni
    global datasets
    global last_update_time

    omni = OmniModels()
    datasets = OmniDatasets(omni)

    last_update_time = datetime.now()

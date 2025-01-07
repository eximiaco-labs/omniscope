from omni_models.omnimodels import OmniModels
from omni_models.omnidatasets import OmniDatasets
from datetime import datetime

try:
    omni_models
except NameError:
    omni_models = OmniModels()

try:
    omni_datasets
except NameError:
    omni_datasets = OmniDatasets(omni_models)

try:
    last_update_time
except NameError:
    last_update_time = datetime.now()

def update():
    global omni_models
    global omni_datasets
    global last_update_time

    omni_models = OmniModels()
    omni_datasets = OmniDatasets(omni_models)
    last_update_time = datetime.now()

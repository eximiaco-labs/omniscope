from omni_models.omnimodels import OmniModels
from omni_models.omnidatasets import OmniDatasets
from datetime import datetime

omni_models: OmniModels = OmniModels()
omni_datasets: OmniDatasets = OmniDatasets(omni_models)
last_update_time = None


def update():
    global omni_models
    global omni_datasets
    global last_update_time

    omni_models = OmniModels()
    omni_datasets = OmniDatasets(omni_models)
    last_update_time = datetime.now()

import os
from decorators import list_c4_external_systems_from_dir

prefix = """
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

title Container diagram for "Omniscope"

SHOW_PERSON_OUTLINE()

Person(consultant, "Consultant", "Uses Omniscope to track activity progress, compare past performance, and monitor material developed for promotion.")
Person(en, "Engineer", "Uses Omniscope to monitor project progress and access detailed company information.")
Person(am, "Account Manager", "Uses Omniscope to track the progress of various engagements and obtain precise information to better serve clients.")
Person(manager, "Manager", "Uses Omniscope to access detailed information about organizational projects.")

System_Boundary(c1, "Omniscope") {
    Container(webApp, "UI", "Dash,Plotly", "Presents integrated data visually for effective management")
    Container(models, "Models", "Python,Requests,Pydantic", "Fetches and consolidates data from external systems using REST APIs, with Pydantic validation")
}

Rel(consultant, webApp, "Uses", "https")
Rel(en, webApp, "Uses", "https")
Rel(am, webApp, "Uses", "https")
Rel(manager, webApp, "Uses", "https")

Rel_Neighbor(webApp, models, "Fetches consolidated data")
"""

semantic_folder = os.path.abspath('../../src/models/semantic')
external_systems = list_c4_external_systems_from_dir(semantic_folder)

with open('containers.puml', 'w') as file:
    file.write(prefix)
    for es in external_systems:
        file.write(f'System_Ext({es['class_name']}, "{es['name']}", "{es["description"]}")\n')
        file.write(f'Rel(models, {es['class_name']}, "fetches data from", "REST")\n')
    file.write('@enduml')

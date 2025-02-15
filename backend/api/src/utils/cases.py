# def build_case_dictionary(map, case):
#     result = {**case.__dict__}
    
#     # Add all properties
#     for prop in dir(case):
#         if not prop.startswith('_') and prop not in result:
#             result[prop] = getattr(case, prop)


#     if 'client' in map:
#         if case.client_id:
#             result['client'] = globals.omni_models.clients.get_by_id(case.client_id)

#     if 'sponsor' in map:
#         result['sponsor'] = case.sponsor

#     if 'tracker' in map:
#         if case.tracker_info:
#             result['tracker'] = [
#                 {
#                     'id': project.id,
#                     'name': project.name,
#                     'kind': project.kind,
#                     'due_on': project.due_on,
#                     'budget': {
#                         'period': project.budget.period,
#                         'hours': project.budget.hours
#                     } if project.budget else None
#                 }
#                 for project in case.tracker_info
#             ]
#         else:
#             result['tracker'] = []
    

#     if 'timesheets' in map:
#         timesheets_map = map['timesheets']
#         if 'lastSixWeeks' in timesheets_map:
#             from datasets.timesheets import compute_timesheet
#             last_six_weeks_map = timesheets_map['lastSixWeeks']
#             filters = [
#                 {
#                     'field': 'CaseTitle',
#                     'selected_values': [case.title]
#                 }
#             ]
#             computed_timesheet = compute_timesheet(last_six_weeks_map, 'last-six-weeks', filters=filters)
#             result['timesheets'] = {
#                 'last_six_weeks': computed_timesheet
#             }

#     return result
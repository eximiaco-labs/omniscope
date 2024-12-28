from ariadne import ObjectType, QueryType


from .week_review import resolve_week_review
from .timeliness_review import resolve_timeliness_review
from .approved_vs_actual import resolve_approved_vs_actual
from .performance_analysis import resolve_performance_analysis, resolve_performance_analysis_pivoted
from .revenue_tracking import resolve_revenue_tracking
from .forecast import resolve_forecast
from .yearly_forecast import resolve_yearly_forecast

def setup_query_for_analytics(query: QueryType):
    query.set_field("weekReview", resolve_week_review)
    query.set_field("timelinessReview", resolve_timeliness_review)
    query.set_field("approvedVsActual", resolve_approved_vs_actual)
    query.set_field("performanceAnalysis", resolve_performance_analysis)
    query.set_field("revenueTracking", resolve_revenue_tracking)
    query.set_field("forecast", resolve_forecast)
    query.set_field("yearlyForecast", resolve_yearly_forecast)
        
    performance_analysis_type = ObjectType('PerformanceAnalysis')
    performance_analysis_type.set_field('pivoted', resolve_performance_analysis_pivoted)
    
    return [performance_analysis_type]

import time
from ariadne.types import Extension

class ExecutionStatsExtension(Extension):
    def __init__(self):
        self.start_time = None
        self.end_time = None

    def request_started(self, context):
        self.start_time = time.perf_counter_ns()

    def request_finished(self, context):
        self.end_time = time.perf_counter_ns()

    def format(self, context):
        if self.end_time is None:
            self.end_time = time.perf_counter_ns()

        if self.start_time and self.end_time:
            execution_time = (self.end_time - self.start_time) / 1e6  # Converting to milliseconds

            extra_data = getattr(context, 'extra_data', {})

            return {
                "executionTime": f"{execution_time:.2f} ms",
                **extra_data
            }
        return None
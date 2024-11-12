from elasticsearch import Elasticsearch
from flask import request, g
import time
import uuid
from functools import wraps
import logging

class ElkLogger:
    def __init__(self, endpoint_url, cloud_id, api_key):
        self.es = Elasticsearch(
            endpoint_url=endpoint_url,
            cloud_id=cloud_id,
            api_key=api_key
        )
        self.index = "omniscope-logs"

    def log_request(self, f):
        @wraps(f)
        def decorated(*args, **kwargs):
            g.request_id = str(uuid.uuid4())
            g.start_time = time.time()
            
            response = f(*args, **kwargs)
            
            duration = time.time() - g.start_time
            
            log_data = {
                "@timestamp": time.time() * 1000,
                "request_id": g.request_id,
                "method": request.method,
                "path": request.path,
                "user_agent": request.headers.get("User-Agent"),
                "ip": request.remote_addr,
                "duration_ms": round(duration * 1000, 2),
                "status_code": response.status_code if hasattr(response, "status_code") else 500,
                "user_id": g.get("user_id"),
                "query": request.args.to_dict(),
                "body": request.get_json() if request.is_json else None
            }
            
            try:
                self.es.index(index=self.index, body=log_data)
            except Exception as e:
                logging.error(f"Failed to log to Elasticsearch: {e}")
            
            return response
        return decorated
from abc import ABC, abstractmethod


class SemanticModel(ABC):

    @property
    def common_queries(self):
        return None


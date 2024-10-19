class Key:
    def __init__(self, full: str) -> None:
        self.full = full
        self.kind, self.specific = full.split('/', 1)

    def __str__(self):
        return self.full

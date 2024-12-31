from enum import Enum

class PostStatus(str, Enum):
    publish = "publish"
    future = "future"
    draft = "draft"
    pending = "pending"
    private = "private"
    inherit = "inherit"
    trash = "trash" 
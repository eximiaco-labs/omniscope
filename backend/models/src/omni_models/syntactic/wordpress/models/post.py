from datetime import datetime
from pydantic import BaseModel, HttpUrl, Field, validator
from typing import Dict, List, Any, Optional, TypeVar

from omni_utils.helpers.weeks import Weeks
from .post_status import PostStatus
from .comment_status import CommentStatus
from .ping_status import PingStatus
from .content import Content, GUID, Title, Excerpt
from .acf import Acf

class Post(BaseModel):
    id: int
    date: datetime
    date_gmt: datetime
    guid: GUID
    modified: datetime
    modified_gmt: datetime
    slug: str
    status: PostStatus
    type: str
    link: HttpUrl
    title: Title
    content: Optional[Content] = None
    excerpt: Optional[Excerpt] = None
    author: Optional[int] = 1
    featured_media: Optional[int] = None
    comment_status: Optional[CommentStatus] = None
    ping_status: Optional[PingStatus] = None
    sticky: Optional[bool] = None
    template: Optional[str] = None
    format: Optional[str] = None
    meta: Optional[Dict[str, Any]] = None
    categories: Optional[List[int]] = None
    tags: Optional[List[int]] = None
    acf: Optional[Acf] = None
    yoast_head_json: Optional[Dict[str, object]] = None
    _links: Dict[str, List[Dict[str, Any]]]

    @property
    def creation_week(self) -> str:
        return Weeks.get_week_string(self.date)

    @validator('acf', pre=True, always=True)
    def set_acf_none_if_list(cls, v):
        if isinstance(v, list):
            return None
        return v

    @validator('yoast_head_json', pre=True, always=True)
    def set_yhj_none_if_list(cls, v):
        if isinstance(v, list):
            return None
        return v 
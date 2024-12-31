from datetime import datetime
from typing import Optional
from pydantic import BaseModel, HttpUrl

from omni_models.syntactic import Post, User

class Entry(BaseModel):
    id: int
    title: str
    link: HttpUrl
    class_name: str
    author_id: int
    author_name: str
    creation_date: datetime
    creation_week: str
    cover_image_url: Optional[str] = None

    @staticmethod
    def from_wordpress_post(post: Post, class_name: str, author: User) -> 'Entry':
        default_cover_image_url = '/assets/who_is_it.jpeg'
        cover_image_url = default_cover_image_url
        yoast_head_json = post.yoast_head_json
        if isinstance(yoast_head_json, dict):
            og_image = yoast_head_json.get('og_image', [])
            if og_image and 'url' in og_image[0]:
                potential_cover_image_url = og_image[0]['url']
                cover_image_url = potential_cover_image_url if potential_cover_image_url else default_cover_image_url

        return Entry(
            id=post.id,
            title=post.title.rendered,
            link=post.link,
            class_name=class_name,
            author_id=author.id,
            author_name=author.name,
            creation_date=post.date_gmt,
            creation_week=post.creation_week,
            cover_image_url=cover_image_url
        )
from datetime import datetime
from typing import List, Dict

from pydantic import BaseModel, HttpUrl

from models.base.semanticmodel import SemanticModel
from models.syntactic import Wordpress, User, Post

from decorators import c4_external_system


class Insight(BaseModel):
    id: int
    title: str
    link: HttpUrl
    publisher_id: int
    publisher_name: str
    creation_date: datetime
    creation_week: str

    @staticmethod
    def from_wordpress_post(post: Post, author: User) -> 'Insight':
        return Insight(
            id=post.id,
            title=post.title.rendered,
            link=post.link,
            publisher_id=author.id,
            publisher_name=author.name,
            creation_date=post.date_gmt,
            creation_week=post.creation_week,
        )


@c4_external_system(
    "Insights (Wordpress)",
    "Where EximiaCo shares lessons learned with clients"
)
class Insights(SemanticModel):
    def __init__(self):
        self.wp = Wordpress('https://insights.eximia.co')

    @property
    def publishers(self) -> Dict[int, User]:
        return self.wp.fetch_users()

    def fetch_insights(self, after: datetime, before: datetime) -> List[Insight]:
        authors = self.publishers

        posts = self.wp.fetch_posts('posts', after, before)

        return [
            Insight.from_wordpress_post(post, authors[post.author])
            for post in posts
        ]

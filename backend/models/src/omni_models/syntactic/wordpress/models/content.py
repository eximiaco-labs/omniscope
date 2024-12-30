from pydantic import BaseModel, HttpUrl

class GUID(BaseModel):
    rendered: HttpUrl

class Title(BaseModel):
    rendered: str

class Content(BaseModel):
    rendered: str
    protected: bool

class Excerpt(BaseModel):
    rendered: str
    protected: bool 
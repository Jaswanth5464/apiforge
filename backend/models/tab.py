from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean, Integer
from backend.database.base import Base
import uuid


def generate_uuid() -> str:
    return str(uuid.uuid4())


class RequestTab(Base):
    __tablename__ = "request_tabs"

    id = Column(String, primary_key=True, default=generate_uuid)
    request_id = Column(String, ForeignKey("requests.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False, default="Untitled Request")
    method = Column(String(10), nullable=False, default="GET")
    url = Column(Text, nullable=False, default="")
    params = Column(JSON, nullable=False, default=list)
    headers = Column(JSON, nullable=False, default=list)
    body_type = Column(String(30), nullable=False, default="none")
    body_content = Column(Text, nullable=True)
    auth_type = Column(String(30), nullable=False, default="none")
    auth_data = Column(JSON, nullable=False, default=dict)
    is_dirty = Column(Boolean, nullable=False, default=False)  # unsaved changes flag
    order_idx = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer, JSON
from backend.database.base import Base
import uuid


def generate_uuid() -> str:
    return str(uuid.uuid4())


class History(Base):
    __tablename__ = "history"

    id = Column(String, primary_key=True, default=generate_uuid)
    method = Column(String(10), nullable=False)
    url = Column(Text, nullable=False)
    params = Column(JSON, nullable=False, default=list)
    headers = Column(JSON, nullable=False, default=list)
    body_type = Column(String(30), nullable=False, default="none")
    body_content = Column(Text, nullable=True)
    auth_type = Column(String(30), nullable=False, default="none")
    auth_data = Column(JSON, nullable=False, default=dict)
    status_code = Column(Integer, nullable=True)
    response_time_ms = Column(Integer, nullable=True)
    response_size_bytes = Column(Integer, nullable=True)
    response_headers = Column(JSON, nullable=True, default=dict)
    response_body = Column(Text, nullable=True)
    error = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

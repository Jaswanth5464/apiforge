from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from backend.database.base import Base
import uuid


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True, default=generate_uuid)
    collection_id = Column(String, ForeignKey("collections.id", ondelete="CASCADE"), nullable=False)
    folder_id = Column(String, ForeignKey("folders.id", ondelete="CASCADE"), nullable=True)
    name = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False, default="GET")
    url = Column(Text, nullable=False, default="")
    params = Column(JSON, nullable=False, default=list)
    headers = Column(JSON, nullable=False, default=list)
    body_type = Column(String(30), nullable=False, default="none")  # none|raw|json|text|xml|form-data|x-www-form-urlencoded
    body_content = Column(Text, nullable=True)
    auth_type = Column(String(30), nullable=False, default="none")  # none|bearer|basic
    auth_data = Column(JSON, nullable=False, default=dict)
    description = Column(Text, nullable=True)
    is_favorite = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    collection = relationship("Collection", back_populates="requests", foreign_keys=[collection_id])
    folder = relationship("Folder", back_populates="requests")

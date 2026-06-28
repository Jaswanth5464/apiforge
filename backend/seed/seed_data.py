import logging
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.models.collection import Collection, Folder
from backend.models.request import Request
from backend.models.environment import Environment, Variable
from backend.models.history import History

logger = logging.getLogger(__name__)


def run_seed(db: Session) -> None:
    """Seed the database only if it's empty."""
    if db.query(Collection).count() > 0:
        logger.info("Database already seeded, skipping.")
        return

    logger.info("Seeding database with initial data...")
    _seed_collections(db)
    _seed_environments(db)
    _seed_history(db)
    logger.info("Database seeding complete.")


def _seed_collections(db: Session) -> None:
    # ── JSONPlaceholder Collection ────────────────────────────────────────────
    jp_collection = Collection(
        id=str(uuid.uuid4()),
        name="JSONPlaceholder",
        description="Free fake and reliable API for testing and prototyping.",
    )
    db.add(jp_collection)
    db.flush()

    jp_users_folder = Folder(
        id=str(uuid.uuid4()),
        collection_id=jp_collection.id,
        name="Users",
        order_idx=0,
    )
    jp_posts_folder = Folder(
        id=str(uuid.uuid4()),
        collection_id=jp_collection.id,
        name="Posts",
        order_idx=1,
    )
    db.add_all([jp_users_folder, jp_posts_folder])
    db.flush()

    jp_requests = [
        Request(
            id=str(uuid.uuid4()),
            collection_id=jp_collection.id,
            folder_id=jp_users_folder.id,
            name="Get All Users",
            method="GET",
            url="https://jsonplaceholder.typicode.com/users",
            params=[],
            headers=[{"key": "Accept", "value": "application/json", "enabled": True}],
            body_type="none",
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=jp_collection.id,
            folder_id=jp_users_folder.id,
            name="Get User by ID",
            method="GET",
            url="https://jsonplaceholder.typicode.com/users/1",
            params=[],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=jp_collection.id,
            folder_id=jp_posts_folder.id,
            name="Get All Posts",
            method="GET",
            url="https://jsonplaceholder.typicode.com/posts",
            params=[{"key": "_limit", "value": "10", "enabled": True}],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=jp_collection.id,
            folder_id=jp_posts_folder.id,
            name="Create Post",
            method="POST",
            url="https://jsonplaceholder.typicode.com/posts",
            params=[],
            headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
            body_type="json",
            body_content='{\n  "title": "My Post",\n  "body": "Hello World",\n  "userId": 1\n}',
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=jp_collection.id,
            folder_id=jp_posts_folder.id,
            name="Update Post",
            method="PUT",
            url="https://jsonplaceholder.typicode.com/posts/1",
            params=[],
            headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
            body_type="json",
            body_content='{\n  "id": 1,\n  "title": "Updated Title",\n  "body": "Updated body",\n  "userId": 1\n}',
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=jp_collection.id,
            folder_id=jp_posts_folder.id,
            name="Delete Post",
            method="DELETE",
            url="https://jsonplaceholder.typicode.com/posts/1",
            params=[],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
        ),
    ]
    db.add_all(jp_requests)

    # ── HTTPBin Collection ────────────────────────────────────────────────────
    hb_collection = Collection(
        id=str(uuid.uuid4()),
        name="HTTPBin",
        description="A simple HTTP request & response service for testing.",
    )
    db.add(hb_collection)
    db.flush()

    hb_folder = Folder(
        id=str(uuid.uuid4()),
        collection_id=hb_collection.id,
        name="Inspect",
        order_idx=0,
    )
    db.add(hb_folder)
    db.flush()

    hb_requests = [
        Request(
            id=str(uuid.uuid4()),
            collection_id=hb_collection.id,
            folder_id=hb_folder.id,
            name="Get Request Info",
            method="GET",
            url="https://httpbin.org/get",
            params=[{"key": "source", "value": "postman-clone", "enabled": True}],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=hb_collection.id,
            folder_id=hb_folder.id,
            name="Post JSON",
            method="POST",
            url="https://httpbin.org/post",
            params=[],
            headers=[],
            body_type="json",
            body_content='{\n  "name": "test",\n  "value": 42\n}',
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=hb_collection.id,
            folder_id=hb_folder.id,
            name="Bearer Auth Test",
            method="GET",
            url="https://httpbin.org/bearer",
            params=[],
            headers=[],
            body_type="none",
            auth_type="bearer",
            auth_data={"token": "my-secret-token"},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=hb_collection.id,
            folder_id=hb_folder.id,
            name="Delay 2s",
            method="GET",
            url="https://httpbin.org/delay/2",
            params=[],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
        ),
        Request(
            id=str(uuid.uuid4()),
            collection_id=hb_collection.id,
            folder_id=hb_folder.id,
            name="Status 404",
            method="GET",
            url="https://httpbin.org/status/404",
            params=[],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
        ),
    ]
    db.add_all(hb_requests)
    db.commit()


def _seed_environments(db: Session) -> None:
    dev_env = Environment(
        id=str(uuid.uuid4()),
        name="Development",
        description="Local development environment",
        is_active=True,
    )
    prod_env = Environment(
        id=str(uuid.uuid4()),
        name="Production",
        description="Production environment",
        is_active=False,
    )
    test_env = Environment(
        id=str(uuid.uuid4()),
        name="Testing",
        description="Testing / QA environment",
        is_active=False,
    )
    db.add_all([dev_env, prod_env, test_env])
    db.flush()

    dev_vars = [
        Variable(environment_id=dev_env.id, key="BASE_URL", value="http://localhost:3000", enabled=True),
        Variable(environment_id=dev_env.id, key="API_URL", value="http://localhost:8000", enabled=True),
        Variable(environment_id=dev_env.id, key="API_KEY", value="dev-api-key-12345", enabled=True),
        Variable(environment_id=dev_env.id, key="TOKEN", value="dev-bearer-token", enabled=True),
    ]
    prod_vars = [
        Variable(environment_id=prod_env.id, key="BASE_URL", value="https://myapp.com", enabled=True),
        Variable(environment_id=prod_env.id, key="API_URL", value="https://api.myapp.com", enabled=True),
        Variable(environment_id=prod_env.id, key="API_KEY", value="prod-api-key-99999", enabled=True),
        Variable(environment_id=prod_env.id, key="TOKEN", value="prod-bearer-token", enabled=True),
    ]
    test_vars = [
        Variable(environment_id=test_env.id, key="BASE_URL", value="https://test.myapp.com", enabled=True),
        Variable(environment_id=test_env.id, key="API_URL", value="https://test-api.myapp.com", enabled=True),
        Variable(environment_id=test_env.id, key="API_KEY", value="test-api-key-55555", enabled=True),
    ]
    db.add_all(dev_vars + prod_vars + test_vars)
    db.commit()


def _seed_history(db: Session) -> None:
    now = datetime.utcnow()
    history_entries = [
        History(
            id=str(uuid.uuid4()),
            method="GET",
            url="https://jsonplaceholder.typicode.com/users",
            params=[],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
            status_code=200,
            response_time_ms=245,
            response_size_bytes=5312,
            response_headers={"content-type": "application/json; charset=utf-8"},
            response_body='[{"id":1,"name":"Leanne Graham"}]',
            timestamp=now - timedelta(minutes=5),
        ),
        History(
            id=str(uuid.uuid4()),
            method="POST",
            url="https://jsonplaceholder.typicode.com/posts",
            params=[],
            headers=[{"key": "Content-Type", "value": "application/json", "enabled": True}],
            body_type="json",
            body_content='{"title":"Hello","body":"World","userId":1}',
            auth_type="none",
            auth_data={},
            status_code=201,
            response_time_ms=382,
            response_size_bytes=65,
            response_headers={"content-type": "application/json; charset=utf-8"},
            response_body='{"id":101,"title":"Hello","body":"World","userId":1}',
            timestamp=now - timedelta(minutes=12),
        ),
        History(
            id=str(uuid.uuid4()),
            method="GET",
            url="https://httpbin.org/get",
            params=[{"key": "source", "value": "test", "enabled": True}],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
            status_code=200,
            response_time_ms=520,
            response_size_bytes=412,
            response_headers={"content-type": "application/json"},
            response_body='{"args":{"source":"test"},"url":"https://httpbin.org/get?source=test"}',
            timestamp=now - timedelta(hours=1),
        ),
        History(
            id=str(uuid.uuid4()),
            method="DELETE",
            url="https://jsonplaceholder.typicode.com/posts/1",
            params=[],
            headers=[],
            body_type="none",
            auth_type="none",
            auth_data={},
            status_code=200,
            response_time_ms=198,
            response_size_bytes=2,
            response_headers={"content-type": "application/json; charset=utf-8"},
            response_body="{}",
            timestamp=now - timedelta(hours=2),
        ),
    ]
    db.add_all(history_entries)
    db.commit()

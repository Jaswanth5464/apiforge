import urllib.request
import urllib.parse
import json
import sys

BASE_URL = "http://localhost:8000/api/v1"

def api_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        
    req = urllib.request.Request(url, method=method, data=req_data, headers=headers)
    try:
        with urllib.request.urlopen(req) as res:
            res_content = res.read().decode("utf-8")
            if res_content:
                return json.loads(res_content)
            return None
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code} for {method} {path}")
        print(e.read().decode("utf-8"))
        raise e

def test_collections():
    print("Testing Collections CRUD...")
    # Create
    col = api_request("/collections/", "POST", {"name": "Integration Test Collection", "description": "Temp"})
    col_id = col["id"]
    assert col["name"] == "Integration Test Collection"
    
    # List
    cols = api_request("/collections/")
    assert any(c["id"] == col_id for c in cols)
    
    # Update
    updated = api_request(f"/collections/{col_id}", "PUT", {"name": "Renamed Integration Collection"})
    assert updated["name"] == "Renamed Integration Collection"
    
    # Delete
    api_request(f"/collections/{col_id}", "DELETE")
    cols_after = api_request("/collections/")
    assert not any(c["id"] == col_id for c in cols_after)
    print("Collections CRUD: PASS")

def test_environments_and_variables():
    print("Testing Environments & Variables...")
    # Create Env
    env = api_request("/environments/", "POST", {"name": "Test Env", "description": "Temp"})
    env_id = env["id"]
    
    # Add Variable
    var = api_request(f"/environments/{env_id}/variables", "POST", {"key": "MY_VAR", "value": "my-value", "enabled": True})
    assert var["key"] == "MY_VAR"
    assert var["value"] == "my-value"
    
    # Get active resolved vars
    api_request(f"/environments/{env_id}/activate", "POST")
    active_env = api_request(f"/environments/{env_id}")
    assert any(v["key"] == "MY_VAR" and v["value"] == "my-value" for v in active_env["variables"])
    
    # Cleanup
    api_request(f"/environments/{env_id}", "DELETE")
    print("Environments & Variables: PASS")

def test_variable_resolution_and_runner():
    print("Testing Variable Resolution & Proxy Runner...")
    # Setup Env
    env = api_request("/environments/", "POST", {"name": "Runner Env", "description": "Temp"})
    env_id = env["id"]
    api_request(f"/environments/{env_id}/variables", "POST", {"key": "TEST_VAR", "value": "test-key-val", "enabled": True})
    
    # Run request resolving variables
    payload = {
        "method": "POST",
        "url": "https://httpbin.org/post",
        "params": [],
        "headers": [{"key": "X-Custom-Test", "value": "{{TEST_VAR}}", "enabled": True}],
        "body_type": "json",
        "body_content": "{\"value\": \"{{TEST_VAR}}\"}",
        "auth_type": "none",
        "auth_data": {},
        "environment_id": env_id,
        "timeout": 15,
        "follow_redirects": True
    }
    
    res = api_request("/runner/run", "POST", payload)
    assert res["status_code"] == 200
    
    # Verify downstream httpbin echoed the resolved variable values
    body_data = json.loads(res["body"])
    assert body_data["headers"]["X-Custom-Test"] == "test-key-val"
    assert body_data["json"]["value"] == "test-key-val"
    
    # Clean up Env
    api_request(f"/environments/{env_id}", "DELETE")
    print("Variable Resolution & Proxy Runner: PASS")

def test_history():
    print("Testing History...")
    # List history items
    history = api_request("/history/")
    assert len(history) > 0
    print(f"Captured {len(history)} history entries. History check: PASS")

if __name__ == "__main__":
    try:
        test_collections()
        test_environments_and_variables()
        test_variable_resolution_and_runner()
        test_history()
        print("\nAll integration test phases completed: ALL PASSED!")
    except Exception as e:
        print(f"\nTest failed: {str(e)}")
        sys.exit(1)

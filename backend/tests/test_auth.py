import pytest
from fastapi.testclient import TestClient

def test_setup_initial_data(client: TestClient):
    """Test crear datos iniciales"""
    response = client.post("/api/v1/auth/setup")
    assert response.status_code == 200
    data = response.json()
    assert "admin_user" in data

def test_login_admin(client: TestClient):
    """Test login admin"""
    # Primero crear datos iniciales
    client.post("/api/v1/auth/setup")
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin", "password": "admin123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_get_current_user(client: TestClient):
    """Test obtener usuario actual"""
    # Setup y login
    client.post("/api/v1/auth/setup")
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "admin", "password": "admin123"}
    )
    token = login_response.json()["access_token"]
    
    # Obtener usuario actual
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "admin"
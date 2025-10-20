"""
Integration tests for API endpoints.
"""

from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

client = TestClient(app)


class TestCitationEndpoints:
    """Test citation-related API endpoints."""
    
    @patch('app.services.citation_handler.CitationHandler.handle_citation_query')
    def test_get_citation_success(self, mock_handler):
        """Test successful citation lookup via GET."""
        mock_handler.return_value = {
            "status": "single",
            "opinion_url": "https://www.courtlistener.com/opinion/108713/",
            "text": "<p>Roe v. Wade opinion</p>",
            "citation": "410 U.S. 113",
            "opinion_id": 108713,
            "source": "CourtListener"
        }
        
        response = client.get("/api/v1/research/citations/410%20U.S.%20113")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "single"
        assert data["opinion_id"] == 108713
        assert data["citation"] == "410 U.S. 113"
    
    @patch('app.services.citation_handler.CitationHandler.handle_citation_query')
    def test_get_citation_not_found(self, mock_handler):
        """Test citation lookup when case not found."""
        mock_handler.return_value = {
            "status": "not_found",
            "message": "Could not find case for citation: 999 Foo. 1",
            "citation": "999 Foo. 1"
        }
        
        response = client.get("/api/v1/research/citations/999%20Foo.%201")
        
        assert response.status_code == 404
        data = response.json()
        assert data["status"] == "not_found"
    
    @patch('app.services.citation_handler.CitationHandler.handle_citation_query')
    def test_post_citation_success(self, mock_handler):
        """Test successful citation lookup via POST."""
        mock_handler.return_value = {
            "status": "single",
            "opinion_url": "https://www.courtlistener.com/opinion/108713/",
            "text": "<p>Roe v. Wade opinion</p>",
            "citation": "410 U.S. 113",
            "opinion_id": 108713,
            "source": "CourtListener"
        }
        
        response = client.post(
            "/api/v1/research/citations",
            json={"citation": "410 U.S. 113"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "single"
        assert data["opinion_id"] == 108713


class TestSearchEndpoints:
    """Test search-related API endpoints."""
    
    @patch('app.services.citation_handler.CitationHandler.handle_citation_query')
    def test_query_citation_type(self, mock_handler):
        """Test query endpoint with citation type."""
        mock_handler.return_value = {
            "status": "single",
            "opinion_url": "https://www.courtlistener.com/opinion/108713/",
            "text": "<p>Roe v. Wade opinion</p>",
            "citation": "410 U.S. 113",
            "opinion_id": 108713,
            "source": "CourtListener"
        }
        
        response = client.post(
            "/api/v1/search/query",
            json={
                "query": "410 U.S. 113",
                "type": "citation"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "single"
        assert data["type"] == "citation"
    
    def test_query_search_type(self):
        """Test query endpoint with search type."""
        response = client.post(
            "/api/v1/search/query",
            json={
                "query": "Roe v Wade",
                "type": "search",
                "max_results": 5
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "total_results" in data


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_health_check(self):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data
    
    def test_api_health_check(self):
        """Test API health check endpoint."""
        response = client.get("/api/v1/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "service" in data
        assert "version" in data 
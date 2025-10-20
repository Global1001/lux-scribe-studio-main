"""
Unit tests for CourtListener service.
"""

import pytest
from unittest.mock import Mock, patch
from app.services.courtlistener import CourtListenerService, resolve_citation


class TestCourtListenerService:
    """Test cases for CourtListenerService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.service = CourtListenerService()
    
    def test_parse_citation_valid(self):
        """Test parsing valid citations."""
        # Test standard citation
        vol, rep, page = self.service.parse_citation("410 U.S. 113")
        assert vol == "410"
        assert rep == "U.S."
        assert page == "113"
        
        # Test with extra spaces
        vol, rep, page = self.service.parse_citation("  410  U.S.  113  ")
        assert vol == "410"
        assert rep == "U.S."
        assert page == "113"
        
        # Test different reporter
        vol, rep, page = self.service.parse_citation("384 F.2d 436")
        assert vol == "384"
        assert rep == "F.2D"
        assert page == "436"
    
    def test_parse_citation_invalid(self):
        """Test parsing invalid citations."""
        with pytest.raises(ValueError):
            self.service.parse_citation("invalid citation")
        
        with pytest.raises(ValueError):
            self.service.parse_citation("410 U.S.")
        
        with pytest.raises(ValueError):
            self.service.parse_citation("U.S. 113")
    
    @patch('requests.Session.get')
    def test_resolve_citation_success(self, mock_get):
        """Test successful citation resolution."""
        # Mock the redirect response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.url = "https://www.courtlistener.com/opinion/108713/roe-v-wade/"
        
        # Mock the opinion data response
        mock_opinion_response = Mock()
        mock_opinion_response.json.return_value = {
            "id": 108713,
            "html_with_citations": "<p>Roe v. Wade opinion text</p>",
            "plain_text": "Roe v. Wade opinion text",
            "case_name": "Roe v. Wade"
        }
        
        mock_get.side_effect = [mock_response, mock_opinion_response]
        
        result = self.service.resolve_citation("410 U.S. 113")
        
        assert result is not None
        assert result["id"] == 108713
        assert result["citation"] == "410 U.S. 113"
        assert result["opinion_url"] == "https://www.courtlistener.com/opinion/108713/"
        assert result["data"]["case_name"] == "Roe v. Wade"
    
    @patch('requests.Session.get')
    def test_resolve_citation_not_found(self, mock_get):
        """Test citation resolution when case not found."""
        mock_response = Mock()
        mock_response.status_code = 404
        
        mock_get.return_value = mock_response
        
        result = self.service.resolve_citation("999 Foo. 1")
        
        assert result is None
    
    @patch('requests.Session.get')
    def test_resolve_citation_network_error(self, mock_get):
        """Test citation resolution with network error."""
        mock_get.side_effect = Exception("Network error")
        
        result = self.service.resolve_citation("410 U.S. 113")
        
        assert result is None
    
    def test_get_opinion_text_prefers_html_with_citations(self):
        """Test that get_opinion_text prefers html_with_citations."""
        opinion_data = {
            "html_with_citations": "<p>HTML with citations</p>",
            "html": "<p>Plain HTML</p>",
            "plain_text": "Plain text"
        }
        
        text = self.service.get_opinion_text(opinion_data)
        assert text == "<p>HTML with citations</p>"
    
    def test_get_opinion_text_fallback_to_plain_text(self):
        """Test that get_opinion_text falls back to plain text."""
        opinion_data = {
            "plain_text": "Plain text only"
        }
        
        text = self.service.get_opinion_text(opinion_data)
        assert text == "Plain text only"
    
    def test_get_opinion_text_no_text_available(self):
        """Test that get_opinion_text handles missing text."""
        opinion_data = {}
        
        text = self.service.get_opinion_text(opinion_data)
        assert text == "Opinion text not available."


class TestResolveCitationFunction:
    """Test cases for the convenience function."""
    
    @patch('app.services.courtlistener.CourtListenerService')
    def test_resolve_citation_function(self, mock_service_class):
        """Test the convenience function."""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        mock_service.resolve_citation.return_value = {"id": 123, "data": {}}
        
        result = resolve_citation("410 U.S. 113")
        
        assert result == {"id": 123, "data": {}}
        mock_service.resolve_citation.assert_called_once_with("410 U.S. 113") 
"""
Unit tests for citation handler.
"""

from unittest.mock import Mock, patch
from app.services.citation_handler import CitationHandler


class TestCitationHandler:
    """Test cases for CitationHandler."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.mock_cl_service = Mock()
        self.handler = CitationHandler(self.mock_cl_service)
    
    def test_handle_citation_query_success(self):
        """Test successful citation query handling."""
        # Mock successful citation resolution
        mock_result = {
            "id": 108713,
            "data": {
                "html_with_citations": "<p>Roe v. Wade opinion</p>",
                "case_name": "Roe v. Wade"
            },
            "opinion_url": "https://www.courtlistener.com/opinion/108713/",
            "citation": "410 U.S. 113"
        }
        
        self.mock_cl_service.resolve_citation.return_value = mock_result
        self.mock_cl_service.get_opinion_text.return_value = "<p>Roe v. Wade opinion</p>"
        
        result = self.handler.handle_citation_query("410 U.S. 113")
        
        assert result["status"] == "single"
        assert result["opinion_url"] == "https://www.courtlistener.com/opinion/108713/"
        assert result["text"] == "<p>Roe v. Wade opinion</p>"
        assert result["citation"] == "410 U.S. 113"
        assert result["opinion_id"] == 108713
        assert result["source"] == "CourtListener"
    
    def test_handle_citation_query_not_found(self):
        """Test citation query when no results found."""
        # Mock failed citation resolution
        self.mock_cl_service.resolve_citation.return_value = None
        self.mock_cl_service.search.return_value = None
        
        result = self.handler.handle_citation_query("999 Foo. 1")
        
        assert result["status"] == "not_found"
        assert "Could not find case" in result["message"]
        assert result["citation"] == "999 Foo. 1"
    
    def test_handle_citation_query_with_transformation(self):
        """Test citation query with transformation fallback."""
        # Mock failed direct resolution but successful transformation
        self.mock_cl_service.resolve_citation.side_effect = [None, {
            "id": 108713,
            "data": {"html_with_citations": "<p>Roe v. Wade opinion</p>"},
            "opinion_url": "https://www.courtlistener.com/opinion/108713/",
            "citation": "410 U.S. 113"
        }]
        
        self.mock_cl_service.get_opinion_text.return_value = "<p>Roe v. Wade opinion</p>"
        
        result = self.handler.handle_citation_query("410U S113")
        
        assert result["status"] == "single"
        assert result["transformed_from"] == "410U S113"
    
    def test_handle_citation_query_with_search_fallback(self):
        """Test citation query with search fallback."""
        # Mock failed citation resolution and transformations
        self.mock_cl_service.resolve_citation.return_value = None
        
        # Mock successful search
        mock_search_result = {
            "results": [{
                "id": 108713,
                "html_with_citations": "<p>Roe v. Wade opinion</p>",
                "citation": "410 U.S. 113",
                "case_name": "Roe v. Wade"
            }]
        }
        self.mock_cl_service.search.return_value = mock_search_result
        
        result = self.handler.handle_citation_query("Roe v Wade")
        
        assert result["status"] == "search_result"
        assert result["confidence"] == "low"
        assert result["search_term"] == "Roe v Wade"
    
    def test_generate_citation_transformations(self):
        """Test citation transformation generation."""
        transformations = self.handler._generate_citation_transformations("410 U.S. 113")
        
        # Should include various transformations
        assert "410 US 113" in transformations
        assert "410U.S.113" in transformations
        assert "410 U S 113" in transformations
    
    def test_extract_search_terms(self):
        """Test search term extraction."""
        # Test case name extraction
        terms = self.handler._extract_search_terms("Roe v. Wade 410 U.S. 113")
        assert "Roe v. Wade" in terms
        
        # Test fallback to full query
        terms = self.handler._extract_search_terms("410 U.S. 113")
        assert "410 U.S. 113" in terms


class TestCitationHandlerIntegration:
    """Integration tests for citation handler."""
    
    @patch('app.services.citation_handler.CourtListenerService')
    def test_citation_handler_with_real_service(self, mock_service_class):
        """Test citation handler with real service integration."""
        mock_service = Mock()
        mock_service_class.return_value = mock_service
        
        # Mock successful resolution
        mock_service.resolve_citation.return_value = {
            "id": 108713,
            "data": {"html_with_citations": "<p>Test opinion</p>"},
            "opinion_url": "https://www.courtlistener.com/opinion/108713/",
            "citation": "410 U.S. 113"
        }
        mock_service.get_opinion_text.return_value = "<p>Test opinion</p>"
        
        handler = CitationHandler()
        result = handler.handle_citation_query("410 U.S. 113")
        
        assert result["status"] == "single"
        assert result["opinion_id"] == 108713 
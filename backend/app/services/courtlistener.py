"""
CourtListener API integration for citation resolution and case lookup.
"""

import re
import requests
from urllib.parse import quote
from typing import Optional, Dict, Any
import structlog

logger = structlog.get_logger()

# CourtListener API endpoints
_C_ROOT = "https://www.courtlistener.com/c"
_API = "https://www.courtlistener.com/api/rest/v3"

# Citation parsing regex - matches patterns like "410 U.S. 113"
_CIT_RE = re.compile(r"(?P<vol>\d+)\s+(?P<rep>[A-Za-z.&]+)\s+(?P<page>\d+)")


class CourtListenerService:
    """Service for interacting with CourtListener API."""
    
    def __init__(self, api_key: Optional[str] = None):
        """Initialize the CourtListener service.
        
        Args:
            api_key: Optional API key for authenticated requests
        """
        self.api_key = api_key
        self.session = requests.Session()
        if api_key:
            self.session.headers.update({"Authorization": f"Token {api_key}"})
    
    def parse_citation(self, raw: str) -> tuple[str, str, str]:
        """Parse a citation string into volume, reporter, and page.
        
        Args:
            raw: Raw citation string (e.g., "410 U.S. 113")
            
        Returns:
            Tuple of (volume, reporter, page)
            
        Raises:
            ValueError: If citation cannot be parsed
        """
        m = _CIT_RE.search(raw)
        if not m:
            raise ValueError(f"Can't parse citation: {raw!r}")
        return m.group("vol"), m.group("rep").upper(), m.group("page")
    
    def resolve_citation(self, citation: str) -> Optional[Dict[str, Any]]:
        """Resolve a citation to a CourtListener opinion.
        
        Args:
            citation: Citation string to resolve
            
        Returns:
            Dict with opinion data if found, None otherwise
        """
        try:
            vol, rep, page = self.parse_citation(citation)
            url = f"{_C_ROOT}/{quote(rep)}/{vol}/{page}/"
            
            logger.info("Resolving citation", citation=citation, url=url)
            
            r = self.session.get(url, allow_redirects=True, timeout=10)
            if r.status_code >= 400:
                logger.warning("Citation not found", citation=citation, status_code=r.status_code)
                return None
            
            # Extract opinion ID from final URL
            # Final URL looks like ".../opinion/108713/roe-v-wade/"
            m = re.search(r"/opinion/(?P<id>\d+)/", r.url)
            if not m:
                logger.warning("Could not extract opinion ID from URL", url=r.url)
                return None
            
            opin_id = m.group("id")
            logger.info("Found opinion ID", opinion_id=opin_id)
            
            # Fetch opinion data
            opin_js = self.session.get(f"{_API}/opinions/{opin_id}/").json()
            
            return {
                "id": int(opin_id),
                "data": opin_js,
                "citation": citation,
                "opinion_url": f"https://www.courtlistener.com/opinion/{opin_id}/"
            }
            
        except Exception as e:
            logger.error("Error resolving citation", citation=citation, error=str(e))
            return None
    
    def search(self, query: str, max_results: int = 10) -> Optional[Dict[str, Any]]:
        """Search for opinions using CourtListener's search API.
        
        Args:
            query: Search query string
            max_results: Maximum number of results to return
            
        Returns:
            Search results dict or None if error
        """
        try:
            params = {
                "q": query,
                "type": "o",  # opinions only
                "stat_Precedential": "on",
                "format": "json"
            }
            
            logger.info("Searching CourtListener", query=query, max_results=max_results)
            
            r = self.session.get(f"{_API}/search/", params=params, timeout=10)
            if r.status_code >= 400:
                logger.warning("Search failed", query=query, status_code=r.status_code)
                return None
            
            data = r.json()
            
            # Limit results
            if "results" in data:
                data["results"] = data["results"][:max_results]
            
            return data
            
        except Exception as e:
            logger.error("Error searching CourtListener", query=query, error=str(e))
            return None
    
    def get_opinion_text(self, opinion_data: Dict[str, Any]) -> str:
        """Extract the opinion text from opinion data.
        
        Args:
            opinion_data: Opinion data from CourtListener API
            
        Returns:
            Opinion text (HTML with citations preferred, fallback to plain text)
        """
        # Prefer HTML with citations, fallback to plain text
        text = opinion_data.get("html_with_citations") or opinion_data.get("html") or opinion_data.get("plain_text", "")
        
        if not text:
            logger.warning("No opinion text found", opinion_id=opinion_data.get("id"))
            return "Opinion text not available."
        
        return text


# Convenience function for backward compatibility
def resolve_citation(citation: str) -> Optional[Dict[str, Any]]:
    """Resolve a citation to a CourtListener opinion.
    
    Args:
        citation: Citation string to resolve
        
    Returns:
        Dict with opinion data if found, None otherwise
    """
    service = CourtListenerService()
    return service.resolve_citation(citation) 
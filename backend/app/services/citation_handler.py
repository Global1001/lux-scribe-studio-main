"""
Citation handling service with fallback logic for failed lookups.
"""

from typing import Optional, Dict, Any, List
import structlog
from .courtlistener import CourtListenerService

logger = structlog.get_logger()


class CitationHandler:
    """Handles citation resolution with fallback strategies."""
    
    def __init__(self, courtlistener_service: Optional[CourtListenerService] = None):
        """Initialize the citation handler.
        
        Args:
            courtlistener_service: Optional CourtListener service instance
        """
        self.cl_service = courtlistener_service or CourtListenerService()
    
    def handle_citation_query(self, query: str) -> Dict[str, Any]:
        """Handle a citation query with fallback logic.
        
        Args:
            query: Citation query string
            
        Returns:
            Response dict with status and data
        """
        logger.info("Handling citation query", query=query)
        
        # Try direct citation resolution first
        hit = self.cl_service.resolve_citation(query)
        if hit:
            logger.info("Direct citation resolution successful", citation=query)
            return {
                "status": "single",
                "opinion_url": hit["opinion_url"],
                "text": self.cl_service.get_opinion_text(hit["data"]),
                "citation": hit["citation"],
                "opinion_id": hit["id"],
                "source": "CourtListener"
            }
        
        # Fallback: try citation transformations
        logger.info("Direct resolution failed, trying transformations", citation=query)
        transformed_result = self._try_citation_transformations(query)
        if transformed_result:
            return transformed_result
        
        # Final fallback: search-based approach
        logger.info("Citation transformations failed, trying search", citation=query)
        search_result = self._try_search_fallback(query)
        if search_result:
            return search_result
        
        # No results found
        logger.warning("No results found for citation", citation=query)
        return {
            "status": "not_found",
            "message": f"Could not find case for citation: {query}",
            "citation": query
        }
    
    def _try_citation_transformations(self, citation: str) -> Optional[Dict[str, Any]]:
        """Try common citation transformations.
        
        Args:
            citation: Original citation string
            
        Returns:
            Result dict if successful, None otherwise
        """
        transformations = self._generate_citation_transformations(citation)
        
        for transformed in transformations:
            logger.debug("Trying transformed citation", original=citation, transformed=transformed)
            hit = self.cl_service.resolve_citation(transformed)
            if hit:
                logger.info("Transformation successful", original=citation, transformed=transformed)
                return {
                    "status": "single",
                    "opinion_url": hit["opinion_url"],
                    "text": self.cl_service.get_opinion_text(hit["data"]),
                    "citation": hit["citation"],
                    "opinion_id": hit["id"],
                    "source": "CourtListener",
                    "transformed_from": citation
                }
        
        return None
    
    def _generate_citation_transformations(self, citation: str) -> List[str]:
        """Generate common citation transformations.
        
        Args:
            citation: Original citation string
            
        Returns:
            List of transformed citation strings
        """
        transformations = []
        
        # Common reporter abbreviations and variations
        reporter_variations = {
            "U.S.": ["US", "U S", "United States"],
            "F.2d": ["F. 2d", "F2d", "F 2d", "Federal Reporter, Second Series"],
            "F.3d": ["F. 3d", "F3d", "F 3d", "Federal Reporter, Third Series"],
            "S.Ct.": ["S Ct", "S. Ct", "Supreme Court Reporter"],
            "L.Ed.": ["L Ed", "L. Ed", "Lawyers Edition"],
            "L.Ed.2d": ["L. Ed. 2d", "L Ed 2d", "Lawyers Edition, Second Series"],
        }
        
        # Try to parse the citation
        try:
            vol, rep, page = self.cl_service.parse_citation(citation)
            
            # Add original with different spacing
            transformations.append(f"{vol} {rep} {page}")
            transformations.append(f"{vol}{rep}{page}")
            transformations.append(f"{vol} {rep.replace('.', '')} {page}")
            
            # Try reporter variations
            for original, variations in reporter_variations.items():
                if rep.upper() == original.upper():
                    for variation in variations:
                        transformations.append(f"{vol} {variation} {page}")
                        transformations.append(f"{vol}{variation}{page}")
            
            # Try without spaces around reporter
            transformations.append(f"{vol}{rep}{page}")
            
        except ValueError:
            # If we can't parse, try some basic transformations
            transformations.extend([
                citation.replace(" ", ""),
                citation.replace("  ", " "),
                citation.upper(),
                citation.lower()
            ])
        
        # Remove duplicates and original
        unique_transformations = list(set(transformations))
        if citation in unique_transformations:
            unique_transformations.remove(citation)
        
        return unique_transformations[:10]  # Limit to 10 transformations
    
    def _try_search_fallback(self, query: str) -> Optional[Dict[str, Any]]:
        """Try search-based fallback when citation resolution fails.
        
        Args:
            query: Original query string
            
        Returns:
            Result dict if successful, None otherwise
        """
        # Extract potential search terms from the query
        search_terms = self._extract_search_terms(query)
        
        for term in search_terms:
            logger.debug("Trying search term", original=query, search_term=term)
            search_results = self.cl_service.search(term, max_results=5)
            
            if search_results and search_results.get("results"):
                # Return the first result as a potential match
                first_result = search_results["results"][0]
                logger.info("Search fallback successful", original=query, search_term=term)
                
                return {
                    "status": "search_result",
                    "opinion_url": f"https://www.courtlistener.com/opinion/{first_result.get('id')}/",
                    "text": first_result.get("html_with_citations") or first_result.get("plain_text", "Text not available"),
                    "citation": first_result.get("citation", query),
                    "opinion_id": first_result.get("id"),
                    "source": "CourtListener",
                    "search_term": term,
                    "confidence": "low"
                }
        
        return None
    
    def _extract_search_terms(self, query: str) -> List[str]:
        """Extract potential search terms from a citation query.
        
        Args:
            query: Original query string
            
        Returns:
            List of potential search terms
        """
        terms = []
        
        # Try to extract case name patterns
        # Look for patterns like "Roe v. Wade" or "Brown v. Board"
        case_name_patterns = [
            r"([A-Z][a-z]+ v\. [A-Z][a-z]+)",
            r"([A-Z][a-z]+ v [A-Z][a-z]+)",
            r"([A-Z][a-z]+ vs\. [A-Z][a-z]+)",
            r"([A-Z][a-z]+ vs [A-Z][a-z]+)",
        ]
        
        import re
        for pattern in case_name_patterns:
            matches = re.findall(pattern, query)
            terms.extend(matches)
        
        # If no case names found, try the whole query
        if not terms:
            terms.append(query)
        
        # Add variations
        variations = []
        for term in terms:
            variations.extend([
                term,
                term.replace(" v. ", " "),
                term.replace(" v ", " "),
                term.replace(" vs. ", " "),
                term.replace(" vs ", " "),
            ])
        
        return list(set(variations))[:5]  # Limit to 5 search terms


# Convenience function for backward compatibility
def handle_citation_query(query: str) -> Dict[str, Any]:
    """Handle a citation query with fallback logic.
    
    Args:
        query: Citation query string
        
    Returns:
        Response dict with status and data
    """
    handler = CitationHandler()
    return handler.handle_citation_query(query) 
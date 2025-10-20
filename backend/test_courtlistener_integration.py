#!/usr/bin/env python3
"""
Simple integration test script for CourtListener API.
Run this to verify the integration works with real API calls.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.courtlistener import CourtListenerService
from app.services.citation_handler import CitationHandler


def test_courtlistener_integration():
    """Test the CourtListener integration with real API calls."""
    print("🧪 Testing CourtListener Integration")
    print("=" * 50)
    
    # Initialize services
    cl_service = CourtListenerService()
    handler = CitationHandler(cl_service)
    
    # Test cases
    test_cases = [
        "410 U.S. 113",  # Roe v. Wade
        "384 U.S. 436",  # Miranda v. Arizona
        "347 U.S. 483",  # Brown v. Board
        "999 Foo. 1",    # Should fail
    ]
    
    for citation in test_cases:
        print(f"\n📋 Testing citation: {citation}")
        print("-" * 30)
        
        try:
            # Test direct resolution
            print("  🔍 Testing direct resolution...")
            result = cl_service.resolve_citation(citation)
            
            if result:
                print(f"  ✅ Found: {result['data'].get('case_name', 'Unknown case')}")
                print(f"     Opinion ID: {result['id']}")
                print(f"     URL: {result['opinion_url']}")
            else:
                print("  ❌ Not found")
            
            # Test handler with fallback
            print("  🔄 Testing handler with fallback...")
            handler_result = handler.handle_citation_query(citation)
            
            print(f"  📊 Status: {handler_result['status']}")
            if handler_result['status'] == 'single':
                print(f"     Source: {handler_result['source']}")
                if 'transformed_from' in handler_result:
                    print(f"     Transformed from: {handler_result['transformed_from']}")
            elif handler_result['status'] == 'search_result':
                print(f"     Search term: {handler_result['search_term']}")
                print(f"     Confidence: {handler_result['confidence']}")
            elif handler_result['status'] == 'not_found':
                print(f"     Message: {handler_result['message']}")
                
        except Exception as e:
            print(f"  💥 Error: {str(e)}")
    
    print("\n" + "=" * 50)
    print("✅ Integration test completed!")


if __name__ == "__main__":
    test_courtlistener_integration() 
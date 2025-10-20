#!/usr/bin/env python3
"""
Debug script for PDF to DOCX conversion endpoint.
This script helps identify issues with the conversion process.
"""

import requests
import json

# Configuration
BACKEND_URL = "http://localhost:8001"
CONVERT_ENDPOINT = f"{BACKEND_URL}/api/v1/convert/convert-existing-pdf"

def test_endpoint_with_debug():
    """Test the endpoint with debugging information."""
    
    # Test data
    test_file_id = "test-file-id-123"
    
    payload = {
        "file_id": test_file_id
    }
    
    print(f"🔍 Testing endpoint: {CONVERT_ENDPOINT}")
    print(f"📦 Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            CONVERT_ENDPOINT,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        try:
            response_json = response.json()
            print(f"📄 Response Body: {json.dumps(response_json, indent=2)}")
        except:
            print(f"📄 Response Body (raw): {response.text}")
            
        if response.status_code == 422:
            print("\n❌ 422 Error Analysis:")
            print("This usually means the request body format is incorrect.")
            print("Expected: JSON with 'file_id' field")
            print(f"Sent: {payload}")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_health_endpoint():
    """Test if the backend is running."""
    try:
        response = requests.get(f"{BACKEND_URL}/health")
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except:
        print("❌ Cannot connect to backend")
        return False

def main():
    print("🚀 Starting debug session for PDF conversion endpoint...\n")
    
    # Test backend health first
    if not test_health_endpoint():
        print("❌ Backend is not available. Please start it first.")
        return
    
    print()
    test_endpoint_with_debug()
    
    print("\n📝 Debug Summary:")
    print("1. If you get 422 error, check the request body format")
    print("2. If you get 404 error, the file_id doesn't exist in the database")
    print("3. If you get 500 error, check the backend logs for detailed error info")
    print("4. Make sure you have a valid PDF file uploaded to test with")

if __name__ == "__main__":
    main() 
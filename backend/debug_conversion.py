"""
Debug script for PDF to DOCX conversion issues.
This script tests different conversion parameters to fix corrupted output files.
"""

import os
import argparse
import structlog
from pdf2docx import Converter, parse
import tempfile
import time

logger = structlog.get_logger()

def test_conversion_parameters(pdf_path, output_dir=None):
    """
    Test different parameter combinations to find the best conversion settings.
    
    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save the converted files (default: same as PDF)
    """
    if not os.path.exists(pdf_path):
        print(f"Error: File not found - {pdf_path}")
        return
    
    if not output_dir:
        output_dir = os.path.dirname(pdf_path) or "."
    
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    
    # Define parameter sets to test
    parameter_sets = [
        {
            "name": "default",
            "params": {}
        },
        {
            "name": "optimized",
            "params": {
                "connected_border_tolerance": 0.8,
                "line_separate_threshold": 6.0,
                "float_image_ignorable_gap": 6.0,
                "line_break_width_ratio": 0.1,
                "line_break_free_space_ratio": 0.05
            }
        },
        {
            "name": "conservative",
            "params": {
                "connected_border_tolerance": 1.0,
                "max_border_width": 8.0,
                "min_border_clearance": 1.5,
                "float_image_ignorable_gap": 8.0,
                "page_margin_factor_top": 0.7,
                "page_margin_factor_bottom": 0.7,
                "shape_min_dimension": 1.5,
                "line_separate_threshold": 8.0,
                "ignore_page_error": True
            }
        },
        {
            "name": "aggressive",
            "params": {
                "connected_border_tolerance": 0.3,
                "max_border_width": 4.0,
                "min_border_clearance": 3.0,
                "float_image_ignorable_gap": 3.0,
                "page_margin_factor_top": 0.3,
                "page_margin_factor_bottom": 0.3,
                "shape_min_dimension": 3.0,
                "line_separate_threshold": 3.0,
                "line_break_width_ratio": 0.2,
                "line_break_free_space_ratio": 0.2
            }
        }
    ]
    
    results = []
    
    print(f"Testing conversion parameters for: {pdf_path}")
    print(f"Output directory: {output_dir}")
    print("-" * 50)
    
    # First test the simple parse() function
    print("\nTesting parse() function (recommended method):")
    output_path = os.path.join(output_dir, f"{base_name}_parse.docx")
    
    start_time = time.time()
    success = False
    error_msg = None
    
    try:
        # Convert using parse() function
        parse(pdf_path, output_path)
        
        # Check if conversion was successful
        if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
            success = True
            print(f"✓ Conversion successful: {output_path}")
        else:
            error_msg = "Output file is empty or not created"
            print(f"✗ Conversion failed: {error_msg}")
    
    except Exception as e:
        error_msg = str(e)
        print(f"✗ Conversion error: {error_msg}")
    
    end_time = time.time()
    duration = end_time - start_time
    
    results.append({
        "set_name": "parse",
        "success": success,
        "duration": duration,
        "error": error_msg,
        "output_path": output_path
    })
    
    print(f"Time taken: {duration:.2f} seconds")
    print("-" * 50)
    
    # Now test the Converter class with different parameter sets
    print("\nTesting Converter class with different parameter sets:")
    for param_set in parameter_sets:
        set_name = param_set["name"]
        params = param_set["params"]
        
        output_path = os.path.join(output_dir, f"{base_name}_{set_name}.docx")
        
        print(f"\nTesting parameter set: {set_name}")
        print(f"Output file: {output_path}")
        
        start_time = time.time()
        success = False
        error_msg = None
        
        try:
            # Convert PDF to DOCX using the parameter set
            cv = Converter(pdf_path)
            cv.convert(output_path, start=0, end=None, **params)
            cv.close()
            
            # Check if conversion was successful
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                success = True
                print(f"✓ Conversion successful: {output_path}")
            else:
                error_msg = "Output file is empty or not created"
                print(f"✗ Conversion failed: {error_msg}")
        
        except Exception as e:
            error_msg = str(e)
            print(f"✗ Conversion error: {error_msg}")
        
        end_time = time.time()
        duration = end_time - start_time
        
        results.append({
            "set_name": set_name,
            "success": success,
            "duration": duration,
            "error": error_msg,
            "output_path": output_path
        })
        
        print(f"Time taken: {duration:.2f} seconds")
    
    print("\n" + "=" * 50)
    print("SUMMARY OF RESULTS:")
    print("=" * 50)
    
    successful_sets = [r for r in results if r["success"]]
    
    if successful_sets:
        print(f"\nSuccessful conversions: {len(successful_sets)}/{len(results)}")
        for result in successful_sets:
            print(f"- {result['set_name']}: {result['output_path']} ({result['duration']:.2f}s)")
        
        # Recommend the fastest successful set
        fastest = min(successful_sets, key=lambda x: x["duration"])
        print(f"\nRecommended method: {fastest['set_name']}")
        if fastest['set_name'] == 'parse':
            print("Use the parse() function for best results:")
            print("from pdf2docx import parse")
            print(f"parse('{pdf_path}', 'output.docx')")
        else:
            print(f"Parameters: {parameter_sets[next(i for i, p in enumerate(parameter_sets) if p['name'] == fastest['set_name'])]['params']}")
    else:
        print("\nNo successful conversions. All methods failed.")
        print("Try with a different PDF file or consider using an alternative conversion tool.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Debug PDF to DOCX conversion issues")
    parser.add_argument("pdf_file", help="Path to the PDF file to convert")
    parser.add_argument("--output-dir", help="Directory to save the converted files")
    
    args = parser.parse_args()
    test_conversion_parameters(args.pdf_file, args.output_dir) 
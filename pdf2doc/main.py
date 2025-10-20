import os
from pdf2docx import Converter

def convert_pdf_to_docx():
    """Convert PDF files with enhanced settings for better accuracy"""
    
    pdf_files = [f for f in os.listdir('.') if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print("No PDF files found")
        return
    
    for pdf_file in pdf_files:
        try:
            base_name = os.path.splitext(pdf_file)[0]
            output_file = f"convert_{base_name}.docx"
            
            print(f"Converting: {pdf_file}")
            
            cv = Converter(pdf_file)
            cv.convert(
                docx_filename=output_file,
                start=0,
                end=None,
                pages=None,
                multi_processing=True,
                cpu_count=None,
                connected_border_tolerance=0.5,
                max_border_width=6.0,
                min_border_clearance=2.0,
                float_image_ignorable_gap=5.0,
                page_margin_factor_top=0.5,
                page_margin_factor_bottom=0.5,
                shape_min_dimension=2.0,
                line_separate_threshold=5.0,
                line_break_width_ratio=0.1,
                line_break_free_space_ratio=0.1,
                lines_left_aligned_threshold=1.0,
                lines_right_aligned_threshold=1.0,
                lines_center_aligned_threshold=2.0,
                clip_image_res_ratio=3.0,
                curve_path_ratio=0.2,
                max_image_width=None,
                max_image_height=None
            )
            cv.close()
            
            if os.path.exists(output_file):
                print(f"Converted: {output_file}")
            else:
                print(f"Failed: {pdf_file}")
                
        except Exception as e:
            print(f"Error: {pdf_file} - {str(e)}")

if __name__ == "__main__":
    convert_pdf_to_docx()

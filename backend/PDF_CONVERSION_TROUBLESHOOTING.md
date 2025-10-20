# PDF to DOCX Conversion Troubleshooting Guide

## Common Issues with PDF to DOCX Conversion

PDF to DOCX conversion can sometimes result in corrupted or improperly formatted output files. This guide will help you troubleshoot and fix these issues.

## Symptoms of Corrupted DOCX Files

- The DOCX file cannot be opened in Microsoft Word or other word processors
- The file opens but contains garbled text or missing content
- Word reports that the file is corrupted and attempts to repair it
- The file appears empty or contains only a portion of the original content

## Using the Debug Conversion Script

We've created a debug script to help identify the best conversion parameters for problematic PDF files. The script tests multiple parameter sets and recommends the most effective one.

### How to Use the Debug Script

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Run the debug script with the problematic PDF file:
   ```
   python debug_conversion.py path/to/your/file.pdf
   ```

3. Optionally, specify an output directory:
   ```
   python debug_conversion.py path/to/your/file.pdf --output-dir path/to/output
   ```

4. The script will create multiple DOCX files with different parameter sets and report which ones worked best.

## Alternative Conversion Methods

If you're still experiencing issues with corrupted DOCX files, we've provided several alternative scripts to help:

### 1. Simple Test Conversion

The `test_conversion.py` script uses the simpler `parse()` function which may work better for some PDFs:

```
python test_conversion.py path/to/your/file.pdf
```

### 2. Alternative Conversion Methods

The `alternative_conversion.py` script tries multiple approaches to convert your PDF:

```
python alternative_conversion.py path/to/your/file.pdf
```

This script will:
- Try direct conversion using PyMuPDF (extracts text and images)
- Try using external tools like LibreOffice if available
- Generate multiple output files with different methods

### 3. Repair Corrupted DOCX Files

If you already have a corrupted DOCX file, the `repair_docx.py` script might be able to fix it:

```
python repair_docx.py path/to/your/corrupted.docx
```

This script attempts two repair methods:
- Simple open and resave with python-docx
- Extract and rebuild the DOCX file structure

## Conversion Parameters

The pdf2docx library offers several parameters that can be adjusted to improve conversion quality:

| Parameter | Description | Default | Recommended Range |
|-----------|-------------|---------|------------------|
| `connected_border_tolerance` | Tolerance for connected borders | 0.5 | 0.3-1.0 |
| `max_border_width` | Maximum border width | 6.0 | 4.0-8.0 |
| `min_border_clearance` | Minimum border clearance | 2.0 | 1.5-3.0 |
| `float_image_ignorable_gap` | Gap tolerance for floating images | 5.0 | 3.0-8.0 |
| `page_margin_factor_top` | Top margin reduction factor | 0.5 | 0.3-0.7 |
| `page_margin_factor_bottom` | Bottom margin reduction factor | 0.5 | 0.3-0.7 |
| `shape_min_dimension` | Minimum shape dimension | 2.0 | 1.5-3.0 |
| `line_separate_threshold` | Line separation threshold | 5.0 | 3.0-8.0 |
| `line_break_width_ratio` | Line break width ratio | 0.5 | 0.1-0.5 |
| `line_break_free_space_ratio` | Free space ratio for line breaks | 0.1 | 0.05-0.2 |

## Manual Fixes for Specific Issues

### 1. Text Formatting Issues

If the converted document has issues with text formatting:
- Try increasing the `line_separate_threshold` to 6.0 or higher
- Reduce `line_break_width_ratio` to 0.1
- Reduce `line_break_free_space_ratio` to 0.05

### 2. Table Detection Issues

If tables are not properly detected or formatted:
- Increase `connected_border_tolerance` to 0.8 or higher
- Increase `max_border_width` to 8.0
- Reduce `min_border_clearance` to 1.5

### 3. Image Placement Issues

If images are misplaced or missing:
- Increase `float_image_ignorable_gap` to 6.0 or higher
- Reduce `shape_min_dimension` to 1.5

### 4. Page Layout Issues

If the overall page layout is incorrect:
- Adjust `page_margin_factor_top` and `page_margin_factor_bottom` (0.3 for tighter margins, 0.7 for looser margins)

## Using Optimized Parameters in Your Code

Once you've found parameters that work well for your PDF files, you can use them in your code:

```python
from pdf2docx import Converter

cv = Converter("input.pdf")
cv.convert(
    "output.docx",
    start=0,
    end=None,
    connected_border_tolerance=0.8,
    line_separate_threshold=6.0,
    float_image_ignorable_gap=6.0,
    line_break_width_ratio=0.1,
    line_break_free_space_ratio=0.05
)
cv.close()
```

## Additional Tips

1. **Pre-process PDFs**: Sometimes, saving the PDF with a different PDF reader or converter before attempting the pdf2docx conversion can fix issues.

2. **Check PDF Version**: Newer PDF versions (1.7+) may have features that are not fully supported. Try converting to PDF 1.4 first.

3. **Simplify Complex PDFs**: PDFs with complex layouts, custom fonts, or special features may not convert well. Consider simplifying them if possible.

4. **Split Large PDFs**: For very large PDFs, try splitting them into smaller files and converting each separately.

5. **Alternative Approach**: For critical documents, consider using OCR-based conversion tools as an alternative. 
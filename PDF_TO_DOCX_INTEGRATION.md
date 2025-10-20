# PDF to DOCX Conversion Integration

## Overview

This document describes the PDF to DOCX conversion functionality integrated into LuxScribe Studio. The feature allows users to convert PDF files to DOCX format using the official `pdf2docx` library, providing high-quality conversions with proper layout preservation.

## Features

- **Right-click conversion**: Convert PDF files directly from the file explorer context menu
- **High-quality conversion**: Uses the official `pdf2docx` library for accurate document conversion
- **Automatic file management**: Converted DOCX files are automatically saved to your document library
- **Progress feedback**: Real-time notifications during the conversion process
- **Error handling**: Comprehensive error handling with user-friendly messages

## How to Use

### Method 1: Convert Existing PDF Files

1. **Upload a PDF file** to your document library (if not already uploaded)
2. **Right-click** on the PDF file in the Files Explorer
3. **Select "Convert to DOCX"** from the context menu
4. **Wait for conversion** - you'll see a progress notification
5. **Find the converted file** - the DOCX file will appear in your document library

### Method 2: Upload and Convert New PDF Files

1. **Upload a PDF file** using the upload button in the Files Explorer
2. **Follow steps 2-5** from Method 1 above

## Technical Implementation

### Backend Components

#### 1. API Endpoints

**`/api/v1/convert/convert-to-docx`** (POST)
- Converts uploaded PDF files to DOCX
- Accepts multipart/form-data with PDF file
- Returns the converted DOCX file as a download

**`/api/v1/convert/convert-existing-pdf`** (POST)
- Converts existing PDF files from the database
- Accepts JSON with `file_id` parameter
- Returns conversion status and new file information

#### 2. Dependencies

```python
# Added to requirements.txt
pdf2docx>=0.5.8
supabase>=2.0.0
```

#### 3. Conversion Process

1. **File Validation**: Ensures the file is a valid PDF
2. **Temporary File Creation**: Creates temporary files for processing
3. **PDF Conversion**: Uses `pdf2docx.Converter` for high-quality conversion
4. **File Storage**: Saves converted DOCX to Supabase storage
5. **Database Update**: Updates file metadata in the database
6. **Cleanup**: Removes temporary files after processing

### Frontend Components

#### 1. File Detection

```typescript
// Check if the file is a PDF
const isPdfFile = item.type === 'file' && item.name.toLowerCase().endsWith('.pdf');
```

#### 2. Context Menu Integration

```typescript
{isPdfFile && (
  <>
    <ContextMenuSeparator />
    <ContextMenuItem onClick={handleConvertToDocx}>
      <FileText className="h-4 w-4 mr-2" />
      Convert to DOCX
    </ContextMenuItem>
  </>
)}
```

#### 3. Conversion Handler

```typescript
const handleConvertToDocx = async (e: React.MouseEvent) => {
  // Show progress notification
  toast({
    title: "Converting PDF to DOCX",
    description: "Please wait while we convert your PDF file...",
  });

  // Call backend API
  const response = await fetch(`${appConfig.backend.url}/api/v1/convert/convert-existing-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ file_id: item.supabaseFileId }),
  });

  // Handle response and refresh file list
  // ...
};
```

## Configuration

### Backend Configuration

The conversion feature uses the following configuration from `backend/app/config/settings.py`:

```python
# Supabase configuration (required for file storage)
SUPABASE_URL: str = env_config.SUPABASE_URL
SUPABASE_SERVICE_KEY: str = env_config.SUPABASE_SERVICE_KEY
```

### Frontend Configuration

The frontend uses the backend API configuration from `src/lib/config.ts`:

```typescript
backend: {
  port: parseInt(import.meta.env.VITE_BACKEND_PORT || '8001'),
  host: import.meta.env.VITE_BACKEND_HOST || 'localhost',
  protocol: 'http',
  get apiBaseUrl() {
    return `${this.url}/api/v1`;
  }
}
```

## Error Handling

### Common Errors and Solutions

1. **"Only PDF files are supported"**
   - **Cause**: Trying to convert a non-PDF file
   - **Solution**: Ensure the file is a valid PDF

2. **"File not found"**
   - **Cause**: The PDF file doesn't exist in the database or storage
   - **Solution**: Verify the file exists and try refreshing the file list

3. **"Conversion failed - output file not created"**
   - **Cause**: The pdf2docx library couldn't process the PDF
   - **Solution**: Try with a different PDF file or check if the PDF is corrupted

4. **"Backend server is not available"**
   - **Cause**: The backend server is not running
   - **Solution**: Start the backend server

### Logging

The backend provides detailed logging for debugging:

```python
logger.info("Starting PDF to DOCX conversion", 
           original_filename=file.filename,
           pdf_path=tmp_pdf_path,
           docx_path=tmp_docx_path)

logger.info("PDF to DOCX conversion completed successfully",
           original_filename=file.filename,
           output_size=os.path.getsize(tmp_docx_path))
```

## Testing

### Automated Testing

Run the test script to verify the conversion functionality:

```bash
python test_pdf_conversion.py
```

This script tests:
- Backend server connectivity
- pdf2docx library installation
- PDF to DOCX conversion endpoint

### Manual Testing

1. **Start the backend server**:
   ```bash
   cd backend
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

2. **Start the frontend**:
   ```bash
   npm run dev
   ```

3. **Upload a PDF file** through the frontend interface

4. **Right-click** on the PDF file and select "Convert to DOCX"

5. **Verify** that the DOCX file appears in your document library

## Performance Considerations

### Conversion Speed

- **Small PDFs** (< 1MB): Usually convert in 1-3 seconds
- **Medium PDFs** (1-10MB): May take 5-15 seconds
- **Large PDFs** (> 10MB): Can take 30+ seconds

### Memory Usage

The conversion process uses temporary files to minimize memory usage:
- PDF files are temporarily stored during processing
- Converted DOCX files are cleaned up after upload
- Memory usage scales with PDF file size

### Concurrent Conversions

The system supports multiple concurrent conversions:
- Each conversion uses its own temporary files
- No shared state between conversion processes
- Supabase handles concurrent file uploads

## Troubleshooting

### Installation Issues

If you encounter issues with the pdf2docx library:

```bash
# Install with specific version
pip install pdf2docx==0.5.8

# Install with all dependencies
pip install pdf2docx[all]

# Update existing installation
pip install --upgrade pdf2docx
```

### File Permission Issues

Ensure the backend has proper permissions:
- Read access to uploaded PDF files
- Write access to temporary directory
- Network access to Supabase storage

### Storage Issues

Monitor Supabase storage usage:
- Check storage quotas
- Verify file upload permissions
- Monitor database connection limits

## Future Enhancements

### Planned Features

1. **Batch Conversion**: Convert multiple PDF files at once
2. **Conversion Options**: Allow users to specify conversion parameters
3. **Progress Tracking**: Show detailed progress for large files
4. **Quality Settings**: Different conversion quality levels
5. **Preview**: Preview converted content before saving

### Configuration Options

Future versions may include:
- Custom conversion parameters
- Output format options
- Compression settings
- Page range selection

## Support

For issues or questions:
1. Check the error logs in the backend console
2. Verify all dependencies are installed correctly
3. Test with the provided test script
4. Check network connectivity to Supabase

## Changelog

### Version 1.0.0
- Initial implementation with pdf2docx library
- Right-click context menu integration
- Automatic file management
- Error handling and user feedback
- Test script for verification 
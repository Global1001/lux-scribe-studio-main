# PDF to DOCX Converter

A Python-based tool for converting PDF files to DOCX format with enhanced accuracy and customizable conversion parameters. This project is optimized for AWS SageMaker environments.

## Overview

This converter uses the `pdf2docx` library with fine-tuned parameters to provide high-quality PDF to DOCX conversion. It automatically processes all PDF files in the current directory and generates corresponding DOCX files with improved layout detection, image handling, and text formatting.

## Features

- **Batch Processing**: Converts all PDF files in the current directory
- **Multi-processing Support**: Utilizes multiple CPU cores for faster conversion
- **Enhanced Accuracy**: Fine-tuned parameters for better layout and formatting preservation
- **Image Handling**: Optimized image resolution and size controls
- **Error Handling**: Robust error handling with detailed feedback
- **AWS SageMaker Ready**: Pre-configured for SageMaker environments

## Prerequisites

- AWS SageMaker environment
- Conda package manager
- Python 3.10+
- Access to private GitHub repository

## Project Structure

```
pdf-to-docx-converter/
├── environment.yml          # Conda environment configuration
├── requirements.txt         # Python dependencies
├── main.py                 # Main conversion script
└── README.md              # This file
```

## Installation & Setup

### Step 1: Clone the Repository

In your SageMaker terminal, clone this private repository:

```bash
git clone https://github.com/your-username/your-private-repo.git
cd your-private-repo
```

> **Note**: Ensure you have proper authentication set up for accessing private GitHub repositories in SageMaker. You may need to configure SSH keys or personal access tokens.

### Step 2: Create Conda Environment

Create the conda environment using the provided configuration:

```bash
conda env create -f environment.yml
```

This will create an environment named `myenv` with all required dependencies.

### Step 3: Initialize Conda

Initialize conda for your bash shell (required for SageMaker):

```bash
conda init bash
```

### Step 4: Reload Shell Configuration

Reload your bash configuration to apply conda initialization:

```bash
source ~/.bashrc
```

### Step 5: Activate Environment

Activate the newly created environment:

```bash
conda activate myenv
```

Your prompt should now show `(myenv)` indicating the environment is active.

## Usage

### Basic Usage

1. Place your PDF files in the same directory as `main.py`
2. Run the conversion script:

```bash
python main.py
```

### Expected Output

The script will:

- Automatically detect all PDF files in the current directory
- Convert each PDF to DOCX format
- Save output files with the prefix `convert_` (e.g., `document.pdf` → `convert_document.docx`)
- Display progress and status messages

### Example Output

```
Converting: document1.pdf
Converted: convert_document1.docx
Converting: report.pdf
Converted: convert_report.docx
```

## Configuration

The converter uses optimized parameters for high-quality conversion:

- **Multi-processing**: Enabled for faster processing
- **Border Detection**: Fine-tuned tolerance and clearance settings
- **Image Processing**: Optimized resolution and gap handling
- **Text Alignment**: Enhanced threshold settings for better layout preservation
- **Margin Handling**: Balanced top and bottom margin factors

## Dependencies

### Core Dependencies

- `pdf2docx>=0.5.6` - Main conversion library
- `PyMuPDF>=1.19.0` - PDF processing backend
- `python-docx>=0.8.10` - DOCX file handling
- `lxml>=4.6.0` - XML processing
- `fonttools>=4.25.0` - Font handling

### Environment Management

- Python 3.10
- Conda package manager

## Troubleshooting

### Common Issues

**1. Conda activation error:**

```
CondaError: Run 'conda init' before 'conda activate'
```

**Solution**: Run `conda init bash` followed by `source ~/.bashrc`

**2. No PDF files found:**

```
No PDF files found
```

**Solution**: Ensure PDF files are in the same directory as `main.py`

**3. Permission errors:**
**Solution**: Check file permissions and ensure write access to the directory

**4. Memory issues with large PDFs:**
**Solution**: Process files individually or increase SageMaker instance memory

### GitHub Authentication in SageMaker

If you encounter authentication issues when cloning private repositories:

**Option 1: Personal Access Token**

```bash
git clone https://username:token@github.com/username/repo.git
```

**Option 2: SSH Key Setup**

```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
# Add the public key to your GitHub account
```

## Performance Optimization

For better performance in SageMaker:

1. **Use appropriate instance types**: Choose instances with sufficient CPU cores for multi-processing
2. **Batch processing**: Process multiple files in sequence rather than parallel for memory efficiency
3. **Monitor resources**: Use SageMaker's monitoring tools to track CPU and memory usage

## Support

For issues related to:

- **PDF conversion quality**: Adjust parameters in `main.py`
- **Performance**: Consider instance type and file size optimization
- **Dependencies**: Check `environment.yml` and `requirements.txt`

**Note**: This project is designed specifically for AWS SageMaker environments. For local development, you may need to adjust the setup steps accordingly.

# TestTrek - Test Execution Tracker

A web-based tool for tracking test execution results. This tool allows testers to import test cases from CSV, update their execution status, add comments, and export the results back to CSV.

## Features

- Import test cases from CSV
- Track test execution status (PASSED, FAILED, EXECUTING, TODO, BLOCKED, N/A)
- Add comments for each test case
- Export results back to CSV
- Dark/Light theme support
- Responsive design

## Setup Instructions

1. Download the project files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `sample_test_cases.csv` (included in the repository)

2. Open the project:
   - Simply open the `index.html` file in your web browser
   - No server setup required as it runs entirely in the browser

3. Required Dependencies:
   - The application uses CDN links for:
     - Bootstrap 5.3.0
     - Font Awesome 6.0.0
     - PapaParse 5.3.0
   - These are automatically loaded when you open the HTML file

## Usage Instructions

1. Enter your name in the "Executed By" field
2. Click "Choose File" and select your CSV file containing test cases
3. Click "Import Test Cases" to load the test cases
4. For each test case:
   - Review the test details
   - Click on the appropriate status indicator (PASSED, FAILED, etc.)
   - Add any comments in the comment section
5. Click "Export CSV" to download the updated test results

## CSV Format

The CSV file should contain the following columns:
- S.No (optional)
- Summary (mandatory)
- Data (mandatory)
- test steps (mandatory)
- exppected result (mandatory)
- Execution status (optional)
- Execution last modified timestamp (optional)
- Executed by (optional)
- reporter (optional)
- comment (optional)

## Notes

- The application automatically validates the CSV file for required fields
- All changes are saved in the browser's memory until exported
- The exported CSV will maintain the original format while updating the execution details 
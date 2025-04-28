# TestTrek - Test Execution Tracker

A full-stack web application for tracking test execution results. This tool allows testers to import test cases from CSV, update their execution status, add comments, and export the results back to CSV.

## Features

- Import test cases from CSV
- Track test execution status (PASSED, FAILED, EXECUTING, TODO, BLOCKED, N/A)
- Add comments for each test case
- Export results back to CSV
- Dark/Light theme support
- Responsive design
- Backend API for data persistence
- User authentication and authorization

## Project Structure

```
TestTrek/
├── backend/           # Python Flask backend
├── static/           # Frontend assets
│   ├── css/         # Stylesheets
│   ├── js/          # JavaScript files
│   └── index.html   # Main application page
├── TT.csv           # Sample test cases
└── README.md        # This file
```

## Setup Instructions

1. Backend Setup:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   python app.py
   ```

2. Frontend Setup:
   - The frontend is served by the Flask backend
   - Access the application at `http://localhost:5000`

3. Required Dependencies:
   - Backend:
     - Python 3.8+
     - Flask
     - Other dependencies listed in `requirements.txt`
   - Frontend (loaded via CDN):
     - Bootstrap 5.3.0
     - Font Awesome 6.0.0
     - PapaParse 5.3.0

## Usage Instructions

1. Start the backend server
2. Open your web browser and navigate to `http://localhost:5000`
3. Enter your credentials to log in
4. Click "Choose File" and select your CSV file containing test cases
5. Click "Import Test Cases" to load the test cases
6. For each test case:
   - Review the test details
   - Click on the appropriate status indicator (PASSED, FAILED, etc.)
   - Add any comments in the comment section
7. Click "Export CSV" to download the updated test results

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

- The application validates the CSV file for required fields
- All changes are persisted in the backend database
- The exported CSV will maintain the original format while updating the execution details
- User authentication is required to access the application 
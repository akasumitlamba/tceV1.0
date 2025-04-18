# Test Execution Tracker - Testing Guide

## Overview
This document provides guidance for testing the Test Execution Tracker application. The focus is on functionality testing rather than UI testing.

## Test Environment Setup
1. Download all project files:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `sample_test_cases.csv`
2. Open `index.html` in a web browser
3. Ensure you have a CSV editor (like Excel or Google Sheets) to verify the exported files

## Test Cases

### 1. CSV Import Functionality
**Test Steps:**
1. Enter a name in the "Executed By" field
2. Click "Choose File" and select `sample_test_cases.csv`
3. Click "Import Test Cases"

**Expected Results:**
- Test cases should be loaded and displayed
- Each test case should show:
  - Summary
  - Prerequisites (Data)
  - Test Steps
  - Expected Result
  - Status indicators
  - Comment section

### 2. Test Case Status Updates
**Test Steps:**
1. Import the sample CSV file
2. For each test case:
   - Click different status indicators (PASSED, FAILED, EXECUTING, TODO, BLOCKED, N/A)
   - Verify the status updates visually

**Expected Results:**
- Status should update immediately when clicked
- Only one status can be selected at a time
- Status changes should persist until export

### 3. Comment Updates
**Test Steps:**
1. Import the sample CSV file
2. For each test case:
   - Add comments in the comment section

**Expected Results:**
- Comments should be saved
- Changes should persist until export

### 4. CSV Export Functionality
**Test Steps:**
1. Import the sample CSV file
2. Make changes to test cases (status, comments)
3. Click "Export CSV"
4. Open the downloaded CSV file in a spreadsheet editor

**Expected Results:**
- CSV file should download successfully
- All changes made in the application should be reflected in the exported CSV
- Original CSV structure should be maintained with the following columns:
  - S.No
  - Summary
  - Data
  - test steps
  - exppected result
  - Execution status
  - Execution last modified timestamp
  - Executed by
  - reporter
  - comment

### 5. Data Validation
**Test Steps:**
1. Create a CSV file missing mandatory fields
2. Try to import the file

**Expected Results:**
- Application should show an error message listing missing mandatory fields
- Test cases should not be loaded

## Verification Points
When testing, verify:
1. All imported test cases are displayed correctly
2. Status changes are saved and reflected in the export
3. Comments are properly saved and exported
4. The exported CSV maintains the correct format
5. Data validation works for missing mandatory fields
6. The application handles large CSV files appropriately

## Common Issues to Watch For
1. CSV import fails with incorrect file format
2. Status changes not saving correctly
3. Comments not appearing in exported CSV
4. Application freezing with large CSV files
5. Data loss between import and export

## Notes
- Focus on functionality rather than UI appearance
- Test with both the provided sample CSV and your own test cases
- Verify that all changes are properly reflected in the exported CSV
- Pay special attention to data integrity between import and export 
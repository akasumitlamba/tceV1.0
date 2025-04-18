class TestExecutionTracker {
    constructor() {
        this.testCases = [];
        this.csvFilePath = '';
        this.originalFile = null;
        this.currentExecutor = '';
        this.selectedIndex = -1;
        this.initializeTheme();
        this.setupEventListeners();
    }

    initializeTheme() {
        // Get saved theme from localStorage or default to 'light'
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        
        // Update toggle button icon based on current theme
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Import button click
        const importButton = document.getElementById('importBtn');
        if (importButton) {
            importButton.addEventListener('click', () => this.handleFileImport());
        }

        // Export button click
        const exportButton = document.getElementById('exportBtn');
        if (exportButton) {
            exportButton.addEventListener('click', () => this.exportCSV());
        }

        // Executor input change
        const executorInput = document.getElementById('executedByInput');
        if (executorInput) {
            executorInput.addEventListener('input', (e) => {
                this.currentExecutor = e.target.value;
            });
        }

        // Result inputs event listeners
        document.getElementById('actualResult').addEventListener('input', (e) => this.updateField('actualResult', e.target.value));
        document.getElementById('comment').addEventListener('input', (e) => this.updateField('comment', e.target.value));
        document.getElementById('defects').addEventListener('input', (e) => this.updateField('defects', e.target.value));
        document.getElementById('evidence').addEventListener('input', (e) => this.updateField('evidence', e.target.value));

        // Status indicator click events
        document.querySelectorAll('.status-indicators .status-indicator').forEach(indicator => {
            indicator.addEventListener('click', (e) => {
                const newStatus = e.target.dataset.status;
                this.updateField('status', newStatus);
                this.updateStatusIndicator(newStatus);
            });
        });

        // Result item header click events
        document.querySelectorAll('.result-item h6').forEach(header => {
            header.addEventListener('click', (e) => {
                // Close all other result items
                document.querySelectorAll('.result-item').forEach(item => {
                    if (item !== e.target.parentElement) {
                        item.classList.remove('active');
                    }
                });
                // Toggle current item
                e.target.parentElement.classList.toggle('active');
            });
        });

        // Add button event listeners
        document.querySelectorAll('.add-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const parent = e.target.parentElement;
                const textarea = parent.querySelector('textarea') || parent.querySelector('input');
                if (textarea) {
                    textarea.value += '\n• ';
                    textarea.focus();
                    textarea.dispatchEvent(new Event('input'));
                }
            });
        });
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Update theme
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update toggle button icon
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    validateTestCase(testCase) {
        const mandatoryFields = {
            'Summary': testCase['Summary'],
            'Data': testCase['Data'],
            'test steps': testCase['test steps'],
            'exppected result': testCase['exppected result']
        };

        const missingFields = Object.entries(mandatoryFields)
            .filter(([_, value]) => !value || value.trim() === '')
            .map(([field]) => field);

        return {
            isValid: missingFields.length === 0,
            missingFields
        };
    }

    async handleFileImport() {
        const fileInput = document.getElementById('csvFile');
        const executedBy = document.getElementById('executedByInput').value.trim();
        
        if (!executedBy) {
            alert('Please enter the executor name');
            return;
        }

        this.currentExecutor = executedBy;

        if (!fileInput.files[0]) {
            alert('Please select a CSV file');
            return;
        }

        const file = fileInput.files[0];
        this.csvFilePath = file.name;
        this.originalFile = file;
        const reader = new FileReader();

        reader.onload = (event) => {
            Papa.parse(event.target.result, {
                header: true,
                transformHeader: (header) => header.trim(),  // Trim whitespace from headers
                complete: (results) => {
                    // Create case-insensitive column mapping
                    const columnMap = {};
                    results.meta.fields.forEach(field => {
                        columnMap[field.toLowerCase()] = field;
                    });

                    // Helper function to get column value regardless of case
                    const getValue = (row, key) => {
                        // Try exact match first
                        if (row[key] !== undefined) return row[key];
                        
                        // Try case-insensitive match
                        const originalKey = columnMap[key.toLowerCase()];
                        return originalKey ? row[originalKey] : undefined;
                    };

                    // Filter out empty rows (where all values are empty)
                    const validRows = results.data.filter(row => {
                        return Object.values(row).some(value => value && value.trim() !== '');
                    });

                    if (validRows.length === 0) {
                        alert('No valid data found in CSV file');
                        return;
                    }

                    // Validate only the non-empty test cases
                    const invalidCases = validRows
                        .map((testCase, index) => {
                            const validation = {
                                isValid: true,
                                missingFields: []
                            };

                            // Check mandatory fields with case-insensitive keys
                            const mandatoryFields = ['Summary', 'Data', 'test steps', 'exppected result'];
                            validation.missingFields = mandatoryFields.filter(field => 
                                !getValue(testCase, field) || getValue(testCase, field).trim() === ''
                            );
                            validation.isValid = validation.missingFields.length === 0;

                            return {
                                index: index + 1,
                                ...validation
                            };
                        })
                        .filter(caseValidation => !caseValidation.isValid);

                    if (invalidCases.length > 0) {
                        const errorMessage = invalidCases
                            .map(caseValidation => 
                                `Test Case ${caseValidation.index} is missing the following mandatory fields:\n` +
                                caseValidation.missingFields.map(field => `- ${field}`).join('\n')
                            )
                            .join('\n\n');

                        alert('Error: Some test cases are missing mandatory fields:\n\n' + errorMessage);
                        return;
                    }

                    // If all validations pass, process only the valid test cases
                    this.testCases = validRows.map((testCase, index) => ({
                        sNo: getValue(testCase, 'S.No') || (index + 1).toString(),
                        path: getValue(testCase, 'S.No') ? `ARGO-${getValue(testCase, 'S.No')}` : `ARGO-${index + 1}`,
                        title: getValue(testCase, 'Summary') || '',
                        executedBy: getValue(testCase, 'Executed by') || '',
                        reporter: getValue(testCase, 'reporter') || '',
                        status: getValue(testCase, 'Execution status') || 'TODO',
                        steps: getValue(testCase, 'test steps') ? getValue(testCase, 'test steps').split('\n') : [],
                        prerequisites: getValue(testCase, 'Data') || '',
                        expectedResult: getValue(testCase, 'exppected result') || '',
                        actualResult: getValue(testCase, 'actual result') || '',
                        comment: getValue(testCase, 'comment') || '',
                        defects: getValue(testCase, 'Defect') || '',
                        evidence: getValue(testCase, 'evidence') || '',
                        lastModified: getValue(testCase, 'Execution last modified timestamp') || null
                    }));

                    this.showTestExecution();
                },
                error: (error) => {
                    console.error('Error parsing CSV:', error);
                    alert('Error parsing CSV file');
                }
            });
        };

        reader.readAsText(file);
    }

    showTestExecution() {
        // Hide import section and show test execution view
        document.getElementById('importSection').style.display = 'none';
        const testExecutionView = document.getElementById('testExecutionView');
        testExecutionView.style.display = 'block';
        
        // Update CSV path
        const csvPathElement = testExecutionView.querySelector('.csv-path');
        if (csvPathElement) {
            csvPathElement.textContent = `CSV File: ${this.csvFilePath}`;
        }

        // Clear existing test cases
        const testCasesList = document.getElementById('testCasesList');
        testCasesList.innerHTML = '';

        // Create and append test case elements
        this.testCases.forEach((testCase, index) => {
            const testCaseElement = this.createTestCaseElement(testCase, index);
            if (testCaseElement) {
                testCasesList.appendChild(testCaseElement);
            }
        });
    }

    createTestCaseElement(testCase, index) {
        const template = document.getElementById('testCaseTemplate').content.cloneNode(true);
        const testCaseElement = template.querySelector('.test-case');
        
        // Set data attributes
        testCaseElement.setAttribute('data-index', index);
        testCaseElement.setAttribute('data-status', testCase.status || 'TODO');

        // Update test case content
        testCaseElement.querySelector('.test-title').textContent = `${testCase.path}: ${testCase.title}`;
        testCaseElement.querySelector('.s-no').textContent = testCase.sNo;
        testCaseElement.querySelector('.executed-by').textContent = testCase.executedBy;
        testCaseElement.querySelector('.reporter').textContent = testCase.reporter || 'N/A';
        testCaseElement.querySelector('.prerequisites').textContent = testCase.prerequisites || 'N/A';
        testCaseElement.querySelector('.test-steps').innerHTML = testCase.steps.join('<br>');
        testCaseElement.querySelector('.expected-result').textContent = testCase.expectedResult || 'N/A';

        // Set active status circle and status text
        const currentStatus = testCase.status || 'TODO';
        const statusCircle = testCaseElement.querySelector(`.status-circle[data-status="${currentStatus}"]`);
        const statusText = testCaseElement.querySelector('.status-text');
        
        if (statusCircle) {
            statusCircle.classList.add('active');
        }
        if (statusText) {
            statusText.textContent = currentStatus;
        }

        // Set comment if exists
        const commentTextarea = testCaseElement.querySelector('.comment');
        if (commentTextarea && testCase.comment) {
            commentTextarea.value = testCase.comment;
        }

        // Setup event listeners
        this.setupTestCaseEventListeners(testCaseElement);

        return testCaseElement;
    }

    setupTestCaseEventListeners(testCaseElement) {
        // Status circle click events
        const statusCircles = testCaseElement.querySelectorAll('.status-circle');
        const statusText = testCaseElement.querySelector('.status-text');
        
        statusCircles.forEach(circle => {
            circle.addEventListener('click', () => {
                const newStatus = circle.getAttribute('data-status');
                const index = parseInt(testCaseElement.dataset.index);
                
                if (!isNaN(index) && this.testCases[index]) {
                    const testCase = this.testCases[index];
                    const oldStatus = testCase.status;

                    // Only update timestamp and executor if status actually changes
                    if (oldStatus !== newStatus) {
                        testCase.status = newStatus;
                        testCase.lastModified = new Date().toLocaleString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                        });
                        testCase.executedBy = this.currentExecutor;
                        
                        // Update executed by display in the UI
                        const executedBySpan = testCaseElement.querySelector('.executed-by');
                        if (executedBySpan) {
                            executedBySpan.textContent = this.currentExecutor;
                        }
                    }
                }
                
                // Remove active class from all circles
                statusCircles.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked circle
                circle.classList.add('active');
                
                // Update test case status and background
                testCaseElement.setAttribute('data-status', newStatus);
                
                // Update status text
                if (statusText) {
                    statusText.textContent = newStatus;
                }
            });
        });

        // Comment button click event
        const commentButton = testCaseElement.querySelector('.comment-button');
        const commentSection = testCaseElement.querySelector('.comment-section');
        if (commentButton && commentSection) {
            commentButton.addEventListener('click', () => {
                commentButton.classList.toggle('active');
                commentSection.classList.toggle('expanded');
            });
        }

        // Comment textarea change event
        const commentTextarea = testCaseElement.querySelector('.comment');
        if (commentTextarea) {
            commentTextarea.addEventListener('input', (e) => {
                const index = parseInt(testCaseElement.dataset.index);
                if (!isNaN(index) && this.testCases[index]) {
                    this.testCases[index].comment = e.target.value;
                }
            });
        }
    }

    updateStatusIndicator(testCaseElement, status) {
        const indicators = testCaseElement.querySelectorAll('.status-indicator');
        indicators.forEach(indicator => {
            indicator.classList.remove('active');
            if (indicator.dataset.status === status) {
                indicator.classList.add('active');
            }
        });
    }

    updateField(field, value) {
        this.testCases[this.selectedIndex][field] = value;
    }

    exportCSV() {
        // Create updated CSV data
        const csvData = this.testCases.map(testCase => ({
            'S.No': testCase.sNo,
            'Summary': testCase.title,
            'Data': testCase.prerequisites,
            'test steps': testCase.steps.join('\n'),
            'exppected result': testCase.expectedResult,
            'Execution status': testCase.status,
            'Execution last modified timestamp': testCase.lastModified || '',
            'Executed by': testCase.executedBy || '',
            'reporter': testCase.reporter,
            'comment': testCase.comment
        }));

        // Convert to CSV string and save
        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = this.csvFilePath;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    parseCSV(file) {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                complete: (results) => {
                    if (results.errors.length > 0) {
                        reject(results.errors);
                        return;
                    }

                    const testCases = results.data.slice(1).map((row, index) => {
                        return {
                            sNo: row[0] || (index + 1).toString(),
                            title: row[1] || '',
                            prerequisites: row[2] || '',
                            testSteps: row[3] || '',
                            expectedResult: row[4] || '',
                            reporter: row[5] || '',
                            status: row[6] ? row[6].toUpperCase() : 'TODO',  // Set default status to TODO
                            comment: row[7] || ''
                        };
                    });

                    resolve(testCases);
                },
                error: (error) => {
                    reject(error);
                }
            });
        });
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestExecutionTracker();
}); 
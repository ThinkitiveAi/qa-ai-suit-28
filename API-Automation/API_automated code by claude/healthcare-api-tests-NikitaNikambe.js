const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL
const TEST_TIMEOUT = 30000;

// Test data generators
const generateRandomString = (length = 8) => {
  return Math.random().toString(36).substring(2, length + 2);
};

const generateRandomEmail = () => {
  return `test_${generateRandomString()}@example.com`;
};

const generateRandomPhone = () => {
  return `555${Math.floor(Math.random() * 10000000).toString().padStart(7, '0')}`;
};

// Test report data
const testResults = {
  testSuite: 'Healthcare API Test Suite',
  executionDate: new Date().toISOString(),
  environment: BASE_URL,
  tests: []
};

// Helper function to log test results
const logTestResult = (testName, status, details) => {
  testResults.tests.push({
    name: testName,
    status: status,
    timestamp: new Date().toISOString(),
    details: details
  });
};

test.describe('Healthcare API Test Suite', () => {
  let accessToken;
  let providerUUID;
  let patientUUID;
  let apiContext;

  test.beforeAll(async ({ playwright }) => {
    // Create a dedicated API context
    apiContext = await playwright.request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
  });

  test.afterAll(async () => {
    // Generate test report
    const reportPath = path.join(__dirname, 'test-execution-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`Test report generated at: ${reportPath}`);
    
    // Dispose the API context
    await apiContext.dispose();
  });

  test('1. Provider Login', async () => {
    const testDetails = {
      endpoint: '/auth/provider/login',
      requestData: {},
      responseData: {},
      validations: []
    };

    try {
      // Test data for login
      const loginData = {
        email: 'provider@example.com', // Replace with actual test credentials
        password: 'Test@123'
      };

      testDetails.requestData = loginData;

      // Make API request
      const response = await apiContext.post('/auth/provider/login', {
        data: loginData
      });

      const responseBody = await response.json();
      testDetails.responseData = responseBody;

      // Validations
      expect(response.status()).toBe(200);
      testDetails.validations.push({ check: 'Status Code', expected: 200, actual: response.status(), passed: true });

      expect(responseBody).toHaveProperty('access_token');
      testDetails.validations.push({ check: 'Access Token Present', passed: !!responseBody.access_token });

      // Store access token for subsequent requests
      accessToken = responseBody.access_token;
      
      // Update API context with authorization header
      apiContext = await apiContext.newContext({
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });

      logTestResult('Provider Login', 'PASSED', testDetails);
    } catch (error) {
      testDetails.error = error.message;
      logTestResult('Provider Login', 'FAILED', testDetails);
      throw error;
    }
  });

  test('2. Add Provider', async () => {
    const testDetails = {
      endpoint: '/providers',
      requestData: {},
      responseData: {},
      validations: []
    };

    try {
      // Random test data for provider
      const providerData = {
        firstName: `Test_${generateRandomString(5)}`,
        lastName: `Provider_${generateRandomString(5)}`,
        email: generateRandomEmail(),
        phone: generateRandomPhone(),
        specialization: 'General Practice',
        licenseNumber: `LIC${generateRandomString(8).toUpperCase()}`,
        experience: Math.floor(Math.random() * 20) + 1
      };

      testDetails.requestData = providerData;

      // Make API request
      const response = await apiContext.post('/providers', {
        data: providerData
      });

      const responseBody = await response.json();
      testDetails.responseData = responseBody;

      // Validations
      expect(response.status()).toBe(201);
      testDetails.validations.push({ check: 'Status Code', expected: 201, actual: response.status(), passed: true });

      expect(responseBody.message).toBe('Provider created successfully.');
      testDetails.validations.push({ 
        check: 'Success Message', 
        expected: 'Provider created successfully.', 
        actual: responseBody.message, 
        passed: responseBody.message === 'Provider created successfully.' 
      });

      logTestResult('Add Provider', 'PASSED', testDetails);
    } catch (error) {
      testDetails.error = error.message;
      logTestResult('Add Provider', 'FAILED', testDetails);
      throw error;
    }
  });

  test('3. Get Provider Details', async () => {
    const testDetails = {
      endpoint: '/providers',
      requestData: {},
      responseData: {},
      validations: []
    };

    try {
      // Make API request to get all providers
      const response = await apiContext.get('/providers');
      const responseBody = await response.json();
      testDetails.responseData = responseBody;

      // Validations
      expect(response.status()).toBe(200);
      testDetails.validations.push({ check: 'Status Code', expected: 200, actual: response.status(), passed: true });

      expect(Array.isArray(responseBody.providers)).toBeTruthy();
      testDetails.validations.push({ check: 'Providers Array Present', passed: Array.isArray(responseBody.providers) });

      expect(responseBody.providers.length).toBeGreaterThan(0);
      testDetails.validations.push({ 
        check: 'Providers List Not Empty', 
        passed: responseBody.providers.length > 0 
      });

      // Extract UUID of the most recently created provider
      if (responseBody.providers && responseBody.providers.length > 0) {
        // Assuming the most recent provider is at the beginning or end of the array
        providerUUID = responseBody.providers[0].uuid || responseBody.providers[0].id;
        testDetails.extractedData = { providerUUID };
      }

      logTestResult('Get Provider Details', 'PASSED', testDetails);
    } catch (error) {
      testDetails.error = error.message;
      logTestResult('Get Provider Details', 'FAILED', testDetails);
      throw error;
    }
  });

  test('4. Set Provider Availability', async () => {
    const testDetails = {
      endpoint: `/providers/${providerUUID}/availability`,
      requestData: {},
      responseData: {},
      validations: []
    };

    try {
      // Generate availability data for next 7 days
      const availabilityData = {
        availability: []
      };

      const today = new Date();
      for (let i = 1; i <= 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        availabilityData.availability.push({
          date: date.toISOString().split('T')[0],
          slots: [
            { startTime: '09:00', endTime: '09:30', isAvailable: true },
            { startTime: '09:30', endTime: '10:00', isAvailable: true },
            { startTime: '10:00', endTime: '10:30', isAvailable: true },
            { startTime: '10:30', endTime: '11:00', isAvailable: true },
            { startTime: '14:00', endTime: '14:30', isAvailable: true },
            { startTime: '14:30', endTime: '15:00', isAvailable: true }
          ]
        });
      }

      testDetails.requestData = availabilityData;

      // Make API request
      const response = await apiContext.post(`/providers/${providerUUID}/availability`, {
        data: availabilityData
      });

      const responseBody = await response.json();
      testDetails.responseData = responseBody;

      // Validations
      expect(response.status()).toBe(200);
      testDetails.validations.push({ check: 'Status Code', expected: 200, actual: response.status(), passed: true });

      expect(responseBody.message).toContain('Availability added successfully');
      testDetails.validations.push({ 
        check: 'Success Message Contains Expected Text', 
        expected: 'Availability added successfully', 
        actual: responseBody.message, 
        passed: responseBody.message.includes('Availability added successfully') 
      });

      logTestResult('Set Provider Availability', 'PASSED', testDetails);
    } catch (error) {
      testDetails.error = error.message;
      logTestResult('Set Provider Availability', 'FAILED', testDetails);
      throw error;
    }
  });

  test('5. Create Patient', async () => {
    const testDetails = {
      endpoint: '/patients',
      requestData: {},
      responseData: {},
      validations: []
    };

    try {
      // Random test data for patient
      const patientData = {
        firstName: `Patient_${generateRandomString(5)}`,
        lastName: `Test_${generateRandomString(5)}`,
        email: generateRandomEmail(),
        phone: generateRandomPhone(),
        dateOfBirth: '1990-01-01',
        gender: ['Male', 'Female', 'Other'][Math.floor(Math.random() * 3)],
        address: {
          street: `${Math.floor(Math.random() * 9999)} Test Street`,
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        },
        emergencyContact: {
          name: `Emergency_${generateRandomString(5)}`,
          relationship: 'Spouse',
          phone: generateRandomPhone()
        }
      };

      testDetails.requestData = patientData;

      // Make API request
      const response = await apiContext.post('/patients', {
        data: patientData
      });

      const responseBody = await response.json();
      testDetails.responseData = responseBody;

      // Validations
      expect(response.status()).toBe(201);
      testDetails.validations.push({ check: 'Status Code', expected: 201, actual: response.status(), passed: true });

      expect(responseBody.message).toBe('Patient Details Added Successfully.');
      testDetails.validations.push({ 
        check: 'Success Message', 
        expected: 'Patient Details Added Successfully.', 
        actual: responseBody.message, 
        passed: responseBody.message === 'Patient Details Added Successfully.' 
      });

      logTestResult('Create Patient', 'PASSED', testDetails);
    } catch (error) {
      testDetails.error = error.message;
      logTestResult('Create Patient', 'FAILED', testDetails);
      throw error;
    }
  });

  test('6. Get Patient Details', async () => {
    const testDetails = {
      endpoint: '/patients',
      requestData: {},
      responseData: {},
      validations: []
    };

    try {
      // Make API request to get all patients
      const response = await apiContext.get('/patients');
      const responseBody = await response.json();
      testDetails.responseData = responseBody;

      // Validations
      expect(response.status()).toBe(200);
      testDetails.validations.push({ check: 'Status Code', expected: 200, actual: response.status(), passed: true });

      expect(Array.isArray(responseBody.patients)).toBeTruthy();
      testDetails.validations.push({ check: 'Patients Array Present', passed: Array.isArray(responseBody.patients) });

      expect(responseBody.patients.length).toBeGreaterThan(0);
      testDetails.validations.push({ 
        check: 'Patients List Not Empty', 
        passed: responseBody.patients.length > 0 
      });

      // Extract UUID of the most recently created patient
      if (responseBody.patients && responseBody.patients.length > 0) {
        patientUUID = responseBody.patients[0].uuid || responseBody.patients[0].id;
        testDetails.extractedData = { patientUUID };
      }

      logTestResult('Get Patient Details', 'PASSED', testDetails);
    } catch (error) {
      testDetails.error = error.message;
      logTestResult('Get Patient Details', 'FAILED', testDetails);
      throw error;
    }
  });

  test('7. Book Appointment', async () => {
    const testDetails = {
      endpoint: '/appointments',
      requestData: {},
      responseData: {},
      validations: []
    };

    try {
      // Get tomorrow's date for appointment
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointmentData = {
        patientId: patientUUID,
        providerId: providerUUID,
        appointmentDate: tomorrow.toISOString().split('T')[0],
        timeSlot: '10:00',
        duration: 30,
        appointmentType: 'Consultation',
        reason: 'General health checkup',
        notes: 'First time consultation'
      };

      testDetails.requestData = appointmentData;

      // Make API request
      const response = await apiContext.post('/appointments', {
        data: appointmentData
      });

      const responseBody = await response.json();
      testDetails.responseData = responseBody;

      // Validations
      expect(response.status()).toBe(200);
      testDetails.validations.push({ check: 'Status Code', expected: 200, actual: response.status(), passed: true });

      expect(responseBody.message).toBe('Appointment booked successfully.');
      testDetails.validations.push({ 
        check: 'Success Message', 
        expected: 'Appointment booked successfully.', 
        actual: responseBody.message, 
        passed: responseBody.message === 'Appointment booked successfully.' 
      });

      logTestResult('Book Appointment', 'PASSED', testDetails);
    } catch (error) {
      testDetails.error = error.message;
      logTestResult('Book Appointment', 'FAILED', testDetails);
      throw error;
    }
  });
});

// HTML Report Generator
test.afterAll(async () => {
  const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Healthcare API Test Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background-color: #f5f5f5;
        }
        .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .summary {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-case {
            background-color: white;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .passed {
            color: #27ae60;
            font-weight: bold;
        }
        .failed {
            color: #e74c3c;
            font-weight: bold;
        }
        .details {
            margin-top: 10px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 3px;
            font-size: 14px;
        }
        pre {
            background-color: #f4f4f4;
            padding: 10px;
            border-radius: 3px;
            overflow-x: auto;
        }
        .stats {
            display: flex;
            gap: 20px;
            margin-top: 10px;
        }
        .stat-box {
            padding: 10px 20px;
            border-radius: 5px;
            color: white;
        }
        .stat-passed {
            background-color: #27ae60;
        }
        .stat-failed {
            background-color: #e74c3c;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${testResults.testSuite}</h1>
        <p>Execution Date: ${new Date(testResults.executionDate).toLocaleString()}</p>
        <p>Environment: ${testResults.environment}</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <div class="stats">
            <div class="stat-box stat-passed">
                Passed: ${testResults.tests.filter(t => t.status === 'PASSED').length}
            </div>
            <div class="stat-box stat-failed">
                Failed: ${testResults.tests.filter(t => t.status === 'FAILED').length}
            </div>
        </div>
    </div>
    
    ${testResults.tests.map(test => `
        <div class="test-case">
            <h3>${test.name}</h3>
            <p>Status: <span class="${test.status === 'PASSED' ? 'passed' : 'failed'}">${test.status}</span></p>
            <p>Timestamp: ${new Date(test.timestamp).toLocaleString()}</p>
            
            <div class="details">
                <h4>Endpoint:</h4>
                <p>${test.details.endpoint || 'N/A'}</p>
                
                ${test.details.requestData ? `
                    <h4>Request Data:</h4>
                    <pre>${JSON.stringify(test.details.requestData, null, 2)}</pre>
                ` : ''}
                
                ${test.details.validations && test.details.validations.length > 0 ? `
                    <h4>Validations:</h4>
                    <ul>
                        ${test.details.validations.map(v => `
                            <li>${v.check}: ${v.passed ? '✓ Passed' : '✗ Failed'}</li>
                        `).join('')}
                    </ul>
                ` : ''}
                
                ${test.details.error ? `
                    <h4>Error:</h4>
                    <p style="color: red;">${test.details.error}</p>
                ` : ''}
            </div>
        </div>
    `).join('')}
</body>
</html>
  `;

  const htmlReportPath = path.join(__dirname, 'test-execution-report.html');
  fs.writeFileSync(htmlReportPath, htmlReport);
  console.log(`HTML report generated at: ${htmlReportPath}`);
});
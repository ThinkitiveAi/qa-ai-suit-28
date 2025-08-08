const axios = require('axios');

// Configuration
const BASE_URL = 'https://stage-api.ecarehealth.com/api/master';
const TENANT_ID = 'stage_aithinkitive';

// Headers for all requests
const getHeaders = (token = null) => {
    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json',
        'Origin': 'https://stage_aithinkitive.uat.provider.ecarehealth.com',
        'Referer': 'https://stage_aithinkitive.uat.provider.ecarehealth.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'X-TENANT-ID': TENANT_ID,
        'sec-ch-ua': '"Google Chrome";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"'
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

// Helper function to make API calls
const makeRequest = async (method, url, data = null, token = null) => {
    try {
        const config = {
            method,
            url,
            headers: getHeaders(token),
            data
        };

        console.log(`\n🚀 Making ${method} request to: ${url}`);
        const startTime = Date.now();
        
        const response = await axios(config);
        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ Success: ${response.status} ${response.statusText}`);
        console.log(`⏱️  Duration: ${duration}ms`);
        console.log(`📊 Response size: ${JSON.stringify(response.data).length} bytes`);

        return response.data;
    } catch (error) {
        console.log(`❌ Error: ${error.response?.status || 'Network Error'} ${error.response?.statusText || ''}`);
        console.log(`⏱️  Duration: ${Date.now() - startTime}ms`);
        if (error.response?.data) {
            console.log(`📄 Error details: ${JSON.stringify(error.response.data)}`);
        }
        throw error;
    }
};

// API Functions
const loginAPI = async () => {
    const loginData = {
        username: "rose.gomez@jourrapide.com",
        password: "Pass@123"
    };

    console.log('\n🔐 1. Login API');
    const response = await makeRequest('POST', `${BASE_URL}/login`, loginData);
    
    // Extract token from response
    const token = response.access_token || response.token;
    console.log(`🎫 Token extracted: ${token ? 'Yes' : 'No'}`);
    
    return token;
};

const setAvailability = async (token) => {
    const availabilityData = {
        settings: [
            {
                type: "NEW",
                slotTime: 15,
                minNoticeUnit: "string"
            },
            {
                type: "CARE_COORDINATION",
                slotTime: 30,
                minNoticeUnit: "string"
            }
        ],
        providerId: "dc769997-f9ce-4153-a6f9-bd491ac35228",
        bookingWindow: "4",
        timezone: "IST",
        initialConsultTime: 15,
        followupConsultTime: 0,
        administrativeConsultTime: 0,
        careCoordinationConsultTime: 30,
        medicationBriefConsultTime: 0,
        nursingOnlyConsultTime: 0,
        telephoneCallConsultTime: 0,
        urgentVisitConsultTime: 0,
        videoVisitConsultTime: 0,
        wellnessExamConsultTime: 0,
        bufferTime: 0,
        bookBefore: "undefined undefined",
        blockDays: [],
        daySlots: [
            {
                day: "MONDAY",
                startTime: "00:00:00",
                endTime: "23:45:00",
                location: null,
                availabilityMode: "VIRTUAL"
            },
            {
                day: "SUNDAY",
                startTime: "00:00:00",
                endTime: "23:45:00",
                location: null,
                availabilityMode: "VIRTUAL"
            },
            {
                day: "SATURDAY",
                startTime: "00:00:00",
                endTime: "23:45:00",
                location: null,
                availabilityMode: "VIRTUAL"
            },
            {
                day: "TUESDAY",
                startTime: "10:00:00",
                endTime: "22:00:00",
                location: null,
                availabilityMode: "VIRTUAL"
            },
            {
                day: "FRIDAY",
                startTime: "10:00:00",
                endTime: "22:00:00",
                location: null,
                availabilityMode: "VIRTUAL"
            },
            {
                day: "WEDNESDAY",
                startTime: "00:00:00",
                endTime: "00:30:00",
                location: null,
                availabilityMode: "VIRTUAL"
            },
            {
                day: "THURSDAY",
                startTime: "00:15:00",
                endTime: "01:15:00",
                location: null,
                availabilityMode: "VIRTUAL"
            }
        ],
        startTime: null,
        endTime: null,
        setToWeekdays: false,
        minNoticeTime: "undefined",
        minNoticeUnit: "undefined",
        xTENANTID: TENANT_ID
    };

    console.log('\n📅 2. Set Availability');
    return await makeRequest('POST', `${BASE_URL}/provider/availability-setting`, availabilityData, token);
};

const getAvailability = async (token) => {
    console.log('\n📋 3. Get Availability');
    const providerId = "dc769997-f9ce-4153-a6f9-bd491ac35228";
    return await makeRequest('GET', `${BASE_URL}/provider/${providerId}/availability-setting`, null, token);
};

const getProviderAvailability = async (token) => {
    console.log('\n📊 4. Get Provider Availability');
    const params = new URLSearchParams({
        page: '0',
        size: '25',
        providerUuid: 'dc769997-f9ce-4153-a6f9-bd491ac35228',
        startDate: '2025-07-31T18:30:00.000Z',
        endDate: '2025-08-30T18:30:00.000Z'
    });
    
    return await makeRequest('GET', `${BASE_URL}/appointment?${params}`, null, token);
};

const createAppointment = async (token) => {
    const appointmentData = {
        mode: "VIRTUAL",
        patientId: "ac59331f-b6ff-4787-8eeb-a52ff0257861",
        customForms: null,
        visit_type: "",
        type: "NEW",
        paymentType: "CASH",
        providerId: "dc769997-f9ce-4153-a6f9-bd491ac35228",
        startTime: "2025-08-10T18:30:00Z",
        endTime: "2025-08-10T18:45:00Z",
        insurance_type: "",
        note: "",
        authorization: "",
        forms: [],
        chiefComplaint: "Test",
        isRecurring: false,
        recurringFrequency: "daily",
        reminder_set: false,
        endType: "never",
        endDate: "2025-08-07T08:38:14.505Z",
        endAfter: 5,
        customFrequency: 1,
        customFrequencyUnit: "days",
        selectedWeekdays: [],
        reminder_before_number: 1,
        timezone: "IST",
        duration: 15,
        xTENANTID: TENANT_ID
    };

    console.log('\n📝 5. Create Appointment');
    return await makeRequest('POST', `${BASE_URL}/appointment`, appointmentData, token);
};

const getProviderAppointment = async (token) => {
    console.log('\n📋 6. Get Provider Appointment');
    const params = new URLSearchParams({
        page: '0',
        size: '25',
        providerUuid: 'dc769997-f9ce-4153-a6f9-bd491ac35228',
        startDate: '2025-07-31T18:30:00.000Z',
        endDate: '2025-08-30T18:30:00.000Z'
    });
    
    return await makeRequest('GET', `${BASE_URL}/appointment?${params}`, null, token);
};

const confirmAppointment = async (token) => {
    const statusData = {
        appointmentId: "e565284c-e0b8-4efc-81f2-01ddd6921ee0",
        status: "CONFIRMED",
        xTENANTID: TENANT_ID
    };

    console.log('\n✅ 7. Confirm Appointment/status change');
    return await makeRequest('PUT', `${BASE_URL}/appointment/update-status`, statusData, token);
};

const checkIn = async (token) => {
    const checkInData = {
        appointmentId: "e565284c-e0b8-4efc-81f2-01ddd6921ee0",
        status: "CHECKED_IN",
        xTENANTID: TENANT_ID
    };

    console.log('\n🏥 8. Check In');
    return await makeRequest('PUT', `${BASE_URL}/appointment/update-status`, checkInData, token);
};

const getZoomToken = async (token) => {
    console.log('\n🎥 9. Get Zoom Token/Start telehealth');
    const tokenId = "2da5497d-6b7d-4fea-a9a4-8a1c374941f2";
    return await makeRequest('GET', `${BASE_URL}/token/${tokenId}`, null, token);
};

const saveEncounterSummary = async (token) => {
    const encounterData = {
        encounterStatus: "INTAKE",
        formType: "SIMPLE_SOAP_NOTE",
        problems: "",
        habits: "",
        patientVitals: [
            { selected: false, name: "bloodPressure", label: "Blood Pressure", unit: "mmHg" },
            { selected: false, name: "bloodGlucose", label: "Blood Glucose", unit: "mg/dL" },
            { selected: false, name: "bodyTemperature", label: "Body Temperature", unit: "f" },
            { selected: false, name: "heartRate", label: "Heart Rate", unit: "BPM" },
            { selected: false, name: "respirationRate", label: "Respiration Rate", unit: "BPM" },
            { selected: false, name: "height", label: "Height", unit: "m" },
            { selected: false, name: "weight", label: "Weight", unit: "lbs" },
            { selected: false, name: "o2_saturation", label: "Oxygen Saturation (SpO2)", unit: "%" },
            { selected: false, name: "pulseRate", label: "Pulse Rate", unit: "BPM" },
            { selected: false, name: "bmi", label: "Body Mass Index", unit: "kg/m^2" },
            { selected: false, name: "respiratoryVolume", label: "Respiratory Volume", unit: "ml" },
            { selected: false, name: "perfusionIndex", label: "Perfusion Index", unit: "%" },
            { selected: false, name: "peakExpiratoryFlow", label: "Peak Expiratory Flow", unit: "l/min" },
            { selected: false, name: "forceExpiratoryVolume", label: "Forced Expiratory Volume", unit: "l" }
        ],
        instruction: "",
        chiefComplaint: "Test",
        note: "dewf",
        tx: "fewf",
        appointmentId: "e565284c-e0b8-4efc-81f2-01ddd6921ee0",
        patientId: "ac59331f-b6ff-4787-8eeb-a52ff0257861"
    };

    console.log('\n📋 10. Save Encounter Summary');
    return await makeRequest('POST', `${BASE_URL}/encounter-summary`, encounterData, token);
};

const updateEncounterSummary = async (token) => {
    const updateData = {
        uuid: "a88bc8f4-ddc7-4f29-b0a1-cd86ceb4b612",
        appointmentId: "e565284c-e0b8-4efc-81f2-01ddd6921ee0",
        followUp: null,
        instruction: "",
        hpi: null,
        chiefComplaint: "Test",
        problems: "",
        habits: "",
        carePlan: null,
        archive: false,
        encounterStatus: "EXAM",
        formType: "SIMPLE_SOAP_NOTE",
        patientAllergies: null,
        carePlans: null,
        familyHistories: null,
        medicalHistories: null,
        surgicalHistory: null,
        patientVitals: [
            { selected: false, name: "bloodPressure", label: "Blood Pressure", unit: "mmHg" },
            { selected: false, name: "bloodGlucose", label: "Blood Glucose", unit: "mg/dL" },
            { selected: false, name: "bodyTemperature", label: "Body Temperature", unit: "f" },
            { selected: false, name: "heartRate", label: "Heart Rate", unit: "BPM" },
            { selected: false, name: "respirationRate", label: "Respiration Rate", unit: "BPM" },
            { selected: false, name: "height", label: "Height", unit: "m" },
            { selected: false, name: "weight", label: "Weight", unit: "lbs" },
            { selected: false, name: "o2_saturation", label: "Oxygen Saturation (SpO2)", unit: "%" },
            { selected: false, name: "pulseRate", label: "Pulse Rate", unit: "BPM" },
            { selected: false, name: "bmi", label: "Body Mass Index", unit: "kg/m^2" },
            { selected: false, name: "respiratoryVolume", label: "Respiratory Volume", unit: "ml" },
            { selected: false, name: "perfusionIndex", label: "Perfusion Index", unit: "%" },
            { selected: false, name: "peakExpiratoryFlow", label: "Peak Expiratory Flow", unit: "l/min" },
            { selected: false, name: "forceExpiratoryVolume", label: "Forced Expiratory Volume", unit: "l" }
        ],
        patientMedications: null,
        patientQuestionAnswers: {},
        rosTemplates: null,
        physicalTemplates: null,
        patientVaccines: null,
        patientOrders: null,
        patientId: "ac59331f-b6ff-4787-8eeb-a52ff0257861",
        providerId: null,
        providerSignature: null,
        providerNote: null,
        tx: "fewf",
        subjectiveFreeNote: null,
        objectiveFreeNote: null,
        note: "dewf",
        patientPrescriptionForms: null
    };

    console.log('\n✏️  11. Update Encounter Summary');
    return await makeRequest('PUT', `${BASE_URL}/encounter-summary`, updateData, token);
};

const encounterSignOff = async (token) => {
    const signOffData = {
        provider: "dc769997-f9ce-4153-a6f9-bd491ac35228",
        providerNote: "fefe",
        providerSignature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAYYAAAFKCAYAAAAZqvgqAAAAAXNSR0IArs4c6QAAH6RJREFUeF7t3Qn8f9Wcx/E3SYrQFMZEjZGyZCI7ja0kkhY0hAppMSnaGMtUSBRZisqUZeySIg3ZTSqiULYkZJuZqCmJIprz9j9X337+v/7n+zvf7/d+7/m8zuPRo+1u53nu//f+3XvPchNREEAAAQQQGBG4CRoIIIAAAgiMChAM3A8IIIAAAjcQIBi4IRBAAAEECAbuAQQQQACBxQV4YuDuQAABBBDgiYF7AAEEEECAJwbuAQQQQACBQgFeJRVCsRkCCCAQRYBgiNLS1BMBBBAoFCAYCqHYDAEEEIgiQDBEaWnqiQACCBQKEAyFUGyGAAIIRBEgGKK0NPVEAAEECgUIhkIoNkMAAQSiCBAMUVqaeiKAAAKFAgRDIRSbIYAAAlEECIYoLU09EUAAgUIBgqEQis0QQACBKAIEQ5SWpp4IIIBAoQDBUAjFZggggEAUAYIhSktTTwQQQKBQgGAohGIzBBBAIIoAwRClpaknAgggUChAMBRCsRkCCCAQRYBgiNLS1BMBBBAoFCAYCqHYDAEEEIgiQDBEaWnqiQACCBQKEAyFUGyGAAIIRBEgGKK0NPVEAAEECgUIhkIoNkMAAQSiCBAMUVqaeiKAAAKFAgRDIRSbIYAAAlEECIYoLU09EUAAgUIBgqEQis0QQACBKAIEQ5SWpp4IIIBAoQDBUAjFZggggEAUAYIhSktTTwQQQKBQgGAohGIzBBBAIIoAwRClpaknAgggUChAMBRCsRkCCCAQRYBgiNLS1BMBBBAoFCAYCqHYDAEEEIgiQDBEaWnqiQACCBQKEAyFUGyGAAIIRBEgGKK0NPVEAAEECgUIhkIoNkMAAQSiCBAMUVqaeiKAAAKFAgRDIRSbIYAAAlEECIYoLU09EUAAgUIBgqEQis0QQACBKAIEQ5SWpp4IIIBAoQDBUAjFZggggEAUAYIhSktTTwQQQKBQgGAohGIzBBBAIIoAwRClpaknAgggUChAMBRCsRkCCCAQRYBgiNLS1BMBBBAoFCAYCqHYDAEEEIgiQDBEaWnqiQACCBQKEAyFUGyGAAIIRBEgGKK0NPVEAAEECgUIhkIoNkMAAQSiCBAMUVqaeiKAAAKFAgRDIRSbIYAAAlEECIYoLU09EUAAgUIBgqEQis0QQACBKAIEQ5SWpp4IIIBAoQDBUAjFZggggEAUAYIhSktTTwQQQKBQgGAohGIzBBBAIIoAwRClpaknAgggUChAMBRCsRkCCCAQRYBgiNLS1BMBBBAoFCAYCqHYDAEEEIgiQDBEaWnqiQACCBQKEAyFUGyGAAIIRBEgGKK0NPVEAAEECgUIhkIoNkMAAQSiCBAMUVqaeiKAAAKFAgRDIRSbIYAAAlEECIYoLU09EUAAgUIBgqEQis0QQACBKAIEQ5SWpp4IIIBAoQDBUAjFZggggEAUAYIhSktTTwQQQKBQgGAohGIzBBBAIIoAwRClpaknAgggUChAMBRCsRkCCCAQRYBgiNLS1BMBBBAoFC
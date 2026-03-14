// API Configuration
const API_CONFIG = {
    baseURL: 'https://health-tracker-simple-api.vercel.app',
    endpoints: {
        healthData: '/api/health-data',
        meals: '/api/meals',
        mealById: (id) => `/api/meals/${id}`,
        symptoms: '/api/symptoms',
        symptomById: (id) => `/api/symptoms/${id}`,
        health: '/api/health'
    }
};

// Helper function to make API calls
async function apiCall(endpoint, options = {}) {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        ...options
    };

    try {
        const response = await fetch(url, defaultOptions);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// API wrapper functions
const API = {
    // Meals
    getMeals: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`${API_CONFIG.endpoints.meals}${queryString ? '?' + queryString : ''}`);
    },
    
    getMealById: (id) => apiCall(API_CONFIG.endpoints.mealById(id)),
    
    createMeal: (mealData) => apiCall(API_CONFIG.endpoints.meals, {
        method: 'POST',
        body: JSON.stringify(mealData)
    }),
    
    updateMeal: (id, mealData) => apiCall(API_CONFIG.endpoints.mealById(id), {
        method: 'PUT',
        body: JSON.stringify(mealData)
    }),
    
    deleteMeal: (id) => apiCall(API_CONFIG.endpoints.mealById(id), {
        method: 'DELETE'
    }),
    
    // Symptoms
    getSymptoms: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`${API_CONFIG.endpoints.symptoms}${queryString ? '?' + queryString : ''}`);
    },
    
    getSymptomById: (id) => apiCall(API_CONFIG.endpoints.symptomById(id)),
    
    createSymptom: (symptomData) => apiCall(API_CONFIG.endpoints.symptoms, {
        method: 'POST',
        body: JSON.stringify(symptomData)
    }),
    
    updateSymptom: (id, symptomData) => apiCall(API_CONFIG.endpoints.symptomById(id), {
        method: 'PUT',
        body: JSON.stringify(symptomData)
    }),
    
    deleteSymptom: (id) => apiCall(API_CONFIG.endpoints.symptomById(id), {
        method: 'DELETE'
    }),
    
    // Health summary
    getHealthSummary: (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        return apiCall(`${API_CONFIG.endpoints.health}${queryString ? '?' + queryString : ''}`);
    }
};

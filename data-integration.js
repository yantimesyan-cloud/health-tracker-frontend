// Data Integration - connects mockup UI to real API
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Health Tracker Frontend loaded');
    
    // Initialize app
    await initializeApp();
});

async function initializeApp() {
    try {
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Test API connection
        console.log('Testing API connection...');
        const healthData = await loadHealthData(today);
        console.log('✅ API connected:', healthData);
        
        // Update UI with real data
        if (healthData) {
            updateHealthUI(healthData);
        }
        
        // Update date display
        updateDateDisplay();
        
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        showErrorNotification('无法连接到服务器，请稍后再试');
    }
}

async function loadHealthData(date) {
    const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.healthData}?date=${date}`;
    console.log('Fetching:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
}

function updateHealthUI(data) {
    // Update score
    const scoreValue = document.querySelector('.score-value');
    if (scoreValue) scoreValue.textContent = data.score.overall;
    
    // Update indicators
    const indicators = document.querySelectorAll('.indicator-value');
    if (indicators[0]) indicators[0].textContent = data.score.exercise;
    if (indicators[1]) indicators[1].textContent = data.score.nutrition;
    if (indicators[2]) indicators[2].textContent = data.score.sleep;
    
    // Update stats
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues[0]) statValues[0].textContent = data.steps.current.toLocaleString();
    if (statValues[1]) statValues[1].textContent = data.calories.intake.toLocaleString();
    if (statValues[2]) statValues[2].textContent = data.water.current;
    
    // Update progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    if (progressBars[0]) {
        const stepsPercent = Math.round((data.steps.current / data.steps.target) * 100);
        progressBars[0].style.width = `${stepsPercent}%`;
        // Update percentage text
        const statPercents = document.querySelectorAll('.stat-percent');
        if (statPercents[0]) statPercents[0].textContent = `${stepsPercent}%`;
    }
    if (progressBars[1]) {
        const caloriesPercent = Math.round((data.calories.intake / data.calories.target) * 100);
        progressBars[1].style.width = `${caloriesPercent}%`;
        const statPercents = document.querySelectorAll('.stat-percent');
        if (statPercents[1]) statPercents[1].textContent = `${caloriesPercent}%`;
    }
    if (progressBars[2]) {
        const waterPercent = Math.round((data.water.current / data.water.target) * 100);
        progressBars[2].style.width = `${waterPercent}%`;
        const statPercents = document.querySelectorAll('.stat-percent');
        if (statPercents[2]) statPercents[2].textContent = `${waterPercent}%`;
    }
    
    console.log('✅ UI updated with real data');
}

function updateDateDisplay() {
    const now = new Date();
    const dateText = document.querySelector('.date-text');
    const weekday = document.querySelector('.weekday');
    
    if (dateText) {
        dateText.textContent = `${now.getMonth() + 1}月${now.getDate()}日`;
    }
    
    if (weekday) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        weekday.textContent = days[now.getDay()];
    }
}

async function loadRecentMeals() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const meals = await API.getMeals({ date: today });
        console.log('📊 Loaded meals:', meals);
        
        // Update meal cards if they exist
        updateMealDisplay(meals);
    } catch (error) {
        console.error('Failed to load meals:', error);
    }
}

async function loadRecentSymptoms() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const symptoms = await API.getSymptoms({ date: today });
        console.log('📊 Loaded symptoms:', symptoms);
        
        // Update symptom display if it exists
        updateSymptomDisplay(symptoms);
    } catch (error) {
        console.error('Failed to load symptoms:', error);
    }
}

function updateMealDisplay(meals) {
    // This will be expanded based on your UI structure
    console.log('Updating meal display with:', meals);
}

function updateSymptomDisplay(symptoms) {
    // This will be expanded based on your UI structure
    console.log('Updating symptom display with:', symptoms);
}

function showErrorNotification(message) {
    // Simple error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff6b6b;
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Quick test function
window.testAPI = async function() {
    console.log('🧪 Testing API endpoints...');
    
    try {
        // Test health summary
        const health = await API.getHealthSummary();
        console.log('✅ Health Summary:', health);
        
        // Test meals
        const meals = await API.getMeals();
        console.log('✅ Meals:', meals);
        
        // Test symptoms
        const symptoms = await API.getSymptoms();
        console.log('✅ Symptoms:', symptoms);
        
        alert('API测试成功！查看控制台获取详细信息');
    } catch (error) {
        console.error('❌ API test failed:', error);
        alert('API测试失败：' + error.message);
    }
};

console.log('💡 Tip: 在控制台运行 testAPI() 来测试 API 连接');

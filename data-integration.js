// Data Integration - connects mockup UI to real API
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Health Tracker Frontend loaded');
    
    // Initialize app
    await initializeApp();
});

async function initializeApp() {
    try {
        // Test API connection
        console.log('Testing API connection...');
        const healthData = await API.getHealthSummary();
        console.log('✅ API connected:', healthData);
        
        // Load initial data
        await Promise.all([
            loadRecentMeals(),
            loadRecentSymptoms()
        ]);
        
        // Update date display
        updateDateDisplay();
        
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize app:', error);
        showErrorNotification('无法连接到服务器，请稍后再试');
    }
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

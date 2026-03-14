// 后端 API 地址（部署后需要替换）
const BACKEND_URL = 'http://localhost:3000';

// AI 识别食物热量
async function analyzeFoodWithAI(file) {
    try {
        // 显示加载状态
        showNotification('AI 正在识别食物...', 'info');
        
        const formData = new FormData();
        formData.append('photo', file);
        
        const response = await fetch(`${BACKEND_URL}/api/analyze-food`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('AI 识别失败');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // 显示成功
            showNotification(`识别成功：${result.data.foodName} (${result.data.calories} kcal)`, 'success');
            return result.data;
        } else {
            throw new Error(result.error || 'AI 识别失败');
        }
    } catch (error) {
        console.error('AI 识别错误:', error);
        showNotification('AI 识别失败，使用手动输入', 'error');
        return null;
    }
}

// 显示 AI 识别结果
function showAIResultModal(foodData) {
    const modal = document.createElement('div');
    modal.className = 'ai-result-modal';
    modal.innerHTML = `
        <div class="ai-result-card">
            <div class="ai-result-header">
                <h3>🤖 AI 识别结果</h3>
                <button class="close-btn" onclick="this.closest('.ai-result-modal').remove()">×</button>
            </div>
            <div class="ai-result-body">
                <div class="result-row">
                    <span class="label">食物：</span>
                    <strong>${foodData.foodName}</strong>
                </div>
                <div class="result-row">
                    <span class="label">热量：</span>
                    <strong class="highlight">${foodData.calories} kcal</strong>
                </div>
                <div class="result-row">
                    <span class="label">营养：</span>
                    <span>蛋白质 ${foodData.protein}g / 碳水 ${foodData.carbs}g / 脂肪 ${foodData.fat}g</span>
                </div>
                ${foodData.notes ? `
                <div class="result-row notes">
                    <span class="label">建议：</span>
                    <span>${foodData.notes}</span>
                </div>
                ` : ''}
            </div>
            <div class="ai-result-actions">
                <button class="btn-secondary" onclick="this.closest('.ai-result-modal').remove()">取消</button>
                <button class="btn-primary" onclick="confirmAIResult(${JSON.stringify(foodData).replace(/"/g, '&quot;')}); this.closest('.ai-result-modal').remove();">✓ 确认添加</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 确认 AI 识别结果，添加到热量记录
function confirmAIResult(foodData) {
    // 添加到今日热量摄入
    const today = new Date().toISOString().split('T')[0];
    const healthData = JSON.parse(localStorage.getItem('healthData') || '{}');
    
    if (!healthData[today]) {
        healthData[today] = {
            calories: { intake: 0, burn: 0, meals: [] },
            steps: 8234,
            weight: 65.2,
            sleep: 7.5,
            mood: ['😊', '😊', '😐', '😊', '😊'],
            exercise: []
        };
    }
    
    // 添加到meals
    healthData[today].calories.meals.push({
        name: foodData.foodName,
        calories: foodData.calories,
        protein: foodData.protein,
        carbs: foodData.carbs,
        fat: foodData.fat,
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    });
    
    // 更新总热量
    healthData[today].calories.intake += foodData.calories;
    
    // 保存
    localStorage.setItem('healthData', JSON.stringify(healthData));
    
    // 显示成功通知
    showNotification(`已添加：${foodData.foodName} (${foodData.calories} kcal)`, 'success');
    
    // 更新页面显示
    updateCalorieDisplay(healthData[today].calories);
}

// 更新热量显示
function updateCalorieDisplay(caloriesData) {
    // 更新热量摄入数字
    const intakeElement = document.querySelector('.stat-value');
    if (intakeElement && intakeElement.textContent.includes(',')) {
        intakeElement.textContent = caloriesData.intake.toLocaleString();
    }
    
    // 更新进度条
    const progressBar = document.querySelector('.stat-progress .progress-bar');
    if (progressBar) {
        const percentage = Math.min(Math.round((caloriesData.intake / 2000) * 100), 100);
        progressBar.style.width = percentage + '%';
    }
}

// 通知系统
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#4ADE80' : type === 'error' ? '#FF6B9D' : '#7B68EE'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
@keyframes slideIn {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOut {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(400px);
        opacity: 0;
    }
}

.ai-result-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    animation: fadeIn 0.2s ease;
}

.ai-result-card {
    background: white;
    border-radius: 24px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.ai-result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.ai-result-header h3 {
    margin: 0;
    font-size: 24px;
    color: #2D3748;
}

.close-btn {
    background: none;
    border: none;
    font-size: 32px;
    color: #718096;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-btn:hover {
    color: #2D3748;
}

.result-row {
    padding: 12px 0;
    border-bottom: 1px solid #FAFAFA;
}

.result-row:last-child {
    border-bottom: none;
}

.result-row .label {
    color: #718096;
    font-size: 14px;
}

.result-row strong {
    color: #2D3748;
    font-size: 16px;
}

.result-row .highlight {
    color: #7B68EE;
    font-size: 20px;
}

.result-row.notes {
    background: #FAFAFA;
    padding: 16px;
    border-radius: 12px;
    margin-top: 12px;
}

.ai-result-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn-primary, .btn-secondary {
    flex: 1;
    padding: 14px 24px;
    border-radius: 12px;
    border: none;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: linear-gradient(135deg, #7B68EE, #9D8FF8);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(123, 104, 238, 0.3);
}

.btn-secondary {
    background: #FAFAFA;
    color: #718096;
}

.btn-secondary:hover {
    background: #F0F0F0;
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}
`;
document.head.appendChild(style);

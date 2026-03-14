// ========================================
// 健康追踪应用 - 完整功能版
// ========================================

// 配置
const CONFIG = {
    BACKEND_URL: 'http://localhost:3000', // 本地测试时用这个
    // BACKEND_URL: 'https://your-backend.railway.app', // 部署后改成这个
    MAX_PHOTOS: 9,
    DAILY_GOALS: {
        steps: 10000,
        calories: 2000,
        sleep: 8,
        exercise: 60
    }
};

// ========================================
// 数据管理模块
// ========================================

class HealthDataManager {
    constructor() {
        this.storageKey = 'healthData';
        this.data = this.loadAllData();
    }

    // 获取今天的日期字符串
    getTodayKey() {
        return new Date().toISOString().split('T')[0];
    }

    // 加载所有数据
    loadAllData() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : {};
    }

    // 保存所有数据
    saveAllData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // 获取今日数据
    getTodayData() {
        const today = this.getTodayKey();
        if (!this.data[today]) {
            this.data[today] = this.getDefaultData();
        }
        return this.data[today];
    }

    // 获取默认数据结构
    getDefaultData() {
        return {
            steps: 0,
            weight: null,
            calories: {
                intake: 0,
                burn: 0,
                meals: []
            },
            sleep: 0,
            exercise: {
                duration: 0,
                activities: []
            },
            mood: null,
            habits: {
                water: 0,
                reading: 0,
                meditation: 0
            },
            photos: [],
            updatedAt: new Date().toISOString()
        };
    }

    // 更新今日数据
    updateTodayData(updates) {
        const today = this.getTodayKey();
        this.data[today] = {
            ...this.getTodayData(),
            ...updates,
            updatedAt: new Date().toISOString()
        };
        this.saveAllData();
        return this.data[today];
    }

    // 获取最近 N 天的数据
    getRecentDays(days = 7) {
        const result = [];
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const key = date.toISOString().split('T')[0];
            result.push({
                date: key,
                data: this.data[key] || this.getDefaultData()
            });
        }
        return result;
    }

    // 添加食物记录
    addMeal(mealData) {
        const today = this.getTodayData();
        today.calories.meals.push({
            ...mealData,
            time: new Date().toISOString()
        });
        today.calories.intake = today.calories.meals.reduce((sum, meal) => sum + meal.calories, 0);
        this.updateTodayData(today);
    }

    // 添加运动记录
    addExercise(exerciseData) {
        const today = this.getTodayData();
        today.exercise.activities.push({
            ...exerciseData,
            time: new Date().toISOString()
        });
        today.exercise.duration = today.exercise.activities.reduce((sum, act) => sum + act.duration, 0);
        this.updateTodayData(today);
    }

    // 添加照片
    addPhoto(photoData) {
        const today = this.getTodayData();
        today.photos.push({
            data: photoData,
            timestamp: Date.now()
        });
        this.updateTodayData(today);
    }
}

// 创建全局数据管理器实例
const dataManager = new HealthDataManager();

// ========================================
// AI 识别模块
// ========================================

class AIFoodAnalyzer {
    constructor(backendUrl) {
        this.backendUrl = backendUrl;
    }

    async analyzeFood(file) {
        const formData = new FormData();
        formData.append('photo', file);

        try {
            showLoading('AI 正在识别食物...');
            
            const response = await fetch(`${this.backendUrl}/api/analyze-food`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('识别失败');
            }

            const result = await response.json();
            hideLoading();

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || '识别失败');
            }
        } catch (error) {
            hideLoading();
            console.error('AI识别错误:', error);
            showNotification('AI识别失败，请检查网络或稍后重试', 'error');
            return null;
        }
    }
}

const aiAnalyzer = new AIFoodAnalyzer(CONFIG.BACKEND_URL);

// ========================================
// UI 更新模块
// ========================================

// 更新步数卡片
function updateStepsCard(steps) {
    const percent = Math.min((steps / CONFIG.DAILY_GOALS.steps) * 100, 100);
    document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = steps.toLocaleString();
    document.querySelector('.stat-card:nth-child(1) .stat-percent').textContent = Math.round(percent) + '%';
    document.querySelector('.stat-card:nth-child(1) .progress-bar').style.width = percent + '%';
}

// 更新热量卡片
function updateCaloriesCard(intake, burn) {
    const percent = Math.min((intake / CONFIG.DAILY_GOALS.calories) * 100, 100);
    document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = intake.toLocaleString();
    document.querySelector('.stat-card:nth-child(2) .stat-percent').textContent = Math.round(percent) + '%';
    document.querySelector('.stat-card:nth-child(2) .progress-bar').style.width = percent + '%';
    
    // 更新热量摘要
    const deficit = burn - intake;
    document.querySelector('.calorie-summary .calorie-item:nth-child(1) .calorie-value').textContent = intake.toLocaleString();
    document.querySelector('.calorie-summary .calorie-item:nth-child(2) .calorie-value').textContent = burn.toLocaleString();
    document.querySelector('.calorie-summary .calorie-item:nth-child(3) .calorie-value').textContent = (deficit >= 0 ? '-' : '+') + Math.abs(deficit);
}

// 更新睡眠卡片
function updateSleepCard(hours) {
    const percent = Math.min((hours / CONFIG.DAILY_GOALS.sleep) * 100, 100);
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = hours + 'h';
    document.querySelector('.stat-card:nth-child(3) .stat-percent').textContent = Math.round(percent) + '%';
    document.querySelector('.stat-card:nth-child(3) .progress-bar').style.width = percent + '%';
    
    // 更新睡眠详情
    document.querySelector('.sleep-duration').innerHTML = hours + '<span class="sleep-unit">小时</span>';
}

// 更新运动卡片
function updateExerciseCard(minutes) {
    const percent = Math.min((minutes / CONFIG.DAILY_GOALS.exercise) * 100, 100);
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = minutes + 'min';
    document.querySelector('.stat-card:nth-child(4) .stat-percent').textContent = Math.round(percent) + '%';
    document.querySelector('.stat-card:nth-child(4) .progress-bar').style.width = percent + '%';
    
    // 更新运动详情
    document.querySelector('.exercise-summary .exercise-number').textContent = minutes;
}

// 更新体重卡片
function updateWeightCard(weight) {
    if (weight) {
        document.querySelector('.weight-number').innerHTML = weight + ' <span class="weight-unit">kg</span>';
    }
}

// 更新健康评分
function updateHealthScore() {
    const today = dataManager.getTodayData();
    
    // 计算各项得分
    const stepScore = Math.min((today.steps / CONFIG.DAILY_GOALS.steps) * 100, 100);
    const calorieScore = Math.min((today.calories.intake / CONFIG.DAILY_GOALS.calories) * 100, 100);
    const sleepScore = Math.min((today.sleep / CONFIG.DAILY_GOALS.sleep) * 100, 100);
    const exerciseScore = Math.min((today.exercise.duration / CONFIG.DAILY_GOALS.exercise) * 100, 100);
    
    // 综合评分
    const totalScore = Math.round((stepScore + calorieScore + sleepScore + exerciseScore) / 4);
    
    document.querySelector('.score-value').textContent = totalScore;
    
    // 更新评分指标
    document.querySelector('.indicator:nth-child(1) .indicator-value').textContent = Math.round(exerciseScore);
    document.querySelector('.indicator:nth-child(2) .indicator-value').textContent = Math.round(calorieScore);
    document.querySelector('.indicator:nth-child(3) .indicator-value').textContent = Math.round(sleepScore);
}

// 更新所有图表和卡片
function updateAllUI() {
    const today = dataManager.getTodayData();
    
    updateStepsCard(today.steps);
    updateCaloriesCard(today.calories.intake, today.calories.burn);
    updateSleepCard(today.sleep);
    updateExerciseCard(today.exercise.duration);
    updateWeightCard(today.weight);
    updateHealthScore();
    
    // 更新图表
    updateCalorieChart();
    updateExerciseChart();
    updateSleepChart();
    updateWeightChart();
}

// ========================================
// 图表更新模块
// ========================================

let calorieChart, exerciseChart, sleepChart, weightChart;

function updateCalorieChart() {
    const recentDays = dataManager.getRecentDays(7);
    const labels = recentDays.map(d => {
        const date = new Date(d.date);
        return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    });
    const intake = recentDays.map(d => d.data.calories.intake);
    const burn = recentDays.map(d => d.data.calories.burn);
    
    if (calorieChart) {
        calorieChart.data.labels = labels;
        calorieChart.data.datasets[0].data = intake;
        calorieChart.data.datasets[1].data = burn;
        calorieChart.update();
    }
}

function updateExerciseChart() {
    const recentDays = dataManager.getRecentDays(7);
    const labels = recentDays.map(d => {
        const date = new Date(d.date);
        return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    });
    const minutes = recentDays.map(d => d.data.exercise.duration);
    
    if (exerciseChart) {
        exerciseChart.data.labels = labels;
        exerciseChart.data.datasets[0].data = minutes;
        exerciseChart.update();
    }
}

function updateSleepChart() {
    const recentDays = dataManager.getRecentDays(7);
    const labels = recentDays.map(d => {
        const date = new Date(d.date);
        return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    });
    const hours = recentDays.map(d => d.data.sleep);
    
    if (sleepChart) {
        sleepChart.data.labels = labels;
        sleepChart.data.datasets[0].data = hours;
        sleepChart.update();
    }
}

function updateWeightChart() {
    const recentDays = dataManager.getRecentDays(30);
    const weights = recentDays.map(d => d.data.weight).filter(w => w !== null);
    
    if (weights.length > 0 && weightChart) {
        weightChart.data.datasets[0].data = weights;
        weightChart.update();
    }
}

// ========================================
// 交互功能模块
// ========================================

// 步数编辑
function setupStepsEditor() {
    console.log('🔧 设置步数编辑器...');
    const stepsCard = document.querySelector('.stat-card:nth-child(1)');
    if (!stepsCard) {
        console.error('❌ 找不到步数卡片！');
        return;
    }
    const stepsValue = stepsCard.querySelector('.stat-value');
    
    stepsValue.style.cursor = 'pointer';
    stepsValue.addEventListener('click', () => {
        const currentSteps = dataManager.getTodayData().steps;
        const newSteps = prompt('输入今日步数:', currentSteps);
        if (newSteps !== null && !isNaN(newSteps)) {
            const steps = parseInt(newSteps);
            dataManager.updateTodayData({ steps });
            updateStepsCard(steps);
            updateHealthScore();
            showNotification('步数已更新！', 'success');
        }
    });
}

// 体重编辑
function setupWeightEditor() {
    console.log('🔧 设置体重编辑器...');
    const weightNumber = document.querySelector('.weight-number');
    if (!weightNumber) {
        console.error('❌ 找不到体重元素！');
        return;
    }
    weightNumber.style.cursor = 'pointer';
    
    weightNumber.addEventListener('click', () => {
        const currentWeight = dataManager.getTodayData().weight || 65.0;
        const newWeight = prompt('输入当前体重 (kg):', currentWeight);
        if (newWeight !== null && !isNaN(newWeight)) {
            const weight = parseFloat(newWeight);
            dataManager.updateTodayData({ weight });
            updateWeightCard(weight);
            updateWeightChart();
            showNotification('体重已记录！', 'success');
        }
    });
}

// 睡眠编辑
function setupSleepEditor() {
    const sleepCard = document.querySelector('.stat-card:nth-child(3)');
    const sleepValue = sleepCard.querySelector('.stat-value');
    
    sleepValue.style.cursor = 'pointer';
    sleepValue.addEventListener('click', () => {
        const currentSleep = dataManager.getTodayData().sleep;
        const newSleep = prompt('输入睡眠时长 (小时):', currentSleep);
        if (newSleep !== null && !isNaN(newSleep)) {
            const sleep = parseFloat(newSleep);
            dataManager.updateTodayData({ sleep });
            updateSleepCard(sleep);
            updateSleepChart();
            updateHealthScore();
            showNotification('睡眠时长已更新！', 'success');
        }
    });
}

// 运动编辑
function setupExerciseEditor() {
    const exerciseCard = document.querySelector('.stat-card:nth-child(4)');
    const exerciseValue = exerciseCard.querySelector('.stat-value');
    
    exerciseValue.style.cursor = 'pointer';
    exerciseValue.addEventListener('click', () => {
        const type = prompt('运动类型:', '跑步');
        if (!type) return;
        
        const duration = prompt('运动时长 (分钟):', '30');
        if (duration !== null && !isNaN(duration)) {
            dataManager.addExercise({
                type,
                duration: parseInt(duration)
            });
            
            const today = dataManager.getTodayData();
            updateExerciseCard(today.exercise.duration);
            updateExerciseChart();
            updateHealthScore();
            showNotification(`${type} ${duration}分钟 已记录！`, 'success');
        }
    });
}

// ========================================
// 照片上传和 AI 识别
// ========================================

let uploadedPhotos = [];

function setupPhotoUpload() {
    console.log('🔧 设置照片上传...');
    
    // 确保在 DOM 完全加载后再查找元素
    const addPhotoBtn = document.getElementById('addPhotoBtn');
    const photoPreviewGrid = document.getElementById('photoPreviewGrid');
    const collagePreview = document.getElementById('collagePreview');
    const foodCollageCanvas = document.getElementById('foodCollage');
    
    console.log('按钮元素:', addPhotoBtn);
    console.log('预览网格:', photoPreviewGrid);
    console.log('拼图预览:', collagePreview);
    console.log('Canvas:', foodCollageCanvas);
    
    if (!addPhotoBtn) {
        console.error('❌ 找不到添加照片按钮！#addPhotoBtn 不存在');
        // 尝试诊断：列出所有按钮
        const allButtons = document.querySelectorAll('button');
        console.log('页面中的所有按钮:', Array.from(allButtons).map(b => ({ id: b.id, class: b.className, text: b.textContent.substring(0, 20) })));
        return;
    }
    
    console.log('✅ 找到按钮，绑定点击事件...');
    
    addPhotoBtn.addEventListener('click', (e) => {
        console.log('📸 添加照片按钮被点击了！Event:', e);
        e.preventDefault();
        e.stopPropagation();
        
        // 创建 input 并立即触发（必须在同一个事件循环中）
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = true;
        input.style.display = 'none';
        
        // 添加到 DOM（某些浏览器需要）
        document.body.appendChild(input);
        
        input.onchange = async (e) => {
            console.log('📁 文件选择器触发，选择了文件:', e.target.files.length);
            const files = Array.from(e.target.files);
            
            if (uploadedPhotos.length + files.length > CONFIG.MAX_PHOTOS) {
                showNotification(`最多只能上传 ${CONFIG.MAX_PHOTOS} 张照片哦！`, 'warning');
                document.body.removeChild(input);
                return;
            }
            
            for (const file of files) {
                console.log('📷 处理文件:', file.name);
                // 添加照片到预览
                const reader = new FileReader();
                reader.onload = async (event) => {
                    uploadedPhotos.push({
                        data: event.target.result,
                        timestamp: Date.now()
                    });
                    
                    renderPhotoGrid();
                    
                    // 自动生成拼图
                    if (uploadedPhotos.length > 0) {
                        generateCollage(uploadedPhotos);
                        collagePreview.classList.add('show');
                    }
                    
                    // 保存照片到数据
                    dataManager.addPhoto(event.target.result);
                };
                reader.readAsDataURL(file);
                
                // 调用 AI 识别
                const aiResult = await aiAnalyzer.analyzeFood(file);
                if (aiResult) {
                    showAIResult(aiResult);
                }
            }
            
            // 清理 input
            document.body.removeChild(input);
        };
        
        // 用户取消选择的情况
        input.oncancel = () => {
            console.log('❌ 用户取消了文件选择');
            document.body.removeChild(input);
        };
        
        // 立即触发点击（必须在同步代码中）
        console.log('🖱️ 准备触发 input.click()...');
        input.click();
        console.log('✅ input.click() 已调用');
    });
}

// 渲染照片网格
function renderPhotoGrid() {
    const photoPreviewGrid = document.getElementById('photoPreviewGrid');
    
    if (uploadedPhotos.length === 0) {
        photoPreviewGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <div class="empty-state-text">点击下方「添加照片」上传你的美食照片<br>自动生成精美拼图</div>
            </div>
        `;
        return;
    }
    
    photoPreviewGrid.innerHTML = uploadedPhotos.map((photo, index) => `
        <div class="photo-preview-item">
            <img src="${photo.data}" alt="Food photo ${index + 1}">
            <button class="photo-remove-btn" onclick="removePhoto(${index})">×</button>
        </div>
    `).join('');
}

// 移除照片
function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    renderPhotoGrid();
    
    const collagePreview = document.getElementById('collagePreview');
    if (uploadedPhotos.length === 0) {
        collagePreview.classList.remove('show');
    } else {
        generateCollage(uploadedPhotos);
    }
}
window.removePhoto = removePhoto; // 全局暴露

// 显示 AI 识别结果
function showAIResult(aiData) {
    const html = `
        <div class="ai-result-modal">
            <div class="ai-result-content">
                <h4>🤖 AI 识别结果</h4>
                <div class="ai-result-info">
                    <div class="result-row">
                        <span>食物：</span>
                        <strong>${aiData.foodName}</strong>
                    </div>
                    <div class="result-row">
                        <span>热量：</span>
                        <strong>${aiData.calories} kcal</strong>
                    </div>
                    <div class="result-row">
                        <span>营养：</span>
                        <span>蛋白质 ${aiData.protein}g / 碳水 ${aiData.carbs}g / 脂肪 ${aiData.fat}g</span>
                    </div>
                    ${aiData.portion ? `<div class="result-row"><span>份量：</span><span>${aiData.portion}</span></div>` : ''}
                    ${aiData.notes ? `<div class="result-row"><span>建议：</span><span>${aiData.notes}</span></div>` : ''}
                </div>
                <div class="ai-result-actions">
                    <button class="confirm-btn" onclick="confirmAIResult(${JSON.stringify(aiData).replace(/"/g, '&quot;')})">✓ 确认添加</button>
                    <button class="edit-btn" onclick="editAIResult(${JSON.stringify(aiData).replace(/"/g, '&quot;')})">✏️ 手动修改</button>
                    <button class="cancel-btn" onclick="closeAIResult()">× 取消</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
}

// 确认 AI 结果
function confirmAIResult(aiData) {
    dataManager.addMeal({
        name: aiData.foodName,
        calories: aiData.calories,
        protein: aiData.protein,
        carbs: aiData.carbs,
        fat: aiData.fat
    });
    
    const today = dataManager.getTodayData();
    updateCaloriesCard(today.calories.intake, today.calories.burn);
    updateCalorieChart();
    updateHealthScore();
    
    closeAIResult();
    showNotification(`${aiData.foodName} 已添加到今日热量！`, 'success');
}
window.confirmAIResult = confirmAIResult;

// 编辑 AI 结果
function editAIResult(aiData) {
    const name = prompt('食物名称:', aiData.foodName) || aiData.foodName;
    const calories = parseInt(prompt('热量 (kcal):', aiData.calories)) || aiData.calories;
    const protein = parseInt(prompt('蛋白质 (g):', aiData.protein)) || aiData.protein;
    const carbs = parseInt(prompt('碳水化合物 (g):', aiData.carbs)) || aiData.carbs;
    const fat = parseInt(prompt('脂肪 (g):', aiData.fat)) || aiData.fat;
    
    confirmAIResult({ foodName: name, calories, protein, carbs, fat });
}
window.editAIResult = editAIResult;

// 关闭 AI 结果
function closeAIResult() {
    const modal = document.querySelector('.ai-result-modal');
    if (modal) modal.remove();
}
window.closeAIResult = closeAIResult;

// ========================================
// 拼图生成
// ========================================

function generateCollage(photos) {
    const canvas = document.getElementById('foodCollage');
    const ctx = canvas.getContext('2d');
    
    const canvasSize = 800;
    const gap = 8;
    const cornerRadius = 12;
    
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // 背景
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // 获取布局
    const layout = getLayout(photos.length);
    
    // 绘制每张照片
    photos.forEach((photo, index) => {
        const pos = calculatePosition(index, layout, canvasSize, gap);
        drawRoundedImage(ctx, photo.data, pos.x, pos.y, pos.width, pos.height, cornerRadius);
    });
}

function getLayout(count) {
    if (count <= 1) return { cols: 1, rows: 1 };
    if (count === 2) return { cols: 2, rows: 1 };
    if (count === 3) return { cols: 2, rows: 2, special: '2-1' };
    if (count === 4) return { cols: 2, rows: 2 };
    if (count <= 6) return { cols: 3, rows: 2 };
    return { cols: 3, rows: 3 };
}

function calculatePosition(index, layout, canvasSize, gap) {
    if (layout.special === '2-1') {
        if (index < 2) {
            const cellWidth = (canvasSize - gap * 3) / 2;
            const cellHeight = (canvasSize - gap * 3) / 2;
            return {
                x: gap + index * (cellWidth + gap),
                y: gap,
                width: cellWidth,
                height: cellHeight
            };
        } else {
            const cellHeight = (canvasSize - gap * 3) / 2;
            return {
                x: gap,
                y: gap * 2 + cellHeight,
                width: canvasSize - gap * 2,
                height: cellHeight
            };
        }
    }
    
    const col = index % layout.cols;
    const row = Math.floor(index / layout.cols);
    const cellWidth = (canvasSize - gap * (layout.cols + 1)) / layout.cols;
    const cellHeight = (canvasSize - gap * (layout.rows + 1)) / layout.rows;
    
    return {
        x: gap + col * (cellWidth + gap),
        y: gap + row * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight
    };
}

function drawRoundedImage(ctx, imageData, x, y, width, height, radius) {
    const img = new Image();
    img.onload = () => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.clip();
        
        const imgAspect = img.width / img.height;
        const cellAspect = width / height;
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > cellAspect) {
            drawHeight = height;
            drawWidth = height * imgAspect;
            drawX = x - (drawWidth - width) / 2;
            drawY = y;
        } else {
            drawWidth = width;
            drawHeight = width / imgAspect;
            drawX = x;
            drawY = y - (drawHeight - height) / 2;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
    };
    img.src = imageData;
}

// 下载拼图
function setupCollageDownload() {
    const downloadBtn = document.getElementById('downloadCollageBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const canvas = document.getElementById('foodCollage');
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.download = `food-collage-${timestamp}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            showNotification('拼图已下载！', 'success');
        });
    }
}

// ========================================
// 通知和加载提示
// ========================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
    notification.innerHTML = `<span class="notification-icon">${icon}</span> ${message}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading(message) {
    const loading = document.createElement('div');
    loading.className = 'loading-overlay';
    loading.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <div class="loading-text">${message}</div>
        </div>
    `;
    loading.id = 'loadingOverlay';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.getElementById('loadingOverlay');
    if (loading) loading.remove();
}

// ========================================
// 初始化
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 健康追踪应用启动...');
    
    // 加载保存的数据
    const today = dataManager.getTodayData();
    console.log('📊 今日数据:', today);
    
    // 从保存的数据恢复照片
    uploadedPhotos = today.photos || [];
    
    // 初始化所有图表（保留原有的图表初始化代码）
    initCharts();
    
    // 更新所有 UI
    updateAllUI();
    
    // 设置编辑功能
    setupStepsEditor();
    setupWeightEditor();
    setupSleepEditor();
    setupExerciseEditor();
    
    // 设置照片上传
    setupPhotoUpload();
    setupCollageDownload();
    
    // 渲染照片网格
    if (uploadedPhotos.length > 0) {
        renderPhotoGrid();
        generateCollage(uploadedPhotos);
        document.getElementById('collagePreview').classList.add('show');
    }
    
    console.log('✨ 应用初始化完成！');
});

// 图表初始化（保留原有代码，但保存到全局变量）
function initCharts() {
    // 这里保留原有的 Chart.js 初始化代码
    // 但将图表实例保存到全局变量，以便后续更新
    
    const colors = {
        purple: '#7B68EE',
        purpleLight: '#9D8FF8',
        pink: '#FF6B9D',
        pinkLight: '#FF8FB3',
        green: '#4ADE80',
        greenLight: '#6EE7A0',
        orange: '#FF9F5A',
        orangeLight: '#FFB47A',
    };
    
    // 热量图表
    const calorieCtx = document.getElementById('calorieChart');
    if (calorieCtx) {
        const ctx = calorieCtx.getContext('2d');
        const recentDays = dataManager.getRecentDays(7);
        const labels = recentDays.map(d => {
            const date = new Date(d.date);
            return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
        });
        
        calorieChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: '摄入',
                        data: recentDays.map(d => d.data.calories.intake),
                        backgroundColor: colors.pink + '80',
                        borderColor: colors.pink,
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    },
                    {
                        label: '消耗',
                        data: recentDays.map(d => d.data.calories.burn),
                        backgroundColor: colors.purple + '80',
                        borderColor: colors.purple,
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        align: 'end'
                    }
                }
            }
        });
    }
    
    // 运动图表
    const exerciseCtx = document.getElementById('exerciseChart');
    if (exerciseCtx) {
        const ctx = exerciseCtx.getContext('2d');
        const recentDays = dataManager.getRecentDays(7);
        const labels = recentDays.map(d => {
            const date = new Date(d.date);
            return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
        });
        
        exerciseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: '运动时长',
                    data: recentDays.map(d => d.data.exercise.duration),
                    backgroundColor: colors.orange + 'CC',
                    borderColor: colors.orange,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.8,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // 睡眠图表
    const sleepCtx = document.getElementById('sleepChart');
    if (sleepCtx) {
        const ctx = sleepCtx.getContext('2d');
        const recentDays = dataManager.getRecentDays(7);
        const labels = recentDays.map(d => {
            const date = new Date(d.date);
            return ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
        });
        
        sleepChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: '睡眠时长',
                    data: recentDays.map(d => d.data.sleep),
                    borderColor: colors.green,
                    backgroundColor: colors.green + '40',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
    
    // 体重图表
    const weightCtx = document.getElementById('weightChart');
    if (weightCtx) {
        const ctx = weightCtx.getContext('2d');
        const recentDays = dataManager.getRecentDays(30);
        const weights = recentDays.map(d => d.data.weight).filter(w => w !== null);
        
        weightChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(weights.length).fill(''),
                datasets: [{
                    label: '体重',
                    data: weights,
                    borderColor: colors.purple,
                    backgroundColor: colors.purple + '40',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
}

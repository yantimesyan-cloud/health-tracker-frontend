// Clean Modern Data-Rich Charts Configuration

// Chart.js default config
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = '#718096';

// Color palette
const colors = {
    purple: '#7B68EE',
    purpleLight: '#9D8FF8',
    pink: '#FF6B9D',
    pinkLight: '#FF8FB3',
    green: '#4ADE80',
    greenLight: '#6EE7A0',
    orange: '#FF9F5A',
    orangeLight: '#FFB47A',
    blue: '#6C63FF',
    yellow: '#FFD93D',
    text: '#2D3748',
    textSecondary: '#718096',
    bgLight: '#FAFAFA'
};

// Helper function to create gradient
function createGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

// Helper function to create area gradient (with transparency)
function createAreaGradient(ctx, color1, color2) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, color1 + '40');
    gradient.addColorStop(1, color2 + '00');
    return gradient;
}

// 1. Health Score Chart (Doughnut)
const scoreCtx = document.getElementById('scoreChart');
if (scoreCtx) {
    const ctx = scoreCtx.getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [85, 15],
                backgroundColor: [
                    createGradient(ctx, colors.purple, colors.purpleLight),
                    colors.bgLight
                ],
                borderWidth: 0,
                circumference: 180,
                rotation: 270
            }]
        },
        options: {
            cutout: '80%',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false }
            }
        }
    });
}

// 2. Weight Trend Chart (Line)
const weightCtx = document.getElementById('weightChart');
if (weightCtx) {
    const ctx = weightCtx.getContext('2d');
    const weightData = [66.5, 66.3, 66.1, 65.9, 65.8, 65.6, 65.5, 65.4, 65.3, 65.2];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['', '', '', '', '', '', '', '', '', ''],
            datasets: [{
                label: '体重',
                data: weightData,
                borderColor: colors.purple,
                backgroundColor: createAreaGradient(ctx, colors.purple, colors.purpleLight),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors.purple,
                pointHoverBorderColor: '#FFFFFF',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 64.5,
                    max: 67,
                    ticks: {
                        callback: (value) => value + 'kg',
                        color: colors.textSecondary,
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#FFFFFF',
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => context.parsed.y + ' kg'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// 3. Calorie Chart (Bar)
const calorieCtx = document.getElementById('calorieChart');
if (calorieCtx) {
    const ctx = calorieCtx.getContext('2d');
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const intake = [1800, 1650, 1900, 1750, 1650, 2100, 1850];
    const burn = [2100, 1920, 2050, 1880, 1920, 2200, 1950];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [
                {
                    label: '摄入',
                    data: intake,
                    backgroundColor: colors.pink + '80',
                    borderColor: colors.pink,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false
                },
                {
                    label: '消耗',
                    data: burn,
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
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => value,
                        color: colors.textSecondary,
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: colors.textSecondary,
                        font: { size: 11 }
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        boxWidth: 12,
                        boxHeight: 12,
                        borderRadius: 6,
                        useBorderRadius: true,
                        color: colors.text,
                        font: { size: 12, weight: '600' },
                        padding: 12
                    }
                },
                tooltip: {
                    backgroundColor: '#FFFFFF',
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    callbacks: {
                        label: (context) => context.dataset.label + ': ' + context.parsed.y + ' kcal'
                    }
                }
            }
        }
    });
}

// 4. Exercise Chart (Bar)
const exerciseCtx = document.getElementById('exerciseChart');
if (exerciseCtx) {
    const ctx = exerciseCtx.getContext('2d');
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const minutes = [60, 45, 30, 60, 45, 0, 45];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: days,
            datasets: [{
                label: '运动时长',
                data: minutes,
                backgroundColor: minutes.map(m => 
                    m >= 60 ? colors.green + 'CC' : 
                    m >= 30 ? colors.orange + 'CC' : 
                    colors.pink + '66'
                ),
                borderColor: minutes.map(m => 
                    m >= 60 ? colors.green : 
                    m >= 30 ? colors.orange : 
                    colors.pink
                ),
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.8,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 80,
                    ticks: {
                        callback: (value) => value + 'min',
                        color: colors.textSecondary,
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: colors.textSecondary,
                        font: { size: 11 }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#FFFFFF',
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => context.parsed.y + ' 分钟'
                    }
                }
            }
        }
    });
}

// 5. Sleep Chart (Line)
const sleepCtx = document.getElementById('sleepChart');
if (sleepCtx) {
    const ctx = sleepCtx.getContext('2d');
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const hours = [7.2, 7.5, 6.8, 7.0, 7.5, 8.2, 7.5];
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: days,
            datasets: [{
                label: '睡眠时长',
                data: hours,
                borderColor: colors.green,
                backgroundColor: createAreaGradient(ctx, colors.green, colors.greenLight),
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: colors.green,
                pointBorderColor: '#FFFFFF',
                pointBorderWidth: 2,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: colors.green,
                pointHoverBorderColor: '#FFFFFF',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: false,
                    min: 6,
                    max: 9,
                    ticks: {
                        callback: (value) => value + 'h',
                        color: colors.textSecondary,
                        font: { size: 11 }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: colors.textSecondary,
                        font: { size: 11 }
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#FFFFFF',
                    titleColor: colors.text,
                    bodyColor: colors.text,
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: (context) => context.parsed.y + ' 小时'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Interactive features
document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        // Remove active from all tabs
        document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
        // Add active to clicked tab
        this.classList.add('active');
        
        // Here you would update the chart data based on the period
        // For demo purposes, we'll just show the tab is active
        console.log('Selected period:', this.dataset.period);
    });
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Progress bar animation on load
window.addEventListener('load', () => {
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
});

// Hover effect for cards
document.querySelectorAll('.card, .stat-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});

console.log('✨ Clean Modern Data-Rich Health Tracker loaded!');

// ========================================
// FOOD PHOTO UPLOAD & COLLAGE FUNCTIONALITY
// ========================================

let uploadedPhotos = [];
const MAX_PHOTOS = 9;

// Get DOM elements
const addPhotoBtn = document.getElementById('addPhotoBtn');
const photoPreviewGrid = document.getElementById('photoPreviewGrid');
const generateCollageBtn = document.getElementById('generateCollageBtn');
const collagePreview = document.getElementById('collagePreview');
const foodCollageCanvas = document.getElementById('foodCollage');

// Add photo button click handler
addPhotoBtn.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        
        // Check if adding these files would exceed the limit
        if (uploadedPhotos.length + files.length > MAX_PHOTOS) {
            alert(`最多只能上传 ${MAX_PHOTOS} 张照片哦！`);
            return;
        }
        
        // 对每张照片进行 AI 识别
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                addPhotoToGrid(event.target.result);
                
                // 自动生成拼图
                if (uploadedPhotos.length > 0) {
                    generateCollage(uploadedPhotos);
                    collagePreview.classList.add('show');
                }
            };
            reader.readAsDataURL(file);
            
            // 调用 AI 识别（如果 analyzeFoodWithAI 函数存在）
            if (typeof analyzeFoodWithAI === 'function') {
                const aiResult = await analyzeFoodWithAI(file);
                if (aiResult) {
                    showAIResultModal(aiResult);
                }
            }
        }
    };
    
    input.click();
});

// Add photo to grid
function addPhotoToGrid(dataUrl) {
    uploadedPhotos.push({
        data: dataUrl,
        timestamp: Date.now()
    });
    
    renderPhotoGrid();
    
    // Show generate button if we have photos
    if (uploadedPhotos.length >= 1) {
        generateCollageBtn.classList.add('show');
    }
}

// Remove photo from grid
function removePhoto(index) {
    uploadedPhotos.splice(index, 1);
    renderPhotoGrid();
    
    // Hide generate button if no photos
    if (uploadedPhotos.length === 0) {
        generateCollageBtn.classList.remove('show');
        collagePreview.classList.remove('show');
    }
}

// Render photo grid
function renderPhotoGrid() {
    if (uploadedPhotos.length === 0) {
        photoPreviewGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🍽️</div>
                <div class="empty-state-text">点击「添加照片」上传你的美食照片<br>自动生成精美拼图</div>
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

// Generate collage button click handler
generateCollageBtn.addEventListener('click', () => {
    generateCollage(uploadedPhotos);
    collagePreview.classList.add('show');
    
    // Scroll to collage preview
    setTimeout(() => {
        collagePreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
});

// Get layout based on photo count
function getLayout(count) {
    if (count <= 1) return { cols: 1, rows: 1, special: null };
    if (count === 2) return { cols: 2, rows: 1, special: null };
    if (count === 3) return { cols: 2, rows: 2, special: '2-1' }; // 特殊：上2下1
    if (count === 4) return { cols: 2, rows: 2, special: null };
    if (count <= 6) return { cols: 3, rows: 2, special: null };
    if (count <= 9) return { cols: 3, rows: 3, special: null };
    return { cols: 4, rows: Math.ceil(count / 4), special: null };
}

// Calculate position for each photo in the grid
function calculatePosition(index, layout, canvasSize, gap) {
    const col = index % layout.cols;
    const row = Math.floor(index / layout.cols);
    
    // 3张照片的特殊布局：上2下1
    if (layout.special === '2-1') {
        if (index < 2) {
            // 上面两张小的
            const cellWidth = (canvasSize - gap * 3) / 2;
            const cellHeight = (canvasSize - gap * 3) / 2;
            return {
                x: gap + index * (cellWidth + gap),
                y: gap,
                width: cellWidth,
                height: cellHeight
            };
        } else {
            // 下面一张大的
            const cellHeight = (canvasSize - gap * 3) / 2;
            return {
                x: gap,
                y: gap * 2 + cellHeight,
                width: canvasSize - gap * 2,
                height: cellHeight
            };
        }
    }
    
    // 默认网格布局
    const cellWidth = (canvasSize - gap * (layout.cols + 1)) / layout.cols;
    const cellHeight = (canvasSize - gap * (layout.rows + 1)) / layout.rows;
    
    return {
        x: gap + col * (cellWidth + gap),
        y: gap + row * (cellHeight + gap),
        width: cellWidth,
        height: cellHeight
    };
}

// Draw rounded rectangle
function drawRoundedRect(ctx, x, y, width, height, radius) {
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
}

// Draw image with rounded corners
function drawRoundedImage(ctx, imageData, x, y, width, height, radius) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            ctx.save();
            drawRoundedRect(ctx, x, y, width, height, radius);
            ctx.clip();
            
            // Calculate aspect ratio to cover the area
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
            resolve();
        };
        img.src = imageData;
    });
}

// Get meal time label
function getMealTimeLabel(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour >= 6 && hour < 10) return '🌅 早餐';
    if (hour >= 10 && hour < 14) return '☀️ 午餐';
    if (hour >= 14 && hour < 18) return '🌤️ 下午茶';
    if (hour >= 18 && hour < 22) return '🌙 晚餐';
    return '🌃 夜宵';
}

// Generate collage
async function generateCollage(photos) {
    const canvas = foodCollageCanvas;
    const ctx = canvas.getContext('2d');
    
    // Canvas settings
    const canvasSize = 800;
    const gap = 8;
    const cornerRadius = 12;
    const bgColor = '#FFFFFF';
    
    // Get layout
    const layout = getLayout(photos.length);
    
    // Set canvas size
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    
    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvasSize, canvasSize);
    
    // Draw each photo
    for (let i = 0; i < photos.length; i++) {
        const pos = calculatePosition(i, layout, canvasSize, gap);
        await drawRoundedImage(ctx, photos[i].data, pos.x, pos.y, pos.width, pos.height, cornerRadius);
        
        // Draw time label (optional)
        const label = getMealTimeLabel(photos[i].timestamp);
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = '14px Inter, sans-serif';
        const labelWidth = ctx.measureText(label).width + 16;
        drawRoundedRect(ctx, pos.x + 8, pos.y + 8, labelWidth, 28, 8);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(label, pos.x + 16, pos.y + 26);
        ctx.restore();
    }
    
    console.log('✨ Collage generated successfully!');
}

// Make removePhoto function globally accessible
window.removePhoto = removePhoto;

// Download collage button handler
const downloadCollageBtn = document.getElementById('downloadCollageBtn');
if (downloadCollageBtn) {
    downloadCollageBtn.addEventListener('click', () => {
        const canvas = foodCollageCanvas;
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `food-collage-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        console.log('📥 Collage downloaded!');
    });
}

console.log('📸 Food photo upload functionality loaded!');

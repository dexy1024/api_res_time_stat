// 全局变量
let rawData = [];
let processedData = {};
let pieChart = null;
let isRendering = false; // 防止重复渲染

// 耗时区间定义
const timeRanges = [
    { label: '0-1000ms', min: 0, max: 1000 },
    { label: '1000-1500ms', min: 1000, max: 1500 },
    { label: '1500-2000ms', min: 1500, max: 2000 },
    { label: '2000-2500ms', min: 2000, max: 2500 },
    { label: '2500-3000ms', min: 2500, max: 3000 },
    { label: '3000-3500ms', min: 3000, max: 3500 },
    { label: '3500-5000ms', min: 3500, max: 5000 },
    { label: '5000ms以上', min: 5000, max: Infinity }
];

// 图表配色方案 - v1.14.0 更新
const chartColors = [
    '#667eea', '#764ba2', '#f093fb', '#f5576c',
    '#4facfe', '#00f2fe', '#43e97b', '#ff9800', '#ff4444'  // 5000ms以上使用红色
];

// 接口中文名称映射表
const apiChineseNames = {
    'koclodcabinet': 'KO冰柜',
    'keclodcabinet': '客户冰柜', 
    'aircabinet': '冷风柜',
    'shelf': '货架',
    'duanframe': '端架',
    'luodi': '落地架',
    'gua': '挂架',
    'cutbox': '割箱',
    'duiboxnum': '堆箱陈列箱数',
    'giftstackarea': '礼品地堆',
    'nogiftstackarea': '非礼品地堆'
};

// 强制清除缓存
console.log('API耗时统计工具 v1.11.0 - 配色已更新');
console.log('5000ms以上区间颜色:', chartColors[6]);

// DOM 元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileStatus = document.getElementById('fileStatus');
const clearBtn = document.getElementById('clearBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const stopBtn = document.getElementById('stopBtn');

// 初始化事件监听器
document.addEventListener('DOMContentLoaded', function() {
    showLoading();
    initializeEventListeners();
    
    // 简化加载检测，避免无限等待
    setTimeout(() => {
        console.log('页面加载完成，隐藏加载界面');
        hideLoading();
    }, 1500); // 减少等待时间到 1.5 秒
    
    // 全局禁用 Chart.js 动画
    if (typeof Chart !== 'undefined') {
        Chart.defaults.animation = false;
        Chart.defaults.animations = {
            colors: false,
            x: false,
            y: false
        };
        Chart.defaults.hover.animationDuration = 0;
        Chart.defaults.responsiveAnimationDuration = 0;
        
        // 注册 datalabels 插件
        if (typeof ChartDataLabels !== 'undefined') {
            Chart.register(ChartDataLabels);
            console.log('Chart.js datalabels 插件已注册');
        } else {
            console.warn('Chart.js datalabels 插件未加载，将使用简化版本');
        }
    }
});

// 显示加载状态
function showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
}

// 隐藏加载状态
function hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
}

// 检查资源是否加载完成
function checkResourcesLoaded() {
    let loadedCount = 0;
    const totalResources = 2; // Chart.js 和 SheetJS
    let timeoutId = null;
    
    function onResourceLoaded() {
        loadedCount++;
        console.log(`资源加载进度: ${loadedCount}/${totalResources}`);
        if (loadedCount >= totalResources) {
            if (timeoutId) clearTimeout(timeoutId);
            setTimeout(hideLoading, 200); // 减少延迟时间
        }
    }
    
    // 设置超时保护，最多等待 5 秒
    timeoutId = setTimeout(() => {
        console.warn('资源加载超时，强制隐藏加载界面');
        hideLoading();
    }, 5000);
    
    // 检查 Chart.js
    if (typeof Chart !== 'undefined') {
        console.log('Chart.js 已加载');
        onResourceLoaded();
    } else {
        // 如果 Chart.js 还没加载，等待一下再检查
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                console.log('Chart.js 延迟加载成功');
                onResourceLoaded();
            } else {
                console.warn('Chart.js 加载失败，强制继续');
                onResourceLoaded(); // 即使失败也继续
            }
        }, 1000);
    }
    
    // 检查 SheetJS
    if (typeof XLSX !== 'undefined') {
        console.log('SheetJS 已加载');
        onResourceLoaded();
    } else {
        setTimeout(() => {
            if (typeof XLSX !== 'undefined') {
                console.log('SheetJS 延迟加载成功');
                onResourceLoaded();
            } else {
                console.warn('SheetJS 加载失败，强制继续');
                onResourceLoaded(); // 即使失败也继续
            }
        }, 1000);
    }
}

function initializeEventListeners() {
    // 文件上传相关事件
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);
    clearBtn.addEventListener('click', clearFile);
    analyzeBtn.addEventListener('click', startAnalysis);
    stopBtn.addEventListener('click', stopRendering);

    // 防止默认拖拽行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDragOver(e) {
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// CSV 解析函数
function parseCSV(csvText) {
    const lines = csvText.split('\n');
    const result = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line) {
            // 简单的 CSV 解析，处理逗号分隔的值
            const values = line.split(',').map(value => value.trim().replace(/^["']|["']$/g, ''));
            result.push(values);
        }
    }
    
    return result;
}

// 解析耗时数据，处理带 "ms" 单位的情况
function parseTimeValue(timeStr) {
    if (!timeStr) return null;
    
    // 移除 "ms" 单位并转换为数字
    const cleanTime = timeStr.toString().replace(/ms$/i, '').trim();
    const timeValue = parseFloat(cleanTime);
    
    return isNaN(timeValue) ? null : timeValue;
}

// 开始分析函数
function startAnalysis() {
    if (rawData.length === 0) {
        showError('没有可分析的数据，请先上传文件');
        return;
    }
    
    // 显示加载状态
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '分析中...';
    stopBtn.style.display = 'inline-block';
    fileStatus.textContent = '正在分析数据...';
    
    // 延迟执行分析，让用户看到状态变化
    setTimeout(() => {
        try {
            // 处理数据并生成统计
            processData();
            updateSummary();
            renderCharts();
            renderTable();
            renderSlowApisTable();
            
            // 显示所有结果区域
            document.getElementById('summarySection').style.display = 'block';
            document.getElementById('chartsSection').style.display = 'block';
            document.getElementById('tableSection').style.display = 'block';
            
            // 更新按钮状态
            analyzeBtn.textContent = '重新分析';
            analyzeBtn.disabled = false;
            stopBtn.style.display = 'none';
            fileStatus.textContent = `分析完成，共 ${rawData.length} 条记录`;
            
        } catch (error) {
            console.error('分析数据时出错:', error);
            showError('分析数据时出错，请重试');
            analyzeBtn.textContent = '开始分析';
            analyzeBtn.disabled = false;
            fileStatus.textContent = '分析失败';
        }
    }, 500);
}

// 停止渲染函数
function stopRendering() {
    console.log('用户请求停止渲染');
    isRendering = false;
    
    // 强制销毁图表
    if (pieChart) {
        try {
            pieChart.destroy();
        } catch (e) {
            console.warn('销毁饼图时出错:', e);
        }
        pieChart = null;
    }
    
    // 清空画布
    const pieCanvas = document.getElementById('pieChart');
    if (pieCanvas) {
        const ctx = pieCanvas.getContext('2d');
        ctx.clearRect(0, 0, pieCanvas.width, pieCanvas.height);
    }
    
    // 隐藏停止按钮
    stopBtn.style.display = 'none';
    
    // 更新状态
    fileStatus.textContent = '渲染已停止';
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = '重新分析';
    
    console.log('渲染已停止');
}

function processFile(file) {
    // 验证文件类型
    const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/csv'
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        showError('请选择有效的文件 (.xlsx、.xls 或 .csv)');
        return;
    }

    // 显示文件信息
    fileName.textContent = file.name;
    fileStatus.textContent = '正在解析...';
    uploadArea.style.display = 'none';
    fileInfo.style.display = 'flex';

    // 根据文件类型选择解析方式
    const reader = new FileReader();
    
    if (file.name.toLowerCase().endsWith('.csv')) {
        // 解析 CSV 文件
        reader.onload = function(e) {
            try {
                const csvText = e.target.result;
                const jsonData = parseCSV(csvText);
                processExcelData(jsonData);
            } catch (error) {
                console.error('解析 CSV 文件时出错:', error);
                showError('解析 CSV 文件失败，请检查文件格式');
                fileStatus.textContent = '解析失败';
            }
        };
        reader.readAsText(file, 'UTF-8');
    } else {
        // 解析 Excel 文件
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                
                // 转换为 JSON 格式
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // 处理数据
                processExcelData(jsonData);
                
            } catch (error) {
                console.error('解析 Excel 文件时出错:', error);
                showError('解析 Excel 文件失败，请检查文件格式');
                fileStatus.textContent = '解析失败';
            }
        };
        reader.readAsArrayBuffer(file);
    }
}

function processExcelData(jsonData) {
    try {
        // 跳过空行和表头，找到数据开始行
        let dataStartRow = 0;
        for (let i = 0; i < jsonData.length; i++) {
            if (jsonData[i] && jsonData[i].length >= 2 && 
                jsonData[i][0] && jsonData[i][1] && 
                !isNaN(parseFloat(jsonData[i][1]))) {
                dataStartRow = i;
                break;
            }
        }

        // 提取数据
        rawData = [];
        for (let i = dataStartRow; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row && row.length >= 2 && row[0] && row[1]) {
                const apiName = String(row[0]).trim();
                // 使用新的解析函数处理耗时数据，支持带 "ms" 单位
                const timeValue = parseTimeValue(row[1]);
                
                if (apiName && timeValue !== null && timeValue >= 0) {
                    rawData.push({
                        apiName: apiName,
                        time: timeValue
                    });
                }
            }
        }

        if (rawData.length === 0) {
            showError('未找到有效的数据，请检查文件格式');
            fileStatus.textContent = '无有效数据';
            return;
        }

        // 只解析数据，不立即计算
        fileStatus.textContent = `解析成功，共 ${rawData.length} 条记录，点击"开始分析"按钮进行分析`;
        
        // 启用分析按钮
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '开始分析';

    } catch (error) {
        console.error('处理数据时出错:', error);
        showError('处理数据时出错，请检查文件内容');
        fileStatus.textContent = '处理失败';
    }
}

function processData() {
    // 按接口名称分组统计
    processedData = {};
    
    rawData.forEach(item => {
        if (!processedData[item.apiName]) {
            processedData[item.apiName] = {
                times: [],
                count: 0,
                totalTime: 0,
                minTime: Infinity,
                maxTime: 0
            };
        }
        
        const stats = processedData[item.apiName];
        stats.times.push(item.time);
        stats.count++;
        stats.totalTime += item.time;
        stats.minTime = Math.min(stats.minTime, item.time);
        stats.maxTime = Math.max(stats.maxTime, item.time);
    });

    // 计算平均值
    Object.keys(processedData).forEach(apiName => {
        const stats = processedData[apiName];
        stats.avgTime = stats.totalTime / stats.count;
    });
}

function updateSummary() {
    const totalCalls = rawData.length;
    const allTimes = rawData.map(item => item.time);
    const avgTime = allTimes.reduce((sum, time) => sum + time, 0) / totalCalls;
    const maxTime = Math.max(...allTimes);
    const minTime = Math.min(...allTimes);

    document.getElementById('totalCalls').textContent = totalCalls.toLocaleString();
    document.getElementById('avgTime').textContent = Math.round(avgTime) + 'ms';
    document.getElementById('maxTime').textContent = Math.round(maxTime) + 'ms';
    document.getElementById('minTime').textContent = Math.round(minTime) + 'ms';
}

function renderCharts() {
    // 防止重复渲染
    if (isRendering) {
        console.log('图表正在渲染中，跳过重复渲染');
        return;
    }
    
    isRendering = true;
    console.log('开始渲染图表...');
    
        try {
            // 计算耗时分布
            const distribution = calculateTimeDistribution();
            console.log('耗时分布计算完成:', distribution);
            
            // 渲染饼图
            renderPieChart(distribution);
            console.log('饼图渲染完成');
            
            // 渲染耗时分布表格
            renderDistributionTable(distribution);
            console.log('耗时分布表格渲染完成');
        
    } catch (error) {
        console.error('渲染图表时出错:', error);
    } finally {
        isRendering = false;
        console.log('图表渲染完成');
    }
}

function calculateTimeDistribution() {
    const distribution = {};
    
    // 初始化各区间的计数
    timeRanges.forEach(range => {
        distribution[range.label] = 0;
    });
    
    // 统计各区间的数据量
    rawData.forEach(item => {
        const time = item.time;
        for (const range of timeRanges) {
            if (time >= range.min && time < range.max) {
                distribution[range.label]++;
                break;
            }
        }
    });
    
    return distribution;
}


function renderPieChart(distribution) {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    // 销毁现有图表
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    
    const labels = Object.keys(distribution);
    const data = Object.values(distribution);
    
    // 检查数据有效性
    if (data.length === 0 || data.every(val => val === 0)) {
        console.warn('饼图数据为空或全为0，跳过渲染');
        return;
    }
    
    // 添加调试信息
    console.log('渲染饼图，数据:', distribution);
    console.log('标签:', labels);
    console.log('数值:', data);
    console.log('datalabels 插件可用:', typeof ChartDataLabels !== 'undefined');
    
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: chartColors.slice(0, labels.length),
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        maxWidth: 300,
                        boxWidth: 15,
                        font: {
                            size: 14
                        }
                    }
                },
                // 在饼图上显示占比（如果插件可用）
                ...(typeof ChartDataLabels !== 'undefined' ? {
                    datalabels: {
                        display: true,
                        color: '#fff',
                        font: {
                            size: 16,
                            weight: 'bold'
                        },
                        formatter: function(value, context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return percentage + '%';
                        }
                    }
                } : {}),
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return context.label + ': ' + context.parsed + ' (' + percentage + '%)';
                        }
                    }
                }
            },
            // 禁用动画，避免图表一直变化
            animation: {
                duration: 0
            },
            // 禁用悬停动画
            hover: {
                animationDuration: 0
            },
            // 禁用响应式动画
            responsiveAnimationDuration: 0
        }
    });
}

function renderDistributionTable(distribution) {
    const tableBody = document.getElementById('distributionTableBody');
    const tableSection = document.getElementById('distributionTableSection');
    
    if (!tableBody || !tableSection) {
        console.error('分布表格元素未找到');
        return;
    }
    
    tableBody.innerHTML = '';
    
    // 计算总数
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    // 按区间顺序渲染
    timeRanges.forEach((range, index) => {
        const count = distribution[range.label] || 0;
        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
        const color = chartColors[index];
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${range.label}</td>
            <td>${count}</td>
            <td>${percentage}%</td>
            <td>
                <span class="color-indicator" style="background-color: ${color};"></span>
                ${color}
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    tableSection.style.display = 'block';
    console.log('耗时分布表格渲染完成');
}

function renderTable() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    // 按接口名称排序
    const sortedApis = Object.keys(processedData).sort();
    
    sortedApis.forEach(apiName => {
        const stats = processedData[apiName];
        const chineseName = apiChineseNames[apiName] || apiName; // 获取中文名称，如果没有映射则使用原名
        const count = stats.count || 0; // 获取接口调用数量
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${apiName}</td>
            <td>${chineseName}</td>
            <td>${count}</td>
            <td>${Math.round(stats.avgTime)}</td>
            <td>${Math.round(stats.maxTime)}</td>
            <td>${Math.round(stats.minTime)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// 渲染5000ms以上接口统计表
function renderSlowApisTable() {
    const tableBody = document.getElementById('slowTableBody');
    const tableSection = document.getElementById('slowTableSection');
    if (!tableBody || !tableSection) {
        console.error('慢接口统计表元素未找到');
        return;
    }
    tableBody.innerHTML = '';

    // 统计超过5000ms的接口调用次数
    const slowCounts = {};
    rawData.forEach(item => {
        if (item.time >= 5000) {
            slowCounts[item.apiName] = (slowCounts[item.apiName] || 0) + 1;
        }
    });

    const entries = Object.entries(slowCounts)
        .sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        tableSection.style.display = 'none';
        return;
    }

    entries.forEach(([apiName, count]) => {
        const row = document.createElement('tr');
        const chineseName = apiChineseNames[apiName] || apiName;
        row.innerHTML = `
            <td>${apiName}</td>
            <td>${chineseName}</td>
            <td>${count}</td>
        `;
        tableBody.appendChild(row);
    });

    tableSection.style.display = 'block';
}

// 表格排序功能
let sortDirection = {};

function sortTable(columnIndex) {
    const tbody = document.getElementById('tableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));
    
    // 切换排序方向
    sortDirection[columnIndex] = !sortDirection[columnIndex];
    
    rows.sort((a, b) => {
        let aValue, bValue;
        
        if (columnIndex === 0 || columnIndex === 1) {
            // 按接口名称或中文名称排序（字符串）
            aValue = a.cells[columnIndex].textContent;
            bValue = b.cells[columnIndex].textContent;
        } else {
            // 按数值排序（数量、耗时相关列）
            aValue = parseFloat(a.cells[columnIndex].textContent);
            bValue = parseFloat(b.cells[columnIndex].textContent);
        }
        
        if (sortDirection[columnIndex]) {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    // 重新插入排序后的行
    rows.forEach(row => tbody.appendChild(row));
}

function clearFile() {
    // 重置所有数据
    rawData = [];
    processedData = {};
    
    // 停止渲染
    isRendering = false;
    
    // 隐藏结果区域
    document.getElementById('summarySection').style.display = 'none';
    document.getElementById('chartsSection').style.display = 'none';
    document.getElementById('tableSection').style.display = 'none';
    const slowTableSection = document.getElementById('slowTableSection');
    if (slowTableSection) slowTableSection.style.display = 'none';
    
    // 重置上传区域
    uploadArea.style.display = 'block';
    fileInfo.style.display = 'none';
    fileInput.value = '';
    
    // 重置分析按钮
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '开始分析';
    
    // 销毁图表
    if (pieChart) {
        pieChart.destroy();
        pieChart = null;
    }
    
    console.log('文件已清除，所有数据已重置');
}

function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');
    
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
    
    // 3秒后自动隐藏
    setTimeout(() => {
        hideError();
    }, 3000);
}

function hideError() {
    document.getElementById('errorMessage').style.display = 'none';
}

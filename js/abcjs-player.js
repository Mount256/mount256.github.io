// Butterfly主题abcjs播放器 - 最终API兼容版
window.initAbcjsPlayer = function() {
    // 查找所有未初始化的乐谱元素
    const scoreElements = document.querySelectorAll('.abcjs-score:not(.abcjs-initialized)');
    
    scoreElements.forEach((element, index) => {
        // 标记为已初始化，避免重复渲染
        element.classList.add('abcjs-initialized');
        
        const abcText = element.textContent.trim();
        const containerId = `abcjs-score-${Date.now()}-${index}`;
        
        // 创建包装容器
        const wrapper = document.createElement('div');
        wrapper.className = 'abcjs-wrapper';
        wrapper.style.margin = '20px 0';
        wrapper.style.padding = '20px';
        wrapper.style.background = 'var(--card-bg)';
        wrapper.style.borderRadius = '8px';
        wrapper.style.boxShadow = 'var(--box-shadow)';
        
        // 创建播放控制栏
        const controls = document.createElement('div');
        controls.className = 'abcjs-controls';
        controls.style.marginBottom = '15px';
        controls.style.display = 'flex';
        controls.style.gap = '10px';
        controls.style.alignItems = 'center';
        controls.style.flexWrap = 'wrap';
        
        // 播放按钮
        const playBtn = document.createElement('button');
        playBtn.textContent = '播放';
        playBtn.className = 'btn';
        playBtn.style.background = 'var(--btn-bg)';
        playBtn.style.color = 'var(--btn-color)';
        playBtn.style.border = 'none';
        playBtn.style.padding = '6px 12px';
        playBtn.style.borderRadius = '4px';
        playBtn.style.cursor = 'pointer';
        
        // 暂停按钮
        const pauseBtn = document.createElement('button');
        pauseBtn.textContent = '暂停';
        pauseBtn.className = 'btn';
        pauseBtn.style.background = 'var(--btn-bg)';
        pauseBtn.style.color = 'var(--btn-color)';
        pauseBtn.style.border = 'none';
        pauseBtn.style.padding = '6px 12px';
        pauseBtn.style.borderRadius = '4px';
        pauseBtn.style.cursor = 'pointer';
        pauseBtn.disabled = true;
        
        // 停止按钮
        const stopBtn = document.createElement('button');
        stopBtn.textContent = '停止';
        stopBtn.className = 'btn';
        stopBtn.style.background = 'var(--btn-bg)';
        stopBtn.style.color = 'var(--btn-color)';
        stopBtn.style.border = 'none';
        stopBtn.style.padding = '6px 12px';
        stopBtn.style.borderRadius = '4px';
        stopBtn.style.cursor = 'pointer';
        stopBtn.disabled = true;
        
        // 速度控制
        const speedControl = document.createElement('div');
        speedControl.style.display = 'flex';
        speedControl.style.alignItems = 'center';
        speedControl.style.gap = '8px';
        speedControl.style.marginLeft = 'auto';
        
        const speedLabel = document.createElement('span');
        speedLabel.textContent = '速度:';
        speedLabel.style.fontSize = '14px';
        speedLabel.style.color = 'var(--text-color)';
        
        const speedSlider = document.createElement('input');
        speedSlider.type = 'range';
        speedSlider.min = 60;
        speedSlider.max = 200;
        speedSlider.value = 120;
        speedSlider.style.width = '100px';
        
        const speedValue = document.createElement('span');
        speedValue.textContent = '120 BPM';
        speedValue.style.fontSize = '14px';
        speedValue.style.color = 'var(--text-color)';
        speedValue.style.minWidth = '60px';
        
        speedControl.appendChild(speedLabel);
        speedControl.appendChild(speedSlider);
        speedControl.appendChild(speedValue);
        
        // 进度条容器
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '100%';
        progressContainer.style.margin = '15px 0';
        progressContainer.style.display = 'flex';
        progressContainer.style.alignItems = 'center';
        progressContainer.style.gap = '10px';
        
        // 当前时间显示
        const currentTime = document.createElement('span');
        currentTime.textContent = '0:00';
        currentTime.style.fontSize = '14px';
        currentTime.style.color = 'var(--text-color)';
        currentTime.style.minWidth = '40px';
        currentTime.style.textAlign = 'right';
        
        // 进度条背景
        const progressBar = document.createElement('div');
        progressBar.style.flex = '1';
        progressBar.style.height = '6px';
        progressBar.style.background = 'var(--border-color)';
        progressBar.style.borderRadius = '3px';
        progressBar.style.cursor = 'pointer';
        progressBar.style.overflow = 'hidden';
        
        // 进度条填充
        const progressFill = document.createElement('div');
        progressFill.style.height = '100%';
        progressFill.style.width = '0%';
        progressFill.style.background = 'var(--btn-bg)';
        progressFill.style.borderRadius = '3px';
        progressFill.style.transition = 'width 0.1s linear';
        
        progressBar.appendChild(progressFill);
        
        // 总时间显示
        const totalTime = document.createElement('span');
        totalTime.textContent = '0:00';
        totalTime.style.fontSize = '14px';
        totalTime.style.color = 'var(--text-color)';
        totalTime.style.minWidth = '40px';
        
        progressContainer.appendChild(currentTime);
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(totalTime);
        
        // 添加所有元素到控制栏
        controls.appendChild(playBtn);
        controls.appendChild(pauseBtn);
        controls.appendChild(stopBtn);
        controls.appendChild(speedControl);
        
        // 创建乐谱容器
        const scoreContainer = document.createElement('div');
        scoreContainer.id = containerId;
        
        // 组装所有元素
        wrapper.appendChild(controls);
        wrapper.appendChild(progressContainer);
        wrapper.appendChild(scoreContainer);
        element.parentNode.replaceChild(wrapper, element);
        
        // 全局变量
        let synthControl;
        let visualObj;
        let audioInitialized = false;
        let totalDuration = 0;
        let currentPosition = 0; // 毫秒
        let isPlaying = false;
        
        // 格式化时间（秒 -> 分:秒）
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        
        // 更新进度条显示
        function updateProgressDisplay() {
            const progress = currentPosition / totalDuration;
            progressFill.style.width = `${progress * 100}%`;
            currentTime.textContent = formatTime(currentPosition / 1000);
        }
        
        // 渲染乐谱
        function renderScore() {
            const options = {
                responsive: "resize",
                staffwidth: Math.min(700, wrapper.offsetWidth - 40),
                add_classes: true,
                scale: 1.1,
                clickListener: function(abcElem) {
                    if (synthControl && audioInitialized) {
                        synthControl.seek(abcElem.startChar);
                        currentPosition = abcElem.startTime;
                        updateProgressDisplay();
                    }
                }
            };
            
            visualObj = ABCJS.renderAbc(containerId, abcText, options)[0];
            
            // 计算总时长（毫秒）- 这是官方文档中明确支持的API
            totalDuration = visualObj.getTotalTime();
            totalTime.textContent = formatTime(totalDuration / 1000);
        }
        
        // 初始化音频
        async function initAudio() {
            if (audioInitialized) return true;
            
            try {
                const playerContainer = document.createElement('div');
                playerContainer.style.display = 'none';
                wrapper.appendChild(playerContainer);
                
                synthControl = new ABCJS.synth.SynthController();
                
                synthControl.load(playerContainer, null, {
                    displayLoop: false,
                    displayRestart: false,
                    displayPlay: false,
                    displayProgress: false,
                    displayWarp: false,
                    qpm: parseInt(speedSlider.value)
                });
                
                await synthControl.setTune(visualObj, false, {
                    // 关键修复：使用官方唯一支持的onEvent回调跟踪进度
                    onEvent: function(ev) {
                        if (ev.measureStart && ev.left === null) return;
                        
                        // 清除之前的高亮
                        document.querySelectorAll(`#${containerId} .abcjs-note-highlight`).forEach(el => {
                            el.classList.remove('abcjs-note-highlight');
                        });
                        
                        // 高亮当前音符并更新进度
                        if (ev.elements && ev.startTime !== undefined) {
                            currentPosition = ev.startTime;
                            updateProgressDisplay();
                            
                            ev.elements.forEach(el => {
                                el.classList.add('abcjs-note-highlight');
                            });
                        }
                    },
                    // 播放结束回调
                    onEnded: function() {
                        isPlaying = false;
                        currentPosition = totalDuration;
                        updateProgressDisplay();
                        
                        playBtn.disabled = false;
                        pauseBtn.disabled = true;
                        stopBtn.disabled = true;
                    }
                });
                
                audioInitialized = true;
                return true;
            } catch (error) {
                console.error('音频初始化失败:', error);
                alert('音频初始化失败，请刷新页面后重试');
                return false;
            }
        }
        
        // 播放按钮事件
        playBtn.addEventListener('click', async function() {
            if (!audioInitialized) {
                const success = await initAudio();
                if (!success) return;
            }
            
            // 如果已经播放到末尾，从头开始
            if (currentPosition >= totalDuration) {
                currentPosition = 0;
                synthControl.seek(0);
            }
            
            synthControl.play();
            isPlaying = true;
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        });
        
        // 暂停按钮事件
        pauseBtn.addEventListener('click', function() {
            synthControl.pause();
            isPlaying = false;
            playBtn.disabled = false;
            pauseBtn.disabled = true;
        });
        
        // 停止按钮事件
        stopBtn.addEventListener('click', function() {
            synthControl.stop();
            isPlaying = false;
            currentPosition = 0;
            updateProgressDisplay();
            
            playBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
            
            // 清除所有高亮
            document.querySelectorAll(`#${containerId} .abcjs-note-highlight`).forEach(el => {
                el.classList.remove('abcjs-note-highlight');
            });
        });
        
        // 速度滑块事件
        speedSlider.addEventListener('input', function() {
            const speed = parseInt(this.value);
            speedValue.textContent = speed + ' BPM';
            if (synthControl && audioInitialized) {
                synthControl.setQpm(speed);
            }
        });
        
        // 进度条点击跳转事件
        progressBar.addEventListener('click', function(e) {
            if (!synthControl || !audioInitialized) return;
            
            const rect = progressBar.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progress = clickX / rect.width;
            
            // 跳转到对应位置
            currentPosition = progress * totalDuration;
            synthControl.seek(currentPosition);
            updateProgressDisplay();
        });
        
        // 渲染乐谱
        renderScore();
        
        // 监听深色模式切换
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', renderScore);
        }
    });
    
    // 添加全局CSS样式（只添加一次）
    if (!document.getElementById('abcjs-global-style')) {
        const style = document.createElement('style');
        style.id = 'abcjs-global-style';
        style.textContent = `
            .abcjs-note-highlight {
                fill: #ff4444 !important;
                stroke: #ff4444 !important;
            }
            .abcjs-staff-line {
                stroke: var(--text-color-secondary) !important;
            }
            .abcjs-note {
                fill: var(--text-color) !important;
            }
            .abcjs-clef, .abcjs-time-signature, .abcjs-key-signature {
                fill: var(--text-color) !important;
                stroke: var(--text-color) !important;
            }
            .abcjs-controls .btn:hover {
                filter: brightness(0.9);
            }
            .abcjs-controls .btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
};

// 脚本加载完成后立即执行一次
window.initAbcjsPlayer();

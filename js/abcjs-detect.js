// Butterfly主题abcjs按需加载器 - 兼容PJAX
let abcjsLoaded = false;

// 初始化函数（页面加载和PJAX跳转都会调用）
function initAbcjs() {
    // 检查页面上是否有乐谱元素
    const hasScores = document.querySelectorAll('.abcjs-score').length > 0;
    
    if (hasScores && !abcjsLoaded) {
        // 动态加载CSS
        const abcjsStyle = document.createElement('link');
        abcjsStyle.rel = 'stylesheet';
        abcjsStyle.href = 'https://cdn.jsdelivr.net/npm/abcjs@6.6.3/abcjs-audio.min.css';
        document.head.appendChild(abcjsStyle);
        
        // 动态加载abcjs库
        const abcjsScript = document.createElement('script');
        abcjsScript.src = 'https://cdn.jsdelivr.net/npm/abcjs@6.6.3/dist/abcjs-basic-min.min.js';
        abcjsScript.onload = function() {
            abcjsLoaded = true;
            // 加载播放器脚本
            const playerScript = document.createElement('script');
            playerScript.src = '/js/abcjs-player.js';
            document.body.appendChild(playerScript);
        };
        document.body.appendChild(abcjsScript);
    } else if (hasScores && abcjsLoaded) {
        // 如果abcjs已经加载过，直接调用播放器初始化
        if (window.initAbcjsPlayer) {
            window.initAbcjsPlayer();
        }
    }
}

// 页面首次加载时执行
document.addEventListener('DOMContentLoaded', initAbcjs);

// 关键修复：监听Butterfly主题的PJAX完成事件
document.addEventListener('pjax:complete', initAbcjs);

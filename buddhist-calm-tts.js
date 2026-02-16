/**
 * BuddhaMeet 語音朗讀系統
 * 優雅的佛教心靈語音朗讀 - 靈感來自 Calm.com
 * 完美整合您現有的美麗 SVG 按鈕設計
 */

class BuddhistTTSReader {
    constructor() {
        this.utterance = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentVoice = null;
        this.settings = {
            rate: 0.75,      // 緩緩的語速，適合心靈內容
            pitch: 1.0,      // 自然音調
            volume: 0.9      // 柔和音量
        };
        
        this.init();
    }
    
    init() {
        // 載入語音列表
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = () => this.loadVoices();
        }
        this.loadVoices();
    }
    
    loadVoices() {
        const voices = speechSynthesis.getVoices();
        
        // 優先選擇高品質的繁體中文語音
        const priorities = [
            'zh-TW',  // 台灣繁體
            'zh-HK',  // 香港粵語
            'zh-CN',  // 簡體中文
            'zh'      // 通用中文
        ];
        
        for (let lang of priorities) {
            const voice = voices.find(v => v.lang.includes(lang));
            if (voice) {
                this.currentVoice = voice;
                console.log('✓ 已選擇語音:', voice.name, voice.lang);
                break;
            }
        }
        
        // 如果找不到，使用第一個中文語音
        if (!this.currentVoice) {
            this.currentVoice = voices.find(v => 
                v.lang.toLowerCase().includes('zh') || 
                v.lang.toLowerCase().includes('chinese')
            );
        }
    }
    
    /**
     * 朗讀指定的文字內容
     * @param {string} selector - CSS 選擇器，指定要朗讀的區域
     */
    readContent(selector = '.texts') {
        // 如果正在播放，則停止
        if (this.isPlaying) {
            this.stop();
            return;
        }
        
        // 獲取要朗讀的文字
        const contentElement = document.querySelector(selector);
        if (!contentElement) {
            console.error('找不到要朗讀的內容區域:', selector);
            return;
        }
        
        // 提取純文字（排除 HTML 標籤）
        let text = contentElement.innerText || contentElement.textContent;
        
        // 清理文字：移除多餘空白和換行
        text = text.trim()
                   .replace(/\s+/g, ' ')
                   .replace(/\n+/g, '。 ');
        
        if (!text) {
            console.error('沒有找到可朗讀的文字');
            return;
        }
        
        // 創建語音實例
        this.utterance = new SpeechSynthesisUtterance(text);
        
        // 設定語音參數
        if (this.currentVoice) {
            this.utterance.voice = this.currentVoice;
        }
        this.utterance.lang = 'zh-TW';
        this.utterance.rate = this.settings.rate;
        this.utterance.pitch = this.settings.pitch;
        this.utterance.volume = this.settings.volume;
        
        // 設定事件監聽
        this.utterance.onstart = () => {
            this.isPlaying = true;
            this.isPaused = false;
            this.updateButton('playing');
            console.log('🔊 開始朗讀...');
        };
        
        this.utterance.onend = () => {
            this.isPlaying = false;
            this.isPaused = false;
            this.updateButton('stopped');
            console.log('✓ 朗讀完成');
        };
        
        this.utterance.onerror = (event) => {
            console.error('朗讀錯誤:', event.error);
            this.isPlaying = false;
            this.updateButton('error');
        };
        
        // 開始朗讀
        speechSynthesis.speak(this.utterance);
    }
    
    /**
     * 暫停朗讀
     */
    pause() {
        if (this.isPlaying && !this.isPaused) {
            speechSynthesis.pause();
            this.isPaused = true;
            this.updateButton('paused');
            console.log('⏸ 已暫停');
        }
    }
    
    /**
     * 繼續朗讀
     */
    resume() {
        if (this.isPaused) {
            speechSynthesis.resume();
            this.isPaused = false;
            this.updateButton('playing');
            console.log('▶ 繼續朗讀');
        }
    }
    
    /**
     * 停止朗讀
     */
    stop() {
        speechSynthesis.cancel();
        this.isPlaying = false;
        this.isPaused = false;
        this.updateButton('stopped');
        console.log('⏹ 已停止');
    }
    
    /**
     * 更新按鈕顯示狀態
     * @param {string} state - 'playing', 'paused', 'stopped', 'error'
     */
    updateButton(state) {
        // 找到您的 tabbar 按鈕
        const button = document.querySelector('.tabbar a.current1');
        if (!button) return;
        
        // 根據狀態更新按鈕文字
        switch(state) {
            case 'playing':
                button.textContent = '⏸ 暫停聆聽';
                button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                break;
            case 'paused':
                button.textContent = '▶ 繼續聆聽';
                button.style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
                break;
            case 'stopped':
                button.textContent = '再一次聆聽';
                button.style.background = '';
                break;
            case 'error':
                button.textContent = '⚠️ 播放錯誤';
                setTimeout(() => this.updateButton('stopped'), 2000);
                break;
        }
    }
    
    /**
     * 設定朗讀速度
     * @param {number} rate - 0.5 到 2.0，建議心靈內容用 0.7-0.85
     */
    setRate(rate) {
        this.settings.rate = Math.max(0.5, Math.min(2.0, rate));
        if (this.utterance) {
            this.utterance.rate = this.settings.rate;
        }
    }
    
    /**
     * 設定音調
     * @param {number} pitch - 0.5 到 2.0
     */
    setPitch(pitch) {
        this.settings.pitch = Math.max(0.5, Math.min(2.0, pitch));
        if (this.utterance) {
            this.utterance.pitch = this.settings.pitch;
        }
    }
    
    /**
     * 設定音量
     * @param {number} volume - 0 到 1
     */
    setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(1, volume));
        if (this.utterance) {
            this.utterance.volume = this.settings.volume;
        }
    }
}

// 全局實例
let buddhistReader = null;

/**
 * 初始化語音朗讀系統
 * 在頁面載入完成後調用
 */
function initBuddhistTTS() {
    // 創建語音朗讀器實例
    buddhistReader = new BuddhistTTSReader();
    
    // 綁定您現有的按鈕
    const playButton = document.querySelector('.tabbar a.current1');
    if (playButton) {
        playButton.onclick = function(e) {
            e.preventDefault();
            buddhistReader.readContent('.texts');
        };
    }
    
    console.log('✓ BuddhaMeet 語音朗讀系統已就緒');
}

/**
 * 便捷函數：直接朗讀指定區域
 * @param {string} selector - CSS 選擇器
 */
function speak(selector = '.texts') {
    if (buddhistReader) {
        buddhistReader.readContent(selector);
    }
}

/**
 * 便捷函數：停止朗讀
 */
function stopReading() {
    if (buddhistReader) {
        buddhistReader.stop();
    }
}

/**
 * 便捷函數：暫停朗讀
 */
function pauseReading() {
    if (buddhistReader) {
        buddhistReader.pause();
    }
}

/**
 * 便捷函數：繼續朗讀
 */
function resumeReading() {
    if (buddhistReader) {
        buddhistReader.resume();
    }
}

// 頁面載入完成後自動初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBuddhistTTS);
} else {
    initBuddhistTTS();
}

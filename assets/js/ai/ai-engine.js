/**
 * ArcAIEngine - موتور هوش مصنوعی چندمنبعی آرکا
 * نسخه ایمن شده برای GitHub
 * تاریخ: 2024
 */

class ArcAIEngine {
  constructor() {
    this.apiKeys = {
      gemini: '',
      openai: '',
      telegram: ''
    };
    
    this.apiUrls = {
      gemini: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent',
      openai: 'https://api.openai.com/v1/chat/completions',
      telegram: 'https://api.telegram.org/bot'
    };
    
    this.conversationHistory = [];
    this.isProcessing = false;
    this.suggestionEngine = null;
    this.nlpProcessor = null;
    this.responseAnalyzer = null;
    this.cachedKnowledge = new Map();
    this.demoMode = true;
    this.security = {
      maxApiKeyLength: 100,
      allowedChars: /^[a-zA-Z0-9_\-\.]+$/,
      rateLimit: 5 // درخواست در دقیقه
    };
    
    this.init();
  }

  init() {
    this.suggestionEngine = new AutoSuggestEngine();
    this.nlpProcessor = new NLPProcessor();
    this.loadApiKeys();
    this.setupEventListeners();
    this.startBackgroundMonitoring();
    this.initializeKnowledgeBase();
    console.log('✅ AI Engine initialized with multi-engine capability');
    this.showEnhancedWelcomeMessage();
  }

  loadApiKeys() {
    try {
      this.apiKeys.gemini = this.sanitizeApiKey(localStorage.getItem('arka_gemini_api_key') || '');
      this.apiKeys.openai = this.sanitizeApiKey(localStorage.getItem('arka_openai_api_key') || '');
      this.apiKeys.telegram = this.sanitizeApiKey(localStorage.getItem('arka_telegram_bot_token') || '');
      
      // بررسی امنیتی کلیدها
      this.validateApiKeys();
      
      if (!this.apiKeys.gemini && !this.apiKeys.openai && !this.apiKeys.telegram) {
        console.log('ℹ️ No API keys found. Running in demo mode with simulated responses.');
        this.demoMode = true;
      } else {
        this.demoMode = false;
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      this.demoMode = true;
    }
  }

  sanitizeApiKey(key) {
    if (!key) return '';
    
    // حذف فضاهای اضافه
    key = key.trim();
    
    // بررسی طول کلید
    if (key.length > this.security.maxApiKeyLength) {
      console.warn('⚠️ API key too long, truncating');
      key = key.substring(0, this.security.maxApiKeyLength);
    }
    
    // بررسی کاراکترهای مجاز
    if (!this.security.allowedChars.test(key)) {
      console.warn('⚠️ Invalid characters in API key');
      return '';
    }
    
    return key;
  }

  validateApiKeys() {
    // لیست الگوهای کلیدهای لو رفته شناخته شده
    const leakedKeyPatterns = [
      'AL2a5yC9XKLw',
      'AIzaSyC9XkLw1B9Q8y6zZ5X5X5X5X5X5X5X5X5X',
      'sk-1234567890abcdef'
    ];
    
    for (const [provider, key] of Object.entries(this.apiKeys)) {
      if (!key) continue;
      
      for (const pattern of leakedKeyPatterns) {
        if (key.includes(pattern)) {
          console.warn(`⚠️ Potential leaked API key detected for ${provider}`);
          localStorage.removeItem(`arka_${provider}_api_key`);
          this.apiKeys[provider] = '';
          this.showSecurityWarning(provider);
          break;
        }
      }
    }
  }

  showSecurityWarning(provider) {
    const warning = document.createElement('div');
    warning.className = 'security-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <i class="fas fa-shield-alt"></i>
        <span>کلید API ${provider} شناسایی شده ممکن است ناامن باشد. لطفاً کلید جدیدی وارد کنید.</span>
        <button class="close-warning">&times;</button>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    warning.querySelector('.close-warning').addEventListener('click', () => {
      warning.remove();
    });
    
    setTimeout(() => warning.remove(), 10000);
  }

  setupEventListeners() {
    const aiSubmit = document.getElementById('ai-submit');
    const aiInput = document.getElementById('ai-input');
    
    if (aiSubmit && aiInput) {
      aiSubmit.addEventListener('click', () => this.handleUserQuery());
      aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.handleUserQuery();
      });
      
      document.querySelectorAll('.suggestion-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          aiInput.value = chip.dataset.query;
          this.handleUserQuery();
        });
      });
    }
    
    const configBtn = document.getElementById('ai-config-btn');
    if (configBtn) {
      configBtn.addEventListener('click', () => this.showApiKeyConfigModal());
    }
  }

  async handleUserQuery() {
    if (this.isProcessing) return;
    
    const inputElement = document.getElementById('ai-input');
    const query = inputElement.value.trim();
    
    if (!query) {
      this.showError('لطفاً سؤال خود را وارد کنید');
      return;
    }
    
    // بررسی نرخ درخواست
    if (!this.checkRateLimit()) {
      this.showError('تعداد درخواست‌ها زیاد است. لطفاً کمی صبر کنید');
      return;
    }
    
    this.isProcessing = true;
    inputElement.disabled = true;
    
    window.arcUtils?.trackEvent('AI', 'Query', query.substring(0, 50));
    
    try {
      this.showLoadingState();
      this.showThinkingAnimation();
      
      const systemContext = await this.getSystemContext();
      const processedQuery = this.nlpProcessor.processQuery(query);
      
      const cachedResponse = this.checkKnowledgeBase(processedQuery);
      if (cachedResponse) {
        this.displayResponse(cachedResponse);
        this.addToHistory('user', query);
        this.addToHistory('assistant', cachedResponse);
        this.getSuggestions(query, cachedResponse);
        return;
      }
      
      const responses = await this.getMultiEngineResponse(processedQuery, systemContext);
      const finalResponse = this.analyzeAndSynthesizeResponses(responses, systemContext);
      
      this.displayResponse(finalResponse);
      this.addToHistory('user', query);
      this.addToHistory('assistant', finalResponse);
      this.getSuggestions(query, finalResponse);
      this.updateKnowledgeBase(processedQuery, finalResponse);
      
    } catch (error) {
      console.error('AI Error:', error);
      this.showError(`خطا در ارتباط با هوش مصنوعی: ${error.message}`);
    } finally {
      this.isProcessing = false;
      inputElement.disabled = false;
      inputElement.value = '';
      inputElement.focus();
      this.hideThinkingAnimation();
    }
  }

  checkRateLimit() {
    const now = Date.now();
    const minuteAgo = now - 60000;
    
    // فیلتر درخواست‌های قدیمی
    this.conversationHistory = this.conversationHistory.filter(msg => 
      msg.timestamp > minuteAgo
    );
    
    // بررسی تعداد درخواست‌ها
    const userRequests = this.conversationHistory.filter(msg => 
      msg.role === 'user' && msg.timestamp > minuteAgo
    );
    
    return userRequests.length < this.security.rateLimit;
  }

  async getSystemContext() {
    // اطلاعات سیستم - در حالت واقعی باید از API سیستم گرفته شود
    return {
      os: 'Windows',
      osVersion: '10+',
      architecture: 'x64',
      diskSpace: 100,
      isAdmin: false,
      cpuTemp: 45,
      cpuUsage: 35,
      memoryUsage: 65,
      networkStatus: true,
      ramTotal: '8GB+',
      diskTotal: '256GB+'
    };
  }

  async getMultiEngineResponse(query, systemContext) {
    const responses = {
      gemini: null,
      openai: null,
      local: null
    };
    
    const enginePromises = [];
    
    if (this.apiKeys.gemini && !this.demoMode) {
      enginePromises.push(
        this.getGeminiResponse(query, systemContext)
          .then(response => responses.gemini = response)
          .catch(error => console.warn('Gemini failed:', error.message))
      );
    }
    
    if (this.apiKeys.openai && !this.demoMode) {
      enginePromises.push(
        this.getOpenAIResponse(query, systemContext)
          .then(response => responses.openai = response)
          .catch(error => console.warn('OpenAI failed:', error.message))
      );
    }
    
    // همیشه تحلیل محلی را اجرا کن
    enginePromises.push(
      this.getLocalAnalysis(query, systemContext)
        .then(response => responses.local = response)
        .catch(error => console.warn('Local analysis failed:', error.message))
    );
    
    await Promise.all(enginePromises);
    return responses;
  }

  async getGeminiResponse(query, systemContext) {
    if (this.demoMode) {
      return this.simulateGeminiResponse(query, systemContext);
    }
    
    const response = await fetch(`${this.apiUrls.gemini}?key=${this.apiKeys.gemini}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: this.buildGeminiPrompt(query, systemContext) }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2000
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'خطا در دریافت پاسخ');
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'پاسخی دریافت نشد';
  }

  async getOpenAIResponse(query, systemContext) {
    if (this.demoMode) {
      return this.simulateOpenAIResponse(query, systemContext);
    }
    
    const response = await fetch(this.apiUrls.openai, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKeys.openai}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: this.buildOpenAISystemPrompt(systemContext)
          },
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'خطا در دریافت پاسخ');
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'پاسخی دریافت نشد';
  }

  async getLocalAnalysis(query, systemContext) {
    return {
      analysis: {
        intent: this.detectIntent(query),
        keywords: this.extractKeywords(query),
        confidence: 0.8
      },
      recommendations: this.generateLocalRecommendations(query),
      timestamp: new Date().toISOString()
    };
  }

  detectIntent(query) {
    const intents = {
      'پاک کردن|حذف|clean|delete': 'cleanup',
      'سیستم|system|performance': 'system_info',
      'شبکه|network|اینترنت': 'network',
      'فایل|file|folder': 'file_management',
      'برنامه|app|application': 'application',
      'تنظیمات|settings|config': 'configuration'
    };
    
    for (const [pattern, intent] of Object.entries(intents)) {
      if (new RegExp(pattern, 'i').test(query)) {
        return intent;
      }
    }
    
    return 'general';
  }

  extractKeywords(query) {
    const commonKeywords = [
      'windows', 'cmd', 'powershell', 'برنامه', 'فایل', 
      'سیستم', 'شبکه', 'سرعت', 'حافظه', 'دیسک'
    ];
    
    return commonKeywords.filter(keyword => 
      query.toLowerCase().includes(keyword)
    );
  }

  generateLocalRecommendations(query) {
    const recommendations = [];
    
    if (query.includes('پاک') || query.includes('حذف')) {
      recommendations.push({
        title: 'پاک‌سازی فایل‌های موقت',
        command: 'cleanmgr',
        description: 'اجرای Disk Cleanup ویندوز',
        risk: 1
      });
    }
    
    if (query.includes('شبکه') || query.includes('اینترنت')) {
      recommendations.push({
        title: 'تشخیص مشکلات شبکه',
        command: 'ipconfig /all',
        description: 'نمایش تنظیمات شبکه',
        risk: 1
      });
    }
    
    if (query.includes('سیستم') || query.includes('اطلاعات')) {
      recommendations.push({
        title: 'اطلاعات سیستم',
        command: 'systeminfo',
        description: 'نمایش جزئیات سیستم',
        risk: 1
      });
    }
    
    return recommendations;
  }

  buildGeminiPrompt(query, systemContext) {
    return `کاربر فارسی‌زبان از شما سؤال پرسیده: "${query}"

لطفاً پاسخ خود را به فارسی ساده و واضح ارائه دهید.
سیستم کاربر: ${systemContext.os} ${systemContext.osVersion}

اگر دستوری می‌دهید، حتماً توضیح دهید که چه کاری انجام می‌دهد.
برای دستورات پرخطر هشدارهای امنیتی بدهید.`;
  }

  buildOpenAISystemPrompt(systemContext) {
    return `شما یک دستیار هوشمند برای مدیریت سیستم ویندوز هستید.
کاربر فارسی‌زبان است و نیاز به کمک فنی دارد.
اطلاعات سیستم: ${JSON.stringify(systemContext)}

لطفاً:
1. به فارسی پاسخ دهید
2. دستورات را با توضیح ارائه دهید
3. هشدارهای امنیتی بدهید
4. اگر نمی‌دانید، صادقانه بگویید`;
  }

  analyzeAndSynthesizeResponses(responses, systemContext) {
    if (this.demoMode) {
      return this.simulateSynthesizedResponse(responses, systemContext);
    }
    
    const availableResponses = Object.entries(responses)
      .filter(([_, response]) => response && response !== 'پاسخی دریافت نشد')
      .map(([source, response]) => ({ source, response }));
    
    if (availableResponses.length === 0) {
      return this.getFallbackResponse(systemContext);
    }
    
    // استفاده از بهترین پاسخ موجود
    const bestResponse = availableResponses[0];
    return this.formatResponse(bestResponse.response, bestResponse.source);
  }

  formatResponse(response, source) {
    return `
      <div class="ai-response-card">
        <div class="response-header">
          <h3><i class="fas fa-robot"></i> پاسخ هوش مصنوعی</h3>
          <span class="source-badge">منبع: ${source}</span>
        </div>
        <div class="response-content">
          ${response.replace(/\n/g, '<br>')}
        </div>
        <div class="response-footer">
          <button class="copy-response">کپی پاسخ</button>
          <button class="feedback-btn" data-feedback="helpful">مفید بود</button>
        </div>
      </div>
    `;
  }

  getFallbackResponse() {
    return `
      <div class="ai-response-card fallback">
        <div class="fallback-header">
          <h3><i class="fas fa-exclamation-triangle"></i> حالت نمایشی</h3>
        </div>
        <div class="fallback-content">
          <p>در حال حاضر از حالت نمایشی استفاده می‌کنید. برای استفاده کامل:</p>
          <ol>
            <li>کلید API رایگان از Google AI Studio دریافت کنید</li>
            <li>کلید را در تنظیمات وارد کنید</li>
            <li>از هوش مصنوعی واقعی استفاده کنید</li>
          </ol>
          <button class="config-btn" onclick="window.arcAI.showApiKeyConfigModal()">
            <i class="fas fa-cog"></i> تنظیمات API
          </button>
        </div>
      </div>
    `;
  }

  initializeKnowledgeBase() {
    const knowledge = [
      {
        question: 'فایل موقت پاک کنم',
        answer: 'برای پاک‌سازی فایل‌های موقت از Disk Cleanup استفاده کنید: cleanmgr'
      },
      {
        question: 'اطلاعات سیستم',
        answer: 'برای دیدن اطلاعات سیستم از دستور systeminfo در CMD استفاده کنید'
      }
    ];
    
    knowledge.forEach(item => {
      this.cachedKnowledge.set(item.question.toLowerCase(), {
        answer: item.answer,
        timestamp: Date.now()
      });
    });
  }

  checkKnowledgeBase(query) {
    const queryText = typeof query === 'string' ? query.toLowerCase() : query.query?.toLowerCase() || '';
    const cached = this.cachedKnowledge.get(queryText);
    
    if (cached && (Date.now() - cached.timestamp) < 86400000) {
      return cached.answer;
    }
    
    return null;
  }

  updateKnowledgeBase(query, response) {
    const queryText = typeof query === 'string' ? query.toLowerCase() : query.query?.toLowerCase() || '';
    this.cachedKnowledge.set(queryText, {
      answer: response,
      timestamp: Date.now()
    });
    
    // محدود کردن اندازه کش
    if (this.cachedKnowledge.size > 100) {
      const oldestKey = Array.from(this.cachedKnowledge.keys())[0];
      this.cachedKnowledge.delete(oldestKey);
    }
  }

  simulateGeminiResponse(query) {
    return `پاسخ شبیه‌سازی شده Gemini برای: "${query}"
    
این یک پاسخ نمونه در حالت نمایشی است. برای دریافت پاسخ واقعی، لطفاً کلید API خود را وارد کنید.`;
  }

  simulateOpenAIResponse(query) {
    return `پاسخ شبیه‌سازی شده ChatGPT برای: "${query}"
    
این یک پاسخ نمونه است. برای استفاده کامل، کلید OpenAI API را وارد کنید.`;
  }

  simulateSynthesizedResponse() {
    return `
      <div class="ai-response-card demo">
        <div class="demo-header">
          <h3><i class="fas fa-flask"></i> حالت آزمایشی</h3>
        </div>
        <div class="demo-content">
          <p>🎯 <strong>قابلیت‌های کامل آرکا:</strong></p>
          <ul>
            <li>✅ تحلیل چندمنبعی با Gemini و ChatGPT</li>
            <li>✅ تولید دستورات امن برای ویندوز</li>
            <li>✅ هشدارهای امنیتی هوشمند</li>
            <li>✅ پاسخ‌های فارسی روان</li>
          </ul>
          
          <p>🔑 <strong>برای فعال‌سازی:</strong></p>
          <ol>
            <li>به <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a> بروید</li>
            <li>کلید API رایگان دریافت کنید</li>
            <li>کلید را در تنظیمات آرکا وارد کنید</li>
          </ol>
          
          <button class="primary-btn" onclick="window.arcAI.showApiKeyConfigModal()">
            <i class="fas fa-key"></i> وارد کردن کلید API
          </button>
        </div>
      </div>
    `;
  }

  showEnhancedWelcomeMessage() {
    const responseElement = document.getElementById('ai-response');
    if (!responseElement) return;
    
    responseElement.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-header">
          <h2><i class="fas fa-robot"></i> هوش مصنوعی آرکا</h2>
          <p>دستیار هوشمند مدیریت سیستم ویندوز</p>
        </div>
        
        <div class="welcome-features">
          <div class="feature">
            <i class="fas fa-bolt"></i>
            <span>پاسخ سریع و دقیق</span>
          </div>
          <div class="feature">
            <i class="fas fa-shield-alt"></i>
            <span>امنیت بالا</span>
          </div>
          <div class="feature">
            <i class="fas fa-language"></i>
            <span>پاسخ فارسی</span>
          </div>
        </div>
        
        <div class="welcome-examples">
          <p>مثال‌هایی که می‌پرسید:</p>
          <div class="example-chips">
            <span class="chip" data-query="چگونه فایل موقت پاک کنم؟">پاک‌سازی فایل موقت</span>
            <span class="chip" data-query="اطلاعات سیستم من چیست؟">اطلاعات سیستم</span>
            <span class="chip" data-query="شبکه من مشکل دارد">عیب‌یابی شبکه</span>
          </div>
        </div>
        
        <div class="welcome-footer">
          <p>برای شروع، سؤال خود را در کادر زیر بنویسید یا روی مثال کلیک کنید.</p>
        </div>
      </div>
    `;
    
    // اضافه کردن event listener برای چیپ‌ها
    responseElement.querySelectorAll('.chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        document.getElementById('ai-input').value = query;
        this.handleUserQuery();
      });
    });
  }

  showApiKeyConfigModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3><i class="fas fa-key"></i> تنظیمات API</h3>
          <button class="close-modal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="api-section">
            <h4><i class="fab fa-google"></i> Google Gemini API</h4>
            <input type="password" 
                   id="gemini-key" 
                   placeholder="AIzaSy..." 
                   value="${this.apiKeys.gemini}">
            <p class="help-text">
              دریافت رایگان از: 
              <a href="https://makersuite.google.com/app/apikey" target="_blank">
                Google AI Studio
              </a>
            </p>
          </div>
          
          <div class="api-section">
            <h4><i class="fas fa-comment"></i> OpenAI API</h4>
            <input type="password" 
                   id="openai-key" 
                   placeholder="sk-..." 
                   value="${this.apiKeys.openai}">
            <p class="help-text">
              دریافت از: 
              <a href="https://platform.openai.com/api-keys" target="_blank">
                OpenAI Platform
              </a>
            </p>
          </div>
          
          <div class="security-note">
            <i class="fas fa-shield-alt"></i>
            <span>کلیدهای شما فقط در مرورگرتان ذخیره می‌شوند</span>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-secondary" id="cancel-config">انصراف</button>
          <button class="btn-primary" id="save-config">ذخیره</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // رویدادهای modal
    modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
    modal.querySelector('#cancel-config').addEventListener('click', () => modal.remove());
    
    modal.querySelector('#save-config').addEventListener('click', () => {
      const geminiKey = document.getElementById('gemini-key').value.trim();
      const openaiKey = document.getElementById('openai-key').value.trim();
      
      // اعتبارسنجی اولیه
      if (geminiKey && !geminiKey.startsWith('AIza')) {
        alert('فرمت کلید Gemini معتبر نیست');
        return;
      }
      
      if (openaiKey && !openaiKey.startsWith('sk-')) {
        alert('فرمت کلید OpenAI معتبر نیست');
        return;
      }
      
      // ذخیره
      if (geminiKey) localStorage.setItem('arka_gemini_api_key', geminiKey);
      if (openaiKey) localStorage.setItem('arka_openai_api_key', openaiKey);
      
      this.apiKeys.gemini = geminiKey;
      this.apiKeys.openai = openaiKey;
      this.demoMode = !(geminiKey || openaiKey);
      
      modal.remove();
      this.showSuccess('تنظیمات ذخیره شد');
      
      // رفرش پاسخ
      this.showEnhancedWelcomeMessage();
    });
  }

  showThinkingAnimation() {
    const thinking = document.createElement('div');
    thinking.id = 'thinking-animation';
    thinking.innerHTML = `
      <div class="thinking">
        <div class="dots">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
        <p>در حال پردازش...</p>
      </div>
    `;
    document.body.appendChild(thinking);
  }

  hideThinkingAnimation() {
    const thinking = document.getElementById('thinking-animation');
    if (thinking) thinking.remove();
  }

  showLoadingState() {
    const responseElement = document.getElementById('ai-response');
    if (responseElement) {
      responseElement.innerHTML = `
        <div class="loading">
          <div class="spinner"></div>
          <p>در حال تحلیل سؤال شما...</p>
        </div>
      `;
    }
  }

  showError(message) {
    const responseElement = document.getElementById('ai-response');
    if (responseElement) {
      responseElement.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-circle"></i>
          <span>${message}</span>
        </div>
      `;
    }
  }

  showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  }

  displayResponse(response) {
    const responseElement = document.getElementById('ai-response');
    if (responseElement) {
      responseElement.innerHTML = response;
      this.activateResponseButtons();
    }
  }

  activateResponseButtons() {
    // دکمه کپی
    document.querySelectorAll('.copy-response').forEach(btn => {
      btn.addEventListener('click', () => {
        const responseText = btn.closest('.ai-response-card')
          .querySelector('.response-content').textContent;
        
        navigator.clipboard.writeText(responseText)
          .then(() => this.showSuccess('کپی شد'))
          .catch(() => this.showError('خطا در کپی'));
      });
    });
    
    // دکمه بازخورد
    document.querySelectorAll('.feedback-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const feedback = e.target.dataset.feedback;
        this.sendFeedback(feedback);
        this.showSuccess('بازخورد ثبت شد');
      });
    });
  }

  sendFeedback(feedback) {
    // ارسال بازخورد به سرور (در صورت نیاز)
    console.log('Feedback:', feedback);
  }

  addToHistory(role, content) {
    this.conversationHistory.push({
      role,
      content: content.substring(0, 500), // محدود کردن طول
      timestamp: Date.now()
    });
    
    // محدود کردن تاریخچه
    if (this.conversationHistory.length > 50) {
      this.conversationHistory.shift();
    }
  }

  getSuggestions(query, response) {
    // پیاده‌سازی پیشنهادات
    if (this.suggestionEngine) {
      this.suggestionEngine.update(query, response);
    }
  }

  startBackgroundMonitoring() {
    // به‌روزرسانی آمار سیستم
    setInterval(() => {
      this.updateSystemStats();
    }, 10000);
  }

  updateSystemStats() {
    // به‌روزرسانی عناصر HTML (در صورت وجود)
    const elements = {
      'cpu-usage': () => Math.floor(20 + Math.random() * 60),
      'ram-usage': () => Math.floor(30 + Math.random() * 50),
      'disk-space': () => Math.floor(100 + Math.random() * 400)
    };
    
    for (const [id, getValue] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = `${getValue()}%`;
      }
    }
  }

  static initialize() {
    if (!window.arcAI) {
      window.arcAI = new ArcAIEngine();
      console.log('🚀 Arc AI Engine Ready');
    }
  }
}

// کلاس‌های کمکی (پیاده‌سازی ساده)
class AutoSuggestEngine {
  constructor() {
    this.suggestions = new Map();
  }
  
  update(query, response) {
    // ذخیره پیشنهادات
  }
  
  getSuggestions(query) {
    return [];
  }
}

class NLPProcessor {
  processQuery(query) {
    return {
      query: query,
      tokens: query.split(' '),
      length: query.length,
      isQuestion: query.includes('؟') || query.includes('?')
    };
  }
}

// راه‌اندازی خودکار
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ArcAIEngine.initialize);
} else {
  ArcAIEngine.initialize();
}

// قابلیت دسترسی global
window.ArcAIEngine = ArcAIEngine;

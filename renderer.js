// ============================================
// CONFIGURATION
// ============================================

let config = {
    apiUrl: localStorage.getItem('apiUrl') || 'http://127.0.0.1:8000/api/business/message'
};

let isMinimized = true;
let isFullscreen = false;

// ============================================
// 🆕 AUTHENTIFICATION SIMPLIFIÉE
// ============================================

let authToken = localStorage.getItem('auth_token');
let currentUser = null;

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Générer ou récupérer un ID unique pour cet appareil
function getDeviceId() {
    let deviceId = localStorage.getItem('device_id');

    if (!deviceId) {
        deviceId = 'business-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('device_id', deviceId);
        console.log('🆔 Nouvel ID appareil généré:', deviceId);
    }

    return deviceId;
}

// Connexion utilisateur
async function login(email, password) {
    const loginBtn = document.getElementById('loginBtn');
    const authStatus = document.getElementById('authStatus');

    if (!loginBtn || !authStatus) return;

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: password,
                device_name: 'Assistant Pro'
            })
        });

        const data = await response.json();

        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('auth_token', authToken);
            localStorage.setItem('current_user', JSON.stringify(currentUser));

            showAuthStatus('success', `✅ Bienvenue ${data.user.name} !`);

            setTimeout(() => {
                showAccountSection();
            }, 1500);

        } else {
            showAuthStatus('error', '❌ Email ou mot de passe incorrect');
        }

    } catch (error) {
        console.error('Erreur login:', error);
        showAuthStatus('error', '❌ Erreur de connexion au serveur');
    } finally {
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Se connecter';
    }
}

// Déconnexion
async function logout() {
    try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.log('Erreur logout:', error);
    }

    authToken = null;
    currentUser = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');

    showAuthSection();
    showAuthStatus('success', '👋 À bientôt !');
}

// Afficher le statut d'authentification
function showAuthStatus(type, message) {
    const status = document.getElementById('authStatus');
    if (status) {
        status.className = `connection-status visible ${type}`;
        status.textContent = message;
    }
}

// Afficher la section de connexion
function showAuthSection() {
    const authSection = document.getElementById('authSection');
    const accountSection = document.getElementById('accountSection');
    if (authSection) authSection.style.display = 'block';
    if (accountSection) accountSection.style.display = 'none';
}

// Afficher la section compte
function showAccountSection() {
    const authSection = document.getElementById('authSection');
    const accountSection = document.getElementById('accountSection');
    if (authSection) authSection.style.display = 'none';
    if (accountSection) accountSection.style.display = 'block';

    if (currentUser) {
        const userName = document.getElementById('userName');
        const userEmail2 = document.getElementById('userEmail2');
        if (userName) userName.textContent = currentUser.name;
        if (userEmail2) userEmail2.textContent = currentUser.email;
    }
}

// Vérifier si déjà connecté au démarrage
function checkAuth() {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('current_user');

    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        showAccountSection();
    } else {
        showAuthSection();
    }
}

// ============================================
// HISTORIQUE DE CONVERSATION
// ============================================
let conversationHistory = [];

// ============================================
// GESTION ANIMATION LOTTIE
// ============================================

let assistantAnimation = null;

function initLottieAnimation() {
    const container = document.getElementById('lottie-container');

    if (!container) {
        console.error('❌ Container lottie non trouvé dans le DOM');
        return;
    }

    try {
        if (typeof window.lottie === 'undefined') {
            console.error('❌ lottie-web n\'est pas chargé');
            return;
        }

        assistantAnimation = window.lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: './animations/assistant-waiting.json'
        });

        console.log('✅ Animation assistant chargée');

        assistantAnimation.addEventListener('DOMLoaded', () => {
            console.log('💼 Assistant prêt et animé !');
        });

        assistantAnimation.addEventListener('data_failed', () => {
            console.error('❌ Impossible de charger le fichier JSON');
        });

    } catch (error) {
        console.error('Erreur:', error);
    }
}

window.assistantLottie = {
    animation: () => assistantAnimation,
    play: () => assistantAnimation?.play(),
    pause: () => assistantAnimation?.pause(),
    stop: () => assistantAnimation?.stop(),
    getStatus: () => !assistantAnimation ? 'not loaded' : (assistantAnimation.isPaused ? 'paused' : 'playing')
};

// ============================================
// GESTION ANIMATION LOTTIE HEADER
// ============================================

let assistantHeaderAnimation = null;

function initLottieHeader() {
    const container = document.getElementById('lottie-header');

    if (!container) {
        console.error('❌ Container lottie-header non trouvé');
        return;
    }

    try {
        if (typeof window.lottie === 'undefined') {
            console.error('❌ lottie-web n\'est pas chargé');
            return;
        }

        assistantHeaderAnimation = window.lottie.loadAnimation({
            container: container,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: './animations/assistant-waiting.json'
        });

        console.log('✅ Animation assistant header chargée');

        assistantHeaderAnimation.addEventListener('DOMLoaded', () => {
            console.log('💼 Assistant du header prêt !');
        });

    } catch (error) {
        console.error('❌ Erreur chargement animation header:', error);
    }
}

window.assistantLottieHeader = {
    animation: () => assistantHeaderAnimation,
    play: () => assistantHeaderAnimation?.play(),
    pause: () => assistantHeaderAnimation?.pause(),
    getStatus: () => assistantHeaderAnimation ? 'loaded' : 'not loaded'
};

// Éléments DOM
const elements = {
    floatingButton: document.getElementById('floatingButton'),
    settingsBtn: document.getElementById('settingsBtn'),
    chatContainer: document.getElementById('chatContainer'),
    settingsPanel: document.getElementById('settingsPanel'),
    closeSettings: document.getElementById('closeSettings'),
    apiUrlInput: document.getElementById('apiUrl'),
    saveSettingsBtn: document.getElementById('saveSettings'),
    testConnectionBtn: document.getElementById('testConnection'),
    connectionStatus: document.getElementById('connectionStatus'),
    messagesContainer: document.getElementById('messagesContainer'),
    messageInput: document.getElementById('messageInput'),
    sendButton: document.getElementById('sendButton'),
    typingIndicator: document.getElementById('typingIndicator'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    minimizeBtn: document.getElementById('minimizeBtn'),
    closeBtn: document.getElementById('closeBtn'),
    toggleFullscreenBtn: document.getElementById('toggleFullscreenBtn'),
    themeToggle: document.getElementById('themeToggle')
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Démarrage de l\'application...');

    loadSettings();
    loadHistory();
    setupEventListeners();
    checkAuth(); // 🆕 Vérifier l'authentification
    setupFullscreenToggle();
    setupKeyboardShortcuts();

    setTimeout(() => {
        initLottieAnimation();
        initLottieHeader();
    }, 100);

    console.log('✅ Application initialisée');
});

// ============================================
// GESTION FULLSCREEN
// ============================================

function setupFullscreenToggle() {
    if (!elements.toggleFullscreenBtn) {
        console.warn('⚠️ Bouton toggleFullscreen non trouvé');
        return;
    }

    elements.toggleFullscreenBtn.addEventListener('click', toggleFullscreen);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
    });

    console.log('✅ Toggle fullscreen configuré');
}

function toggleFullscreen() {
    isFullscreen = !isFullscreen;
    if (window.electronAPI && window.electronAPI.toggleFullscreen) {
        window.electronAPI.toggleFullscreen(isFullscreen);
        updateFullscreenButton();
        animateFullscreenTransition();
        console.log(isFullscreen ? '📺 Mode plein écran' : '🪟 Mode normal');
    } else {
        console.error('❌ electronAPI.toggleFullscreen non disponible');
    }
}

function updateFullscreenButton() {
    if (!elements.toggleFullscreenBtn) return;

    const icon = elements.toggleFullscreenBtn.querySelector('i');

    if (isFullscreen) {
        icon.className = 'fas fa-compress';
        elements.toggleFullscreenBtn.title = 'Mode fenêtre (F11)';
    } else {
        icon.className = 'fas fa-expand';
        elements.toggleFullscreenBtn.title = 'Plein écran (F11)';
    }
}

function animateFullscreenTransition() {
    const container = document.getElementById('chatContainer');
    if (!container) return;

    container.classList.add('transitioning');

    if (isFullscreen) {
        container.classList.add('fullscreen-mode');
    } else {
        container.classList.remove('fullscreen-mode');
    }

    setTimeout(() => {
        container.classList.remove('transitioning');
    }, 300);
}

function loadSettings() {
    if (elements.apiUrlInput) {
        elements.apiUrlInput.value = config.apiUrl;
    }
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);

    if (elements.themeToggle) {
        elements.themeToggle.checked = (savedTheme === 'light');
    }
}

function setupEventListeners() {
    if (elements.floatingButton) {
        elements.floatingButton.addEventListener('click', () => {
            toggleChat(false);
        });
    }

    if (elements.settingsBtn) {
        elements.settingsBtn.addEventListener('click', () => {
            elements.settingsPanel.classList.toggle('active');
        });
    }

    if (elements.minimizeBtn) {
        elements.minimizeBtn.addEventListener('click', () => {
            toggleChat(true);
        });
    }

    if (elements.closeBtn) {
        elements.closeBtn.addEventListener('click', () => {
            if (window.electronAPI && window.electronAPI.closeWindow) {
                window.electronAPI.closeWindow();
            } else {
                window.close();
            }
        });
    }

    if (elements.closeSettings) {
        elements.closeSettings.addEventListener('click', () => {
            elements.settingsPanel.classList.remove('active');
        });
    }

    if (elements.saveSettingsBtn) {
        elements.saveSettingsBtn.addEventListener('click', saveSettings);
    }

    if (elements.testConnectionBtn) {
        elements.testConnectionBtn.addEventListener('click', testConnection);
    }

    if (elements.sendButton) {
        elements.sendButton.addEventListener('click', sendMessage);
    }

    if (elements.messageInput) {
        elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        elements.messageInput.addEventListener('input', () => {
            elements.messageInput.style.height = 'auto';
            elements.messageInput.style.height = Math.min(elements.messageInput.scrollHeight, 120) + 'px';
        });
    }

    if (elements.floatingButton) {
        elements.floatingButton.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            elements.settingsPanel.classList.add('active');
        });
    }

    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (confirm('Voulez-vous vraiment démarrer une nouvelle conversation ?')) {
                try {
                    clearSavedHistory();
                    showTypingIndicator(false);
                    elements.messagesContainer.innerHTML = '';

                    setTimeout(() => {
                        elements.sendButton.disabled = false;
                        elements.messageInput.disabled = false;
                        elements.messageInput.value = '';
                        console.log('✅ Contrôles réactivés');
                    }, 50);

                    setTimeout(() => {
                        const welcomeDiv = document.createElement('div');
                        welcomeDiv.className = 'message bot-message welcome-message';
                        welcomeDiv.innerHTML = `
                            <div class="message-avatar">
                                <i class="fas fa-robot"></i>
                            </div>
                            <div class="message-content">
                                <div class="message-header">Assistant Pro 💼</div>
                                <p>💼 Nouvelle conversation démarrée. Comment puis-je vous aider ?</p>
                            </div>
                        `;
                        elements.messagesContainer.appendChild(welcomeDiv);
                    }, 200);

                    setTimeout(() => {
                        elements.messageInput.focus();
                        console.log('✅ Nouvelle conversation prête !');
                    }, 200);

                } catch (error) {
                    console.error('❌ Erreur lors du reset:', error);
                    location.reload();
                }
            }
        });
    }

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('change', (e) => {
            const theme = e.target.checked ? 'light' : 'dark';
            applyTheme(theme);
            localStorage.setItem('theme', theme);
            console.log('🎨 Thème changé:', theme);
        });
    }

    // 🆕 Event listeners pour l'authentification
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const email = document.getElementById('userEmail')?.value;
            const password = document.getElementById('userPassword')?.value;
            if (email && password) {
                login(email, password);
            }
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    const passwordInput = document.getElementById('userPassword');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const email = document.getElementById('userEmail')?.value;
                const password = document.getElementById('userPassword')?.value;
                if (email && password) {
                    login(email, password);
                }
            }
        });
    }

    const closeHelpBtn = document.getElementById('closeHelp');
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', () => {
            toggleHelpPanel();
        });
    }

    const helpOverlay = document.querySelector('.help-overlay');
    if (helpOverlay) {
        helpOverlay.addEventListener('click', () => {
            toggleHelpPanel();
        });
    }

    console.log('✅ Event listeners configurés');
}

function toggleChat(minimize = false) {
    isMinimized = minimize;

    if (minimize) {
        elements.chatContainer.classList.add('hidden');
        elements.floatingButton.style.display = 'flex';
        elements.floatingButton.style.left = 'auto';
        elements.floatingButton.style.top = 'auto';
        elements.floatingButton.style.right = '20px';
        elements.floatingButton.style.bottom = '20px';
    } else {
        elements.floatingButton.style.display = 'none';
        elements.chatContainer.classList.remove('hidden');
        elements.messageInput.focus();
    }
}

function saveSettings() {
    config.apiUrl = elements.apiUrlInput.value.trim();

    if (config.apiUrl.endsWith('/')) {
        config.apiUrl = config.apiUrl.slice(0, -1);
    }

    localStorage.setItem('apiUrl', config.apiUrl);
    showConnectionStatus('✅ Paramètres sauvegardés !', 'success');

    setTimeout(() => {
        elements.settingsPanel.classList.remove('active');
    }, 1500);
}

async function testConnection() {
    if (!config.apiUrl) {
        showConnectionStatus('❌ Veuillez renseigner l\'URL', 'error');
        return;
    }

    elements.testConnectionBtn.disabled = true;
    elements.testConnectionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Test...';

    try {
        const response = await fetch(`${API_BASE_URL}/business/test`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showConnectionStatus('✅ Connexion réussie !', 'success');
        } else {
            throw new Error('Erreur de connexion');
        }
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showConnectionStatus('❌ Échec de la connexion. Vérifiez l\'URL.', 'error');
    } finally {
        elements.testConnectionBtn.disabled = false;
        elements.testConnectionBtn.innerHTML = '<i class="fas fa-plug"></i> Tester';
    }
}

async function checkInitialConnection() {
    if (config.apiUrl) {
        try {
            const response = await fetch(`${API_BASE_URL}/business/test`);
            if (!response.ok) {
                elements.settingsPanel.classList.add('active');
            }
        } catch (error) {
            elements.settingsPanel.classList.add('active');
        }
    } else {
        elements.settingsPanel.classList.add('active');
    }
}

function showConnectionStatus(message, type) {
    elements.connectionStatus.textContent = message;
    elements.connectionStatus.className = `connection-status ${type}`;
}

// ============================================
// 🆕 ENVOI DE MESSAGE AVEC AUTHENTIFICATION
// ============================================

async function sendMessage() {
    const message = elements.messageInput.value.trim();

    // Vérifications de base
    if (!message) return;

    if (message.length < 2) {
        addMessage("💼 Pourriez-vous préciser votre demande ?", 'bot');
        return;
    }

    // Afficher le message utilisateur
    addMessage(message, 'user');
    elements.messageInput.value = '';
    elements.messageInput.style.height = 'auto';

    // Ajouter à l'historique
    conversationHistory.push({
        role: 'user',
        content: message
    });

    // Désactiver les contrôles pendant l'envoi
    elements.sendButton.disabled = true;
    elements.messageInput.disabled = true;
    showTypingIndicator(true);

    try {
        // Préparer les headers
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        // Ajouter le token si connecté
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        console.log('📤 Headers envoyés:', headers);
        console.log('📤 Token:', authToken);

        // Récupérer la préférence de mémoire contextuelle
        const useContext = document.getElementById('useContextToggle')?.checked ?? true;

        // Appel API
        const response = await fetch(`${API_BASE_URL}/business/message`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                question: message,
                conversation_history: conversationHistory,
                device_identifier: getDeviceId(),
                use_context: useContext
            })
        });

        // Gestion des erreurs HTTP
        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (e) {
                // Impossible de parser la réponse
            }

            let friendlyMessage = '';

            if (response.status === 422) {
                friendlyMessage = "💼 Pourriez-vous reformuler votre demande de manière plus détaillée ?";
            } else if (response.status === 500) {
                friendlyMessage = "💼 Une erreur technique est survenue. Veuillez réessayer dans quelques instants.";
            } else if (response.status === 404) {
                friendlyMessage = "💼 Service temporairement indisponible. Veuillez contacter le support.";
            } else if (response.status === 401 || response.status === 403) {
                friendlyMessage = "💼 Votre session a expiré. Veuillez vous reconnecter.";
            } else {
                friendlyMessage = "💼 Une erreur est survenue. Veuillez réessayer.";
            }

            showTypingIndicator(false);
            addMessage(friendlyMessage, 'bot');

            console.error('❌ Erreur serveur:', {
                status: response.status,
                data: errorData
            });

            elements.sendButton.disabled = false;
            elements.messageInput.disabled = false;
            elements.messageInput.focus();
            return;
        }

        // Récupérer la réponse
        const data = await response.json();
        const botResponse = data.response;

        console.log('📥 Réponse complète de l\'API:', data);

        // Afficher la réponse
        addMessage(botResponse, 'bot');

        // Logs de debug
        if (data.context_used) {
            console.log(`✅ Mémoire active (${data.context_messages_count} messages en contexte)`);
        } else {
            console.log('ℹ️ Mémoire désactivée ou mode anonyme');
        }

        if (data.authenticated) {
            console.log('✅ Conversation synchronisée avec le compte utilisateur');
        } else {
            console.log('ℹ️ Mode anonyme - conversation non sauvegardée');
        }

        // Ajouter la réponse à l'historique
        conversationHistory.push({
            role: 'assistant',
            content: botResponse
        });

        // Limiter la taille de l'historique
        if (conversationHistory.length > 300) {
            conversationHistory = conversationHistory.slice(-300);
        }

        // Sauvegarder l'historique
        saveHistory();

    } catch (error) {
        console.error('Erreur:', error);
        let friendlyMessage = "💼 Impossible de se connecter au serveur. Vérifiez votre connexion internet.";
        addMessage(friendlyMessage, 'bot');

    } finally {
        // Réactiver les contrôles
        showTypingIndicator(false);
        elements.sendButton.disabled = false;
        elements.messageInput.disabled = false;
        elements.messageInput.focus();
    }
}

function addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;

    if (type === 'bot') {
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
        messageDiv.appendChild(avatarDiv);
    }

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    if (type === 'bot') {
        const header = document.createElement('div');
        header.className = 'message-header';
        header.textContent = 'Assistant Pro 💼';
        contentDiv.appendChild(header);
    }

    const p = document.createElement('p');
    p.textContent = text;

    contentDiv.appendChild(p);
    messageDiv.appendChild(contentDiv);
    elements.messagesContainer.appendChild(messageDiv);

    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function showTypingIndicator(show) {
    if (show) {
        elements.typingIndicator.classList.add('active');
        elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
    } else {
        elements.typingIndicator.classList.remove('active');
    }
}

function clearHistory() {
    conversationHistory = [];
    console.log('🗑️ Historique mémoire effacé');
}

// ============================================
// GESTION DE LA MÉMOIRE PERSISTANTE
// ============================================

function saveHistory() {
    try {
        localStorage.setItem('business_conversation_history', JSON.stringify(conversationHistory));
        localStorage.setItem('business_last_save', new Date().toISOString());
        console.log('💾 Historique sauvegardé:', conversationHistory.length, 'messages');
    } catch (error) {
        console.error('❌ Erreur sauvegarde historique:', error);
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem('business_conversation_history');
        const lastSave = localStorage.getItem('business_last_save');

        if (saved) {
            conversationHistory = JSON.parse(saved);
            console.log('✅ Historique chargé:', conversationHistory.length, 'messages');

            if (lastSave) {
                const saveDate = new Date(lastSave);
                console.log('📅 Dernière sauvegarde:', saveDate.toLocaleString());
            }

            restoreMessagesUI();
        } else {
            console.log('📝 Nouvelle conversation - pas d\'historique');
        }
    } catch (error) {
        console.error('❌ Erreur chargement historique:', error);
        conversationHistory = [];
    }
}

function restoreMessagesUI() {
    elements.messagesContainer.innerHTML = '';

    const welcomeBack = document.createElement('div');
    welcomeBack.className = 'message bot-message welcome-message';
    welcomeBack.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="message-header">Assistant Pro 💼</div>
            <p>Bon retour ! Je me souviens de notre conversation précédente. Souhaitez-vous continuer ? 💼</p>
        </div>
    `;
    elements.messagesContainer.appendChild(welcomeBack);

    const recentMessages = conversationHistory.slice(-20);

    recentMessages.forEach(msg => {
        if (msg.role === 'user') {
            addMessage(msg.content, 'user');
        } else if (msg.role === 'assistant') {
            addMessage(msg.content, 'bot');
        }
    });

    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function clearSavedHistory() {
    conversationHistory = [];
    localStorage.removeItem('business_conversation_history');
    localStorage.removeItem('business_last_save');
    console.log('🗑️ Historique effacé complètement (mémoire + stockage)');
}

function showHistory() {
    console.log('📜 Historique de conversation:', conversationHistory);
    console.log(`📊 Nombre total de messages: ${conversationHistory.length}`);
    console.log(`🔢 Nombre d'échanges: ${conversationHistory.length / 2}`);
    return conversationHistory;
}

window.assistantDebug = {
    clearHistory: clearHistory,
    clearAll: clearSavedHistory,
    showHistory: showHistory,
    getHistoryLength: () => conversationHistory.length,
    getExchangeCount: () => Math.floor(conversationHistory.length / 2),
    saveHistory: saveHistory,
    loadHistory: loadHistory
};

window.assistantFullscreen = {
    toggle: toggleFullscreen,
    isFullscreen: () => isFullscreen,
    getSize: () => isFullscreen ? 'fullscreen' : 'normal'
};

window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise non gérée:', event.reason);
});

// ============================================
// GESTION DU THÈME
// ============================================

function applyTheme(theme) {
    const root = document.documentElement;

    if (theme === 'light') {
        root.classList.add('light-theme');
        console.log('☀️ Thème clair activé');
    } else {
        root.classList.remove('light-theme');
        console.log('🌙 Thème sombre activé');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    if (elements.themeToggle) {
        elements.themeToggle.checked = (newTheme === 'light');
    }

    return newTheme;
}

window.assistantTheme = {
    toggle: toggleTheme,
    apply: applyTheme,
    getCurrent: () => document.documentElement.classList.contains('light-theme') ? 'light' : 'dark'
};

// ============================================
// GESTION DES RACCOURCIS CLAVIER
// ============================================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        const isTyping = (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');

        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            if (confirm('Démarrer une nouvelle conversation ?')) {
                clearSavedHistory();
                showTypingIndicator(false);

                if (elements.messagesContainer) {
                    elements.messagesContainer.innerHTML = '';
                }

                setTimeout(() => {
                    elements.sendButton.disabled = false;
                    elements.messageInput.disabled = false;
                    elements.messageInput.value = '';
                }, 100);

                setTimeout(() => {
                    addMessage('💼 Nouvelle conversation démarrée. Comment puis-je vous aider ?', 'bot');
                    showToast('🔄 Nouvelle conversation', 'success');
                }, 100);

                setTimeout(() => {
                    if (elements.messageInput) {
                        elements.messageInput.focus();
                    }
                }, 300);

                console.log('⌨️ Raccourci: Nouvelle conversation');
            }
            return;
        }

        if (e.ctrlKey && e.key === 'm') {
            e.preventDefault();
            toggleChat(!isMinimized);
            showToast(isMinimized ? '📦 Assistant minimisé' : '💬 Assistant ouvert', 'info');
            console.log('⌨️ Raccourci: Toggle minimize');
            return;
        }

        if (e.key === 'Escape') {
            const helpPanel = document.getElementById('helpPanel');
            if (helpPanel && helpPanel.classList.contains('active')) {
                e.preventDefault();
                toggleHelpPanel();
                return;
            }

            if (!isMinimized && !isTyping) {
                e.preventDefault();
                toggleChat(true);
                showToast('📦 Assistant minimisé', 'info');
                console.log('⌨️ Raccourci: Escape');
                return;
            }

            if (elements.settingsPanel && elements.settingsPanel.classList.contains('active')) {
                e.preventDefault();
                elements.settingsPanel.classList.remove('active');
                console.log('⌨️ Raccourci: Fermer settings');
                return;
            }
        }

        if (e.ctrlKey && e.key === ',') {
            e.preventDefault();
            if (elements.settingsPanel) {
                elements.settingsPanel.classList.toggle('active');
                showToast('⚙️ Paramètres', 'info');
                console.log('⌨️ Raccourci: Paramètres');
            }
            return;
        }

        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            toggleHelpPanel();
            console.log('⌨️ Raccourci: Aide');
            return;
        }

        if (e.ctrlKey && e.key === 'Enter' && isTyping) {
            e.preventDefault();
            sendMessage();
            console.log('⌨️ Raccourci: Envoyer message');
            return;
        }
    });

    console.log('✅ Raccourcis clavier configurés');
}

function showToast(message, type = 'info') {
    let toast = document.getElementById('toast-notification');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.className = `toast-notification toast-${type}`;

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function toggleHelpPanel() {
    const helpPanel = document.getElementById('helpPanel');

    if (!helpPanel) {
        console.error('❌ Panneau d\'aide non trouvé');
        return;
    }

    const isActive = helpPanel.classList.contains('active');

    if (isActive) {
        helpPanel.classList.remove('active');
        console.log('📚 Aide fermée');
    } else {
        helpPanel.classList.add('active');
        console.log('📚 Aide ouverte');
    }
}

// ============================================
// GESTION DU TOGGLE MÉMOIRE
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    const memoryToggle = document.getElementById('useContextToggle');
    const memoryStatusText = document.getElementById('memoryStatusText');

    if (memoryToggle) {
        // Charger l'état sauvegardé (ou activer par défaut)
        const savedState = localStorage.getItem('memory_enabled');
        if (savedState !== null) {
            memoryToggle.checked = savedState === 'true';
        } else {
            memoryToggle.checked = true; // Activer par défaut
        }

        // Mettre à jour le texte au chargement
        updateMemoryStatus();

        // Écouter les changements
        memoryToggle.addEventListener('change', function () {
            updateMemoryStatus();

            // Sauvegarder la préférence
            localStorage.setItem('memory_enabled', this.checked);

            // Log pour debug
            if (this.checked) {
                console.log('🧠 Mémoire contextuelle activée');
            } else {
                console.log('⚠️ Mémoire contextuelle désactivée');
            }
        });
    }
});

function updateMemoryStatus() {
    const memoryToggle = document.getElementById('useContextToggle');
    const memoryStatusText = document.getElementById('memoryStatusText');

    if (!memoryToggle || !memoryStatusText) return;

    if (memoryToggle.checked) {
        memoryStatusText.textContent = 'Mémoire activée';
        memoryStatusText.style.color = '#4caf50';
    } else {
        memoryStatusText.textContent = 'Mémoire désactivée';
        memoryStatusText.style.color = '#ff9800';
    }
}

function isMemoryEnabled() {
    const memoryToggle = document.getElementById('useContextToggle');
    return memoryToggle ? memoryToggle.checked : true;
}

window.assistantShortcuts = {
    showToast: showToast,
    toggleHelp: toggleHelpPanel
};

// 🆕 Exposer pour debug
window.assistantAuth = {
    getToken: () => authToken,
    getUser: () => currentUser,
    isAuthenticated: () => !!authToken,
    login: login,
    logout: logout
};

console.log('💼 Assistant Pro chargé avec authentification !');
console.log('🤖 Animation Lottie intégrée');
console.log('💾 Capacité: 150 échanges (300 messages)');
console.log('💡 Debug: window.assistantDebug.showHistory()');
console.log('💡 Auth: window.assistantAuth.isAuthenticated()');
console.log('💡 Fullscreen: window.assistantFullscreen.toggle()');
console.log('💡 Lottie: window.assistantLottie.getStatus()');
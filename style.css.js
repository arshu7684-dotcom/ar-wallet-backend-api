* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
}

.container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    min-height: 100vh;
}

/* Header Styles */
.header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.logo h1 {
    font-size: 1.5rem;
    margin-bottom: 5px;
    color: #4a5568;
}

.logo p {
    color: #718096;
    font-size: 0.9rem;
}

.user-balance {
    text-align: center;
    margin-top: 15px;
    padding: 15px;
    background: linear-gradient(135deg, #48bb78, #38a169);
    border-radius: 15px;
    color: white;
}

.balance-amount {
    font-size: 2rem;
    font-weight: bold;
    margin-bottom: 5px;
}

.balance-label {
    font-size: 0.9rem;
    opacity: 0.9;
}

/* Main Content */
.main-content {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

/* Quick Actions */
.quick-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 10px;
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15px 10px;
    border: none;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    gap: 5px;
}

.action-btn.primary {
    background: linear-gradient(135deg, #4299e1, #3182ce);
    color: white;
}

.action-btn.secondary {
    background: linear-gradient(135deg, #ed8936, #dd6b20);
    color: white;
}

.action-btn.success {
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
}

.action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-btn .icon {
    font-size: 1.5rem;
}

/* Sections */
.section {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.section h3 {
    margin-bottom: 15px;
    color: #2d3748;
    font-size: 1.1rem;
}

/* Code Display */
.code-display {
    font-size: 2.5rem;
    font-weight: bold;
    text-align: center;
    letter-spacing: 5px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 15px 0;
    padding: 10px;
    border: 2px dashed #cbd5e0;
    border-radius: 10px;
}

.code-info {
    text-align: center;
    margin-bottom: 15px;
    color: #718096;
}

.code-info p {
    margin-bottom: 5px;
}

/* Buttons */
.btn {
    padding: 12px 20px;
    border: none;
    border-radius: 12px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    margin-bottom: 10px;
}

.primary-btn {
    background: linear-gradient(135deg, #4299e1, #3182ce);
    color: white;
}

.secondary-btn {
    background: #e2e8f0;
    color: #4a5568;
}

.success-btn {
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
}

.copy-btn {
    background: linear-gradient(135deg, #ed8936, #dd6b20);
    color: white;
}

.btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Input Groups */
.input-group {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
}

.input-group input {
    flex: 1;
    padding: 12px 15px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s ease;
}

.input-group input:focus {
    border-color: #4299e1;
}

.input-group .btn {
    width: auto;
    margin: 0;
}

/* Stats Grid */
.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin: 15px 0;
}

.stat-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 15px;
    padding: 15px 10px;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.stat-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2d3748;
    margin-bottom: 5px;
}

.stat-label {
    font-size: 0.7rem;
    color: #718096;
}

/* Referral Section */
.referral-link {
    display: flex;
    gap: 10px;
    margin-top: 10px;
}

.referral-link input {
    flex: 1;
    padding: 12px 15px;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    font-size: 0.9rem;
    background: #f7fafc;
}

/* Notification */
.notification {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #48bb78;
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transition: all 0.3s ease;
}

.notification.hidden {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
    pointer-events: none;
}

.notification.error {
    background: #f56565;
}

/* Withdraw Info */
.withdraw-info {
    background: #f7fafc;
    padding: 15px;
    border-radius: 12px;
    margin-bottom: 15px;
    border-left: 4px solid #4299e1;
}

.withdraw-info p {
    margin-bottom: 8px;
    color: #4a5568;
}

/* Responsive Design */
@media (max-width: 480px) {
    .container {
        padding: 15px;
    }
    
    .quick-actions {
        grid-template-columns: 1fr;
    }
    
    .stats-grid {
        grid-template-columns: 1fr 1fr;
    }
    
    .code-display {
        font-size: 2rem;
        letter-spacing: 3px;
    }
}

/* Loading Animation */
.loading {
    opacity: 0.7;
    pointer-events: none;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.section {
    animation: fadeIn 0.3s ease;
}
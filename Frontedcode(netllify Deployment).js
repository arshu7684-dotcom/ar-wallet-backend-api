<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ARWallet Pro - Earn Points</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://telegram.org/js/telegram-web-app.js"></script>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <header class="header">
            <div class="logo">
                <h1>🤑 ARWallet Pro</h1>
                <p>Earn Points • Unlimited Daily Income</p>
            </div>
            <div class="user-balance" id="userBalance">
                <div class="balance-amount">Loading...</div>
                <div class="balance-label">Your Balance</div>
            </div>
        </header>

        <!-- Main Dashboard -->
        <main class="main-content">
            <!-- Quick Actions -->
            <div class="quick-actions">
                <button class="action-btn primary" onclick="generateCode()">
                    <span class="icon">🎁</span>
                    <span>Generate Code</span>
                </button>
                <button class="action-btn secondary" onclick="verifyGroupJoin()">
                    <span class="icon">👥</span>
                    <span>Join Group</span>
                </button>
                <button class="action-btn success" onclick="showWithdraw()">
                    <span class="icon">💰</span>
                    <span>Withdraw</span>
                </button>
            </div>

            <!-- Code Generation Section -->
            <div class="section" id="codeSection" style="display: none;">
                <h3>Your Verification Code</h3>
                <div class="code-display" id="generatedCode">Loading...</div>
                <div class="code-info">
                    <p>✅ Valid for: <strong>2 hours</strong></p>
                    <p>🎯 Points: <strong>2 points</strong></p>
                </div>
                <button class="btn copy-btn" onclick="copyCode()">Copy Code</button>
                <button class="btn secondary-btn" onclick="hideCodeSection()">Close</button>
            </div>

            <!-- Verification Section -->
            <div class="section" id="verifySection">
                <h3>Verify Code</h3>
                <div class="input-group">
                    <input type="text" id="verifyCodeInput" placeholder="Enter 6-digit code" maxlength="6">
                    <button class="btn primary-btn" onclick="verifyCode()">Verify</button>
                </div>
            </div>

            <!-- Withdrawal Section -->
            <div class="section" id="withdrawSection" style="display: none;">
                <h3>Withdraw Points</h3>
                <div class="withdraw-info">
                    <p>Minimum withdrawal: <strong>500 Points ($5 USD)</strong></p>
                    <p>Your balance: <strong id="withdrawBalance">0</strong> Points</p>
                </div>
                <div class="input-group">
                    <input type="number" id="withdrawAmount" placeholder="Enter amount (min 500)">
                    <button class="btn success-btn" onclick="submitWithdrawal()">Submit Request</button>
                </div>
                <button class="btn secondary-btn" onclick="hideWithdrawSection()">Cancel</button>
            </div>

            <!-- Stats Section -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value" id="totalEarned">0</div>
                    <div class="stat-label">Total Earned</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="availableBalance">0</div>
                    <div class="stat-label">Available Points</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">Unlimited</div>
                    <div class="stat-label">Daily Earnings</div>
                </div>
            </div>

            <!-- Referral Section -->
            <div class="section referral-section">
                <h3>Invite Friends & Earn</h3>
                <p>Share your referral link and earn <strong>5 points</strong> for each friend who joins!</p>
                <div class="referral-link">
                    <input type="text" id="referralLink" readonly>
                    <button class="btn primary-btn" onclick="copyReferralLink()">Copy Link</button>
                </div>
            </div>
        </main>

        <!-- Notification System -->
        <div id="notification" class="notification hidden">
            <span id="notificationMessage"></span>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
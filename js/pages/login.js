import { AuthService } from '../services/AuthService.js';
import { AuthenticationError } from '../models/AuthenticationError.js';
class LoginPage {
    authService;
    loginForm;
    usernameInput;
    passwordInput;
    loginError;
    signInButton;
    constructor() {
        this.authService = new AuthService();
        this.loginForm = this.getElement("#login-form");
        this.usernameInput = this.getElement("#username");
        this.passwordInput = this.getElement("#password");
        this.loginError = this.getElement("#login-error");
        this.signInButton = this.getElement("#sign-in-button");
        this.initialize();
    }
    /**
     * Initialize login page events.
     */
    initialize() {
        this.loginForm.addEventListener("submit", (event) => {
            void this.handleLogin(event);
        });
        document.querySelector("#forgot-password-link")
            ?.addEventListener("click", (event) => {
            event.preventDefault();
            this.showError("Password recovery is not available yet.");
        });
        document.querySelector("#create-account-link")
            ?.addEventListener("click", (event) => {
            event.preventDefault();
            this.showError("Account registration is not available yet.");
        });
    }
    /**
     * Handle form submission.
     */
    async handleLogin(event) {
        event.preventDefault();
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        this.clearError();
        if (!username || !password) {
            this.showError("Please enter your username and password.");
            return;
        }
        try {
            this.setLoading(true);
            await this.authService.login({
                username,
                password
            });
            // Authentication successful.
            window.location.assign("./dashboard.html");
        }
        catch (error) {
            if (error instanceof AuthenticationError) {
                this.showError(error.message);
            }
            else {
                this.showError("An unexpected error occurred. Please try again.");
                console.error("Login failed:", error);
            }
        }
        finally {
            this.setLoading(false);
        }
    }
    /**
     * Display an error to the user.
     */
    showError(message) {
        this.loginError.textContent = message;
        this.loginError.hidden = false;
    }
    /**
     * Hide the current error.
     */
    clearError() {
        this.loginError.textContent = "";
        this.loginError.hidden = true;
    }
    /**
     * Update the submit button while authenticating.
     */
    setLoading(loading) {
        this.signInButton.disabled = loading;
        this.signInButton.textContent = loading
            ? "Signing in..."
            : "Sign in →";
    }
    /**
     * Find a required HTML element.
     */
    getElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Required element not found: ${selector}`);
        }
        return element;
    }
}
// Start the login page once the HTML has loaded.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
        new LoginPage();
    });
}
else {
    new LoginPage();
}

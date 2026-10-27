
import { AuthService } from '../services/AuthService.js'
import { AuthenticationError } from '../models/AuthenticationError.js'

class LoginPage {

    private readonly authService: AuthService;

    private readonly loginForm: HTMLFormElement;
    private readonly usernameInput: HTMLInputElement;
    private readonly passwordInput: HTMLInputElement;
    private readonly loginError: HTMLElement;
    private readonly signInButton: HTMLButtonElement;

    constructor() {

        this.authService = new AuthService();

        this.loginForm = this.getElement<HTMLFormElement>(
            "#login-form"
        );

        this.usernameInput = this.getElement<HTMLInputElement>(
            "#username"
        );

        this.passwordInput = this.getElement<HTMLInputElement>(
            "#password"
        );

        this.loginError = this.getElement<HTMLElement>(
            "#login-error"
        );

        this.signInButton = this.getElement<HTMLButtonElement>(
            "#sign-in-button"
        );

        this.initialize();
    }

    /**
     * Initialize login page events.
     */
    private initialize(): void {

        this.loginForm.addEventListener(
            "submit",
            (event: SubmitEvent) => {
                void this.handleLogin(event);
            }
        );

        document.querySelector("#forgot-password-link")
            ?.addEventListener("click", (event) => {
                event.preventDefault();
                this.showError(
                    "Password recovery is not available yet."
                );
            });

        document.querySelector("#create-account-link")
            ?.addEventListener("click", (event) => {
                event.preventDefault();
                this.showError(
                    "Account registration is not available yet."
                );
            });
    }

    /**
     * Handle form submission.
     */
    private async handleLogin(
        event: SubmitEvent
    ): Promise<void> {

        event.preventDefault();

        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        this.clearError();

        if (!username || !password) {
            this.showError(
                "Please enter your username and password."
            );
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

        } catch (error: unknown) {

            if (error instanceof AuthenticationError) {
                this.showError(error.message);
            } else {
                this.showError(
                    "An unexpected error occurred. Please try again."
                );
                console.error("Login failed:", error);
            }

        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Display an error to the user.
     */
    private showError(message: string): void {

        this.loginError.textContent = message;
        this.loginError.hidden = false;
    }

    /**
     * Hide the current error.
     */
    private clearError(): void {

        this.loginError.textContent = "";
        this.loginError.hidden = true;
    }

    /**
     * Update the submit button while authenticating.
     */
    private setLoading(loading: boolean): void {

        this.signInButton.disabled = loading;

        this.signInButton.textContent = loading
            ? "Signing in..."
            : "Sign in →";
    }

    /**
     * Find a required HTML element.
     */
    private getElement<T extends HTMLElement>(
        selector: string
    ): T {

        const element = document.querySelector<T>(selector);

        if (!element) {
            throw new Error(
                `Required element not found: ${selector}`
            );
        }

        return element;
    }
}

// Start the login page once the HTML has loaded.
if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", () => {
        new LoginPage();
    });

} else {

    new LoginPage();
}

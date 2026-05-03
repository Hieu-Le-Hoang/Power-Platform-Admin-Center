import { LOG_SIGNIN_URL, GOOGLE_SHEETS_API_KEY, SPREADSHEET_ID, ACCOUNT_SHEET_NAME } from '../constants';

/**
 * Verifies user credentials by reading directly from a Google Sheet.
 * Note: This method exposes the API key on the client-side.
 * @param password The user's password.
 * @returns A promise that resolves to true if credentials are valid, false otherwise.
 */
export const verifyCredentials = async (password: string): Promise<boolean> => {
    if (!password) {
        return false;
    }

    // Fix: Corrected a typo in the SPREADSHEET_ID constant.
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${ACCOUNT_SHEET_NAME}?key=${GOOGLE_SHEETS_API_KEY}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google Sheets API Error:', errorData);
            throw new Error(`Failed to fetch credentials from Google Sheets. Status: ${response.status}`);
        }

        const data = await response.json();
        const rows: string[][] = data.values;

        if (!rows || rows.length < 2) {
            console.error("Account sheet is empty or has no header.");
            return false;
        }

        const header = rows[0].map(h => h.toLowerCase());
        const dataRows = rows.slice(1);

        const appColIndex = header.indexOf('app');
        const passwordColIndex = header.indexOf('password');

        if (appColIndex === -1 || passwordColIndex === -1) {
            console.error("Could not find 'App' or 'Password' columns in the sheet.");
            return false;
        }

        // Find if there's any matching row for the app and password
        const isValid = dataRows.some(row =>
            row[appColIndex]?.trim() === 'Power Platform Admin Center' &&
            row[passwordColIndex]?.trim() === password
        );

        return isValid;

    } catch (error) {
        console.error("Error during credential verification:", error);
        // Re-throw to be caught in the UI component for user feedback
        throw new Error('Could not connect to the authentication service.');
    }
};

/**
 * Logs a sign-in event by calling a secure Power Automate flow.
 * This approach avoids exposing client secrets or handling complex OAuth flows on the frontend.
 * @param email The email of the user who signed in.
 */
export const logSignIn = async (email: string): Promise<void> => {
    if (!LOG_SIGNIN_URL || LOG_SIGNIN_URL.includes('your-flow-id')) {
        // Throw a specific, catchable error if the URL is not configured.
        throw new Error('LOG_URL_NOT_CONFIGURED');
    }
    
    try {
        const response = await fetch(LOG_SIGNIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, app: 'Power Platform Admin Center' }),
        });

        if (!response.ok) {
            // Power Automate might return a 202 (Accepted) for async flows, which is fine.
            // We only care about actual errors (4xx, 5xx).
            if (response.status >= 400) {
                 const errorText = await response.text();
                 throw new Error(`Sign-in logging flow failed with status ${response.status}. Details: ${errorText}`);
            }
        }
        console.log("Sign-in log request sent successfully.");
    } catch (error) {
        console.error("Failed to call the sign-in logging flow:", error);
        // We re-throw so the UI can be aware, but the login process should continue.
        throw error;
    }
};
# How to Get Google OAuth Credentials

To fix the "invalid_client" error, you need to generate a valid Client ID and Client Secret from Google.

## Steps:

1.  **Go to Google Cloud Console:**
    Visit [https://console.cloud.google.com/](https://console.cloud.google.com/) and sign in with your Google account.

2.  **Create a New Project:**
    *   Click on the project dropdown at the top left (next to the Google Cloud logo).
    *   Click **New Project**.
    *   Give it a name (e.g., "StationeryShop") and click **Create**.

3.  **Configure OAuth Consent Screen:**
    *   In the left sidebar, go to **APIs & Services** > **OAuth consent screen**.
    *   Select **External** (unless you have a Google Workspace organization) and click **Create**.
    *   Fill in the **App Information** (App name, support email).
    *   Add your email in **Developer contact information**.
    *   Click **Save and Continue** (you can skip Scopes and Test Users for now, or add your email as a Test User).

4.  **Create Credentials:**
    *   In the sidebar, click **Credentials**.
    *   Click **+ CREATE CREDENTIALS** (at the top) > **OAuth client ID**.
    *   **Application type:** Select **Web application**.
    *   **Name:** Enter a name (e.g., "Stationery Web Client").
    *   **Authorized JavaScript origins:**
        *   Add: `http://localhost:5173`
    *   **Authorized redirect URIs:**
        *   Add: `http://localhost:5000/api/auth/google/callback`
        *   (This matches the `GOOGLE_CALLBACK_URL` in your `.env` file).
    *   Click **Create**.

5.  **Copy Credentials:**
    *   A popup will show your **Client ID** and **Client Secret**.
    *   Copy these strings.

6.  **Update `.env` file:**
    *   Open `d:\Stationary\server\.env`.
    *   Paste the Client ID as `GOOGLE_CLIENT_ID`.
    *   Paste the Client Secret as `GOOGLE_CLIENT_SECRET`.
    *   Save the file.

7.  **Restart Server:**
    *   Stop the running server (Ctrl+C).
    *   Run `node index.js` again.

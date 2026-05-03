import { fetchAccessToken } from './dataverseService';

export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    try {
        const token = await fetchAccessToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            ...options.headers,
        };

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorText}`);
        }

        return response;
    } catch (error) {
        console.error("Authenticated fetch failed:", error);
        throw error;
    }
};

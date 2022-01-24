import { Config } from "./utils";
import fetch from 'node-fetch';


export async function getProfileInfo(accessToken: string) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo?fields=given_name,email,picture,id,verified_email', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (response.status != 200) throw new Error('Error: Failed to get user information');

    return await response.json();
}

export async function getAccessToken(config: Config, code: string): Promise<string> {
    const params = new URLSearchParams();
    params.set("client_id", config.GOAUTH_CLIENT_ID);
    params.set("client_secret", config.GOAUTH_CLIENT_SECRET);
    params.set("redirect_uri", config.GOAUTH_REDIRECT_URI);
    params.set("code", code);
    params.set("grant_type", "authorization_code");

    const response = await fetch('https://www.googleapis.com/oauth2/v4/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
    });

    if (response.status != 200) {
        console.error(await response.text());
        throw new Error('Error: Failed to receive access token');
    }

    const json: any = await response.json();
    return json.access_token;
}

export function getAuthUrl(config: Config) {
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');

    url.searchParams.set('scope', 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('access_type', 'online');
    url.searchParams.set('redirect_uri', config.GOAUTH_REDIRECT_URI);
    url.searchParams.set('client_id', config.GOAUTH_CLIENT_ID);

    return url.toString();
}
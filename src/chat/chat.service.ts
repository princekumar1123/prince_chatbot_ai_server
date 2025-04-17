// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class ChatService {
//     constructor(
//         private http: HttpService,
//         private config: ConfigService,
//       ) {}

//       async askGemini(prompt: string): Promise<string> {
//         const apiKey = this.config.get<string>('GEMINI_API_KEY');
//         console.log("apiKey",apiKey);

//         const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyAIUs6GZVNjpa1ohnHhHJl-aLE-fCrd5lk`;

//         const body = {
//           contents: [
//             {
//               parts: [{ text: prompt }],
//             },
//           ],
//         };

//         const response = await firstValueFrom(this.http.post(url, body));
//         const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//         return text || 'No response from Gemini.';
//       }

// }


// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { firstValueFrom } from 'rxjs';

// @Injectable()
// export class ChatService { 
//     constructor(
//         private readonly http: HttpService,
//         private readonly config: ConfigService,
//     ) { }

//     async askGemini(prompt: string): Promise<string> {
//         const apiKey = this.config.get<string>('GEMINI_API_KEY');
//         const apiKey1 = this.config.get<string>('GEMINI_API_KEY1');
//         const apiKey2 = this.config.get<string>('GEMINI_API_KEY2');
//         const apiKey3 = this.config.get<string>('GEMINI_API_KEY3');

//         const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey3}`;


//         const body = {
//             contents: [
//                 {
//                     parts: [
//                         {
//                             text: prompt,
//                         },
//                     ],
//                 },
//             ],
//         };

//         try {
//             const response = await firstValueFrom(
//                 this.http.post(url, body, {
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                 }),
//             );

//             const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//             return reply || '🤖 No reply from Prince ChatBotAI.';
//         } catch (error) {
//             console.error('❌ Prince ChatBotAI Error:', JSON.stringify(error.response?.data || error.message, null, 2));
//             throw new Error('Failed to fetch Prince ChatBotAI response.');
//         }
//     }
// }







// import { Injectable } from '@nestjs/common';
// import { HttpService } from '@nestjs/axios';
// import { ConfigService } from '@nestjs/config';
// import { firstValueFrom } from 'rxjs';
// import { AxiosError } from 'axios';

// @Injectable()
// export class ChatService {
//     private readonly apiKeys: any[];

//     constructor(
//         private readonly http: HttpService,
//         private readonly config: ConfigService,
//     ) {
//         this.apiKeys = [
//             this.config.get<string>('GEMINI_API_KEY'),
//             this.config.get<string>('GEMINI_API_KEY1'),
//             this.config.get<string>('GEMINI_API_KEY2'),
//             this.config.get<string>('GEMINI_API_KEY3'),
//         ];
//     }

//     private lastUsedKeyIndex = 0;

//     async askGemini(prompt: string): Promise<string> {
//         const body = {
//             contents: [
//                 {
//                     parts: [{ text: prompt }],
//                 },
//             ],
//         };

//         const totalKeys = this.apiKeys.length;
//         for (let i = 0; i < totalKeys; i++) {
//             const currentIndex = (this.lastUsedKeyIndex + i) % totalKeys;
//             const apiKey = this.apiKeys[currentIndex];
//             const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

//             try {
//                 const response = await firstValueFrom(
//                     this.http.post(url, body, {
//                         headers: { 'Content-Type': 'application/json' },
//                     }),
//                 );

//                 const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//                 this.lastUsedKeyIndex = currentIndex; // Update last used index
//                 console.log(`✅ Using API key index: ${currentIndex}`);
//                 return reply || '🤖 No reply from Prince ChatBotAI.';
//             } catch (error) {
//                 const axiosError = error as AxiosError;
//                 if (axiosError.response?.status === 429) {
//                     console.warn(`⚠️ Rate limit hit on key index ${currentIndex}. Trying next...`);
//                     continue;
//                 }

//                 console.error('❌ Gemini Error:', JSON.stringify(axiosError.response?.data || axiosError.message, null, 2));
//                 throw new Error('Failed to fetch Prince ChatBotAI response.');
//             }
//         }

//         throw new Error('⛔ All Gemini API keys exceeded the rate limit. Please try again later.');
//     }


import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService {
    private apiKeys: any[] | string[] = [];
    private rateLimitMap: {
        [key: string]: { count: number; lastReset: number };
    } = {};

    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {
        this.apiKeys = [
            this.config.get<string>('GEMINI_API_KEY'),
            this.config.get<string>('GEMINI_API_KEY1'),
            this.config.get<string>('GEMINI_API_KEY2'),
            this.config.get<string>('GEMINI_API_KEY3'),
        ];

        this.apiKeys.forEach(key => {
            this.rateLimitMap[key] = { count: 0, lastReset: Date.now() };
        });
    }

    async askGemini(prompt: string): Promise<string> {
        const body = {
            contents: [
                {
                    parts: [{ text: prompt }],
                },
            ],
        };

        for (const key of this.apiKeys) {
            const rate = this.rateLimitMap[key];
            const now = Date.now();

            if (now - rate.lastReset > 60 * 1000) {
                rate.count = 0;
                rate.lastReset = now;
            }

            if (rate.count < 15) {
                try {
                    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
                    const response = await firstValueFrom(
                        this.http.post(url, body, {
                            headers: { 'Content-Type': 'application/json' },
                        }),
                    );

                    rate.count++;
                    console.log(`✅ Used key: ${key} | Hit count: ${rate.count}/15`);

                    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
                    return reply || '🤖 No reply from Prince ChatBotAI.';
                } catch (error) {
                    console.error(`❌ Error with key ${key}:`, JSON.stringify(error.response?.data || error.message, null, 2));
                }
            } else {
                console.warn(`⚠️ Skipping key ${key} (rate limit reached).`);
            }
        }

        throw new Error('⛔ All API keys hit their rate limits. Please wait a minute.');
    }
}



// async askGemini(prompt: string): Promise<string> {
//     const body = {
//         contents: [
//             {
//                 parts: [
//                     {
//                         text: prompt,
//                     },
//                 ],
//             },
//         ],
//     };

//     for (const apiKey of this.apiKeys) {
//         const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
//         try {
//             const response = await firstValueFrom(
//                 this.http.post(url, body, {
//                     headers: { 'Content-Type': 'application/json' },
//                 }),
//             );

//             const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
//             return reply || '🤖 No reply from Prince ChatBotAI.';
//         } catch (error) {
//             const axiosError = error as AxiosError;

//             // Check if it's a rate limit error (429 Too Many Requests)
//             if (axiosError.response?.status === 429) {
//                 console.warn(`⚠️ API key rate limit hit. Trying next key...`);
//                 continue; // Try the next API key
//             }

//             // If it's another type of error, break and throw
//             console.error('❌ Prince ChatBotAI Error:', JSON.stringify(axiosError.response?.data || axiosError.message, null, 2));
//             throw new Error('Failed to fetch Prince ChatBotAI response.');
//         }
//     }

//     // If all keys fail due to rate limits
//     throw new Error('⛔ All Gemini API keys exceeded the rate limit. Please try again later.');
// }
// }

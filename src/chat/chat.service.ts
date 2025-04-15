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
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ChatService { 
    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) { }

    async askGemini(prompt: string): Promise<string> {
        const apiKey = this.config.get<string>('GEMINI_API_KEY');
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;


        const body = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        };

        try {
            const response = await firstValueFrom(
                this.http.post(url, body, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }),
            );

            const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
            return reply || '🤖 No reply from Gemini.';
        } catch (error) {
            console.error('❌ Gemini Error:', JSON.stringify(error.response?.data || error.message, null, 2));
            throw new Error('Failed to fetch Gemini response.');
        }
    }
}

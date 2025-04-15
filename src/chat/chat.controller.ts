import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';



@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    async getReply(@Body('prompt') prompt: string) {
        const reply = await this.chatService.askGemini(prompt);
        return { reply };
    }
}

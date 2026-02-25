import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post()
    async sendContactMessage(@Body() body: { nombre: string; correo: string; telefono: string; motivoMensaje: string; descripcion: string }) {
        return this.contactService.sendContactMessage(body);
    }
}

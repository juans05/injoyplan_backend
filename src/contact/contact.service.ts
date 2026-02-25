import { Injectable } from '@nestjs/common';
import { EmailService } from '../auth/email.service';

@Injectable()
export class ContactService {
    constructor(private readonly emailService: EmailService) { }

    async sendContactMessage(data: { nombre: string; correo: string; telefono: string; motivoMensaje: string; descripcion: string }) {
        await this.emailService.sendContactEmail({
            nombre: data.nombre,
            correo: data.correo,
            telefono: data.telefono,
            motivo: data.motivoMensaje,
            descripcion: data.descripcion
        });
        return { success: true, message: 'Mensaje enviado correctamente' };
    }
}

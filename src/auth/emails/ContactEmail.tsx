import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components';
import * as React from 'react';

interface ContactEmailProps {
    nombre: string;
    correo: string;
    telefono: string;
    motivo: string;
    descripcion: string;
}

export const ContactEmail = ({
    nombre,
    correo,
    telefono,
    motivo,
    descripcion,
}: ContactEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Nuevo mensaje de contacto de {nombre}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Img
                            src={`https://injoyplan.com/logo.png`} // Replace with actual hosted logo URL if available, or just text
                            alt="Injoyplan"
                            width="150"
                            height="auto"
                            style={logo}
                        />
                    </Section>
                    <Heading style={h1}>Nuevo Mensaje de Contacto</Heading>
                    <Text style={text}>
                        Hola Admin, has recibido un nuevo mensaje desde el formulario de contacto.
                    </Text>

                    <Section style={box}>
                        <Text style={paragraph}>
                            <strong style={label}>Nombre:</strong> {nombre}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Correo:</strong> <a href={`mailto:${correo}`} style={link}>{correo}</a>
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Teléfono:</strong> {telefono}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Motivo:</strong> {motivo}
                        </Text>
                        <Hr style={hr} />
                        <Text style={paragraph}>
                            <strong style={label}>Mensaje:</strong>
                        </Text>
                        <Text style={messageContent}>
                            {descripcion}
                        </Text>
                    </Section>

                    <Text style={footer}>
                        Injoyplan - Plataforma de Eventos
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ContactEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    padding: '20px 0',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px',
    marginBottom: '64px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: '600px',
};

const logoContainer = {
    textAlign: 'center' as const,
    marginBottom: '32px',
};

const logo = {
    margin: '0 auto',
};

const h1 = {
    color: '#212121',
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: '0 0 24px',
};

const text = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
    marginBottom: '24px',
};

const box = {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
};

const paragraph = {
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0 0 12px',
    color: '#333',
};

const label = {
    color: '#277FA4',
    fontWeight: '600',
};

const link = {
    color: '#277FA4',
    textDecoration: 'none',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const messageContent = {
    fontSize: '15px',
    lineHeight: '26px',
    color: '#555',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid #e6ebf1',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '32px',
};

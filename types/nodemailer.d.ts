declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user?: string;
      pass?: string;
    };
  }

  export interface MailOptions {
    from?: string;
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    attachments?: Array<{
      filename?: string;
      content?: Buffer | string;
    }>;
  }

  export interface Transporter {
    sendMail(mailOptions: MailOptions): Promise<{ messageId: string }>;
  }

  export function createTransport(options: TransportOptions): Transporter;
  
  const nodemailer: {
    createTransport: typeof createTransport;
  };
  
  export default nodemailer;
}

// Export types as a namespace for access via nodemailer.Transporter
declare namespace nodemailer {
  export type Transporter = import('nodemailer').Transporter;
}


import * as nodeMailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { EmailTransfer } from '../model/email.transfer';
import Mail from 'nodemailer/lib/mailer';
import { Transporter } from 'nodemailer';
import SMTPPool from 'nodemailer/lib/smtp-pool';

export class MailerService {
  constructor(private readonly configService: ConfigService) {}

  private nodeMailerTransporter: Transporter<
    SMTPPool.SentMessageInfo,
    SMTPPool.Options
  >;

  mailerTransporter() {
    if (!this.nodeMailerTransporter) {
      this.nodeMailerTransporter = nodeMailer.createTransport({
        host: this.configService.get<string>('NODE_MAILER_HOST'),
        port: this.configService.get<string>('NODE_MAILER_PORT'),
        secure: this.configService.get<string>('NODE_MAILER_IS_SECURE'), // true for port 465, false for other ports
        auth: {
          user: this.configService.get<string>('NODE_MAILER_USERNAME'),
          pass: this.configService.get<string>('NODE_MAILER_PASSWORD'),
        },
      });
    }
    return this.nodeMailerTransporter;
  }

  async dispatchMailTransfer(emailTransfer: EmailTransfer) {
    const nodeMailerTransporter = this.mailerTransporter();
    const mailOptions: Mail.Options = {
      from: emailTransfer.from ?? {
        name: this.configService.get<string>('NODE_MAILER_APP_NAME'),
        address: this.configService.get<string>('NODE_MAILER_DEFAULT_ADDRESS'),
      },
      to: emailTransfer.recipients,
      subject: emailTransfer.subject,
      html: emailTransfer.html,
    };
    try {
      return await nodeMailerTransporter.sendMail(mailOptions);
    } catch (err) {
      console.log(err);
    }
  }
}

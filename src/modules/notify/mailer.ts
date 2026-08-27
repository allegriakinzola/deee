import "server-only"

import nodemailer from "nodemailer"

import { getSmtpConfig } from "@/platform/env"

type MailMessage = {
  to: string
  subject: string
  text: string
  html: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const smtp = getSmtpConfig()
    transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      requireTLS: smtp.port === 587,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    })
  }
  return transporter
}

export async function sendMail(message: MailMessage): Promise<void> {
  const smtp = getSmtpConfig()
  await getTransporter().sendMail({
    from: smtp.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  })
}

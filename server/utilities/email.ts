import nodemailer from 'nodemailer';

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAILUSER, // generated ethereal user
    pass: process.env.EMAILPASS, // generated ethereal password
  },
});

interface EmailObjBasicType {
  from?: string,
  to: string,
  subject: string,
}

interface EmailTextType extends EmailObjBasicType {
  text: string
}

interface EmailHTMLType extends EmailObjBasicType {
  html: string
}

const SendEmail = (obj: EmailTextType | EmailHTMLType) => {
  // eslint-disable-next-line no-param-reassign
  obj.from = obj.from || 'no-reply@ballstreet.com';
  return transporter.sendMail(obj);
};

export function SendVerifyEmail(email: string, link: string) {
  const text = `Please click the following link to verify your account: ${link}`;
  return SendEmail({
    to: email,
    subject: 'Verify your Ball Street account',
    text,
  });
}

export function SendForgotEmail(email: string, link: string) {
  const text = `Please click the following link to reset your password: ${link}`;
  return SendEmail({
    to: email,
    subject: 'Reset your Ball Street password',
    text,
  });
}

export function SendWithdrawEmail(email: string, ledgerID: string) {
  const text = `Your withdrawal to Ball Street has been confirmed. Your transaction ID is ${ledgerID}`;
  return SendEmail({
    to: email,
    subject: 'Your Ball Street withdrawal has been confirmed',
    text,
  });
}

export function SendDepositEmail(email: string, ledgerID: string) {
  const text = `Your deposit to Ball Street has been confirmed. Your transaction ID is ${ledgerID}`;
  return SendEmail({
    to: email,
    subject: 'Your Ball Street withdrawal has been confirmed',
    text,
  });
}

export function SendEntryEmail(email: string, contestName: string, ledgerID: string) {
  const text = `Your entry into '${contestName}' has been confirmed. 
  Your transaction ID is ${ledgerID}`;
  return SendEmail({
    to: email,
    subject: 'Your Ball Street contest entry has been confirmed',
    text,
  });
}

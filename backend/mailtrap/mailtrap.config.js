import dotenv, { configDotenv } from "dotenv"
import { MailtrapClient } from "mailtrap" 
dotenv.config();


export const mailtrapClient = new MailtrapClient({
  token: process.env.MAILTRAP_TOKEN,
});

export const  sender = {
  email: "hello@demomailtrap.co",
  name: "aziz",
};



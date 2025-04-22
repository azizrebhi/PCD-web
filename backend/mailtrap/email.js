import { mailtrapClient, sender } from "./mailtrap.config.js";
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE ,PASSWORD_RESET_SUCCESS_TEMPLATE} from  "./emailtemplates.js";

export const sendVerificationSetCookie = async (email, verificationToken) => {
    const recipient = [{ email }]
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category:"EmailVerification"
            
        })
        console.log("emailsent successfully", response);
    } catch (error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Errorsending verification email :${error}`);
    }
}
export const sendWelcomeEmail = async (email, name) => {
    const recipient = [{ email }];
    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "ba62ff6d-594b-4245-a369-cefa895269e8",
            template_variables: {
                "company_info_name": "Auth Company",
                "name": name,
            }
        });
        console.log("Welcomeemail sent successfully", response);
    } catch (error) {
                console.log("error sending email", error);
        throw new Error(`Error sending welcome email:${error}`);
    }
}
export const sendPasswordResetEmail = async (email, resetURL) => {
    const recipient = [{ email }];
    try { 
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}",resetURL),
            category: "password Reset",
            
        });
    } catch (error){
        console.error(`Error sending password reset email`, error);
        throw new Error(`Error sending password reset email:${error}`);
    }
};
export const sendResetSuccessfulEmail  = async (email)=>{
    const recipient =[{email}];
    try {
        const response = await mailtrapClient.send({
            from:sender,
            to:recipient,
            subject:"password Reset Successful",
            html:PASSWORD_RESET_SUCCESS_TEMPLATE,
            category:"password reset "
        });
        console.log("passwordreset emailsent successfully", response);

    }catch(error){
        console.error(`Errorsending password reset success email`,error);
        throw new Error(`Errorsending password reset success email:${error}`);
    }
}
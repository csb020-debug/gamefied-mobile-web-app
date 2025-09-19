// Email service utilities for sending teacher invitations
// In a real application, you would integrate with an email service like SendGrid, Resend, or AWS SES

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface TeacherInvitationEmail {
  teacherEmail: string;
  schoolName: string;
  invitationLink: string;
  expiresAt: string;
  invitedBy: string;
}

export const createTeacherInvitationEmail = (data: TeacherInvitationEmail): EmailTemplate => {
  const { teacherEmail, schoolName, invitationLink, expiresAt, invitedBy } = data;
  
  const subject = `You're invited to join ${schoolName} as a teacher`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Teacher Invitation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .school-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Teacher Invitation</h1>
          <p>Join ${schoolName} as a teacher</p>
        </div>
        <div class="content">
          <h2>Hello!</h2>
          <p>You've been invited by <strong>${invitedBy}</strong> to join <strong>${schoolName}</strong> as a teacher on our gamified learning platform.</p>
          
          <div class="school-info">
            <h3>🏫 About ${schoolName}</h3>
            <p>Join our educational community and help students learn through engaging, gamified experiences.</p>
          </div>
          
          <p>As a teacher, you'll be able to:</p>
          <ul>
            <li>Create and manage classes</li>
            <li>Design engaging assignments and challenges</li>
            <li>Track student progress and achievements</li>
            <li>Foster collaboration through discussions and group activities</li>
            <li>Enable peer reviews and social learning</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Accept Invitation</a>
          </div>
          
          <p><strong>Important:</strong> This invitation will expire on ${new Date(expiresAt).toLocaleDateString()} at ${new Date(expiresAt).toLocaleTimeString()}.</p>
          
          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>This invitation was sent from our gamified learning platform.</p>
          <p>If the button doesn't work, copy and paste this link: ${invitationLink}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `
Teacher Invitation - ${schoolName}

Hello!

You've been invited by ${invitedBy} to join ${schoolName} as a teacher on our gamified learning platform.

As a teacher, you'll be able to:
- Create and manage classes
- Design engaging assignments and challenges
- Track student progress and achievements
- Foster collaboration through discussions and group activities
- Enable peer reviews and social learning

Accept your invitation: ${invitationLink}

Important: This invitation will expire on ${new Date(expiresAt).toLocaleDateString()} at ${new Date(expiresAt).toLocaleTimeString()}.

If you didn't expect this invitation, you can safely ignore this email.

This invitation was sent from our gamified learning platform.
  `;
  
  return {
    to: teacherEmail,
    subject,
    html,
    text
  };
};

// Placeholder function for sending emails
// In a real application, you would integrate with an email service
export const sendEmail = async (emailTemplate: EmailTemplate): Promise<{ success: boolean; error?: string }> => {
  try {
    // For development, we'll just log the email
    console.log('📧 Email would be sent:', {
      to: emailTemplate.to,
      subject: emailTemplate.subject,
      preview: emailTemplate.text.substring(0, 200) + '...'
    });
    
    // In production, you would use an email service like:
    // - SendGrid: await sgMail.send(emailTemplate)
    // - Resend: await resend.emails.send(emailTemplate)
    // - AWS SES: await ses.sendEmail(emailTemplate)
    
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Function to send teacher invitation email
export const sendTeacherInvitationEmail = async (data: TeacherInvitationEmail): Promise<{ success: boolean; error?: string }> => {
  const emailTemplate = createTeacherInvitationEmail(data);
  return await sendEmail(emailTemplate);
};

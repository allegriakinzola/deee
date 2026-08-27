export function invitationEmail(input: {
  displayName: string
  roleLabel: string
  invitationUrl: string
  invitedByName?: string
}): { subject: string; text: string; html: string } {
  const subject = "Activez votre compte DEEE Kinshasa"
  const introText = input.invitedByName
    ? `${input.invitedByName} vous invite à rejoindre DEEE Kinshasa en tant que ${input.roleLabel}.`
    : "Vous avez demandé un compte DEEE Kinshasa. Choisissez votre mot de passe pour l’activer."
  const introHtml = input.invitedByName
    ? `${escapeHtml(input.invitedByName)} vous invite à rejoindre DEEE Kinshasa en tant que <strong>${escapeHtml(input.roleLabel)}</strong>. Choisissez votre mot de passe pour activer l’accès.`
    : "Vous avez demandé un compte DEEE Kinshasa. Choisissez votre mot de passe pour l’activer."
  const text = [
    `Bonjour ${input.displayName},`,
    "",
    introText,
    "",
    "Pour activer votre compte, ouvrez ce lien et choisissez votre mot de passe :",
    input.invitationUrl,
    "",
    "Ce lien expire dans 7 jours. Si vous n’attendiez pas ce message, ignorez-le.",
  ].join("\n")

  const html = `<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f4f7f4;font-family:Arial,sans-serif;color:#1f2e24;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7f4;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;">
            <tr>
              <td>
                <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#3d6b4f;">DEEE Kinshasa</p>
                <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;">Activez votre compte</h1>
                <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                  Bonjour ${escapeHtml(input.displayName)},
                </p>
                <p style="margin:0 0 24px;font-size:15px;line-height:1.6;">
                  ${introHtml}
                </p>
                <p style="margin:0 0 28px;">
                  <a href="${escapeHtml(input.invitationUrl)}" style="display:inline-block;background:#c6ebc9;color:#1f2e24;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:12px;">
                    Activer mon compte
                  </a>
                </p>
                <p style="margin:0;font-size:12px;line-height:1.5;color:#5b6b60;">
                  Lien valable 7 jours. Si le bouton ne fonctionne pas, copiez cette adresse :<br />
                  ${escapeHtml(input.invitationUrl)}
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, text, html }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

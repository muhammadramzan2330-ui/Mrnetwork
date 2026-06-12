export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ sent: false, status: 'method_not_allowed' });
  }

  const { to, message, type, userId } = req.body || {};

  if (!to || !message) {
    return res.status(400).json({
      sent: false,
      status: 'missing_fields',
      error: 'Phone number and message are required'
    });
  }

  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const sender = process.env.SMS_SENDER || 'MNETWORK';

  if (!apiUrl || !apiKey) {
    return res.status(200).json({
      sent: false,
      status: 'not_configured',
      error: 'SMS gateway is not configured on Vercel'
    });
  }

  try {
    const gatewayResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        to,
        message,
        sender,
        type,
        userId
      })
    });

    const rawText = await gatewayResponse.text();
    let data: any = rawText;

    try {
      data = rawText ? JSON.parse(rawText) : {};
    } catch {
      data = { raw: rawText };
    }

    if (!gatewayResponse.ok) {
      return res.status(502).json({
        sent: false,
        status: 'gateway_error',
        gatewayStatus: gatewayResponse.status,
        data
      });
    }

    return res.status(200).json({
      sent: true,
      status: 'sent',
      data
    });
  } catch (error: any) {
    return res.status(500).json({
      sent: false,
      status: 'server_error',
      error: error?.message || 'Failed to send SMS'
    });
  }
}

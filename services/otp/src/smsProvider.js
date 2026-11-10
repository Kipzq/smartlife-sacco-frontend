const SMS_ENDPOINT = 'https://api.africastalking.com/version1/messaging';

export function createAfricaTalkingSmsProvider(env = process.env, fetchImpl = fetch) {
  return async function sendSms(phone, message) {
    if (env.SMS_ENABLED !== 'true') {
      throw new Error('SMS delivery is disabled.');
    }
    if (!env.AFRICASTALKING_USERNAME || !env.AFRICASTALKING_API_KEY) {
      throw new Error('Africa’s Talking is not configured.');
    }

    const body = new URLSearchParams({
      username: env.AFRICASTALKING_USERNAME,
      to: phone,
      message,
    });
    if (env.AFRICASTALKING_SENDER_ID) {
      body.set('from', env.AFRICASTALKING_SENDER_ID);
    }

    let response;
    try {
      response = await fetchImpl(SMS_ENDPOINT, {
        method: 'POST',
        headers: {
          apiKey: env.AFRICASTALKING_API_KEY,
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new Error('Africa’s Talking request failed.');
    }

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error('Africa’s Talking returned an invalid response.');
    }

    const recipients = result?.SMSMessageData?.Recipients;
    const accepted = Array.isArray(recipients)
      && recipients.length === 1
      && [101, 102].includes(Number(recipients[0].statusCode));

    if (!response.ok || !accepted) {
      throw new Error('Africa’s Talking did not accept the SMS.');
    }
  };
}

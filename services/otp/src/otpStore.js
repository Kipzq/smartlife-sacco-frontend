const CONSUME_OTP_SCRIPT = `
local stored = redis.call('GET', KEYS[1])
if not stored then
  return 0
end
local attempts = redis.call('INCR', KEYS[2])
if attempts == 1 then
  redis.call('EXPIRE', KEYS[2], tonumber(ARGV[3]))
end
if stored == ARGV[1] then
  redis.call('DEL', KEYS[1], KEYS[2])
  return 1
end
if attempts >= tonumber(ARGV[2]) then
  redis.call('DEL', KEYS[1], KEYS[2])
  return -1
end
return -2
`;

export class MemoryOtpStore {
  #values = new Map();

  #read(key) {
    const entry = this.#values.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.#values.delete(key);
      return undefined;
    }
    return entry.value;
  }

  async incrementWithinWindow(key, ttlSeconds) {
    const current = Number(this.#read(key) || 0) + 1;
    this.#values.set(key, { value: String(current), expiresAt: Date.now() + ttlSeconds * 1000 });
    return current;
  }

  async acquireCooldown(phoneKey, ttlSeconds) {
    const key = `otp:cooldown:${phoneKey}`;
    if (this.#read(key)) return false;
    this.#values.set(key, { value: '1', expiresAt: Date.now() + ttlSeconds * 1000 });
    return true;
  }

  async releaseCooldown(phoneKey) {
    this.#values.delete(`otp:cooldown:${phoneKey}`);
  }

  async setOtp(phoneKey, value, ttlSeconds) {
    this.#values.set(`otp:code:${phoneKey}`, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    this.#values.delete(`otp:attempts:${phoneKey}`);
  }

  async deleteOtp(phoneKey) {
    this.#values.delete(`otp:code:${phoneKey}`);
  }

  async consumeOtp(phoneKey, codeHash, maxAttempts, ttlSeconds) {
    const codeKey = `otp:code:${phoneKey}`;
    const attemptsKey = `otp:attempts:${phoneKey}`;
    const stored = this.#read(codeKey);
    if (!stored) return 'missing';

    const attempts = Number(this.#read(attemptsKey) || 0) + 1;
    this.#values.set(attemptsKey, { value: String(attempts), expiresAt: Date.now() + ttlSeconds * 1000 });

    if (stored === codeHash) {
      this.#values.delete(codeKey);
      this.#values.delete(attemptsKey);
      return 'verified';
    }
    if (attempts >= maxAttempts) {
      this.#values.delete(codeKey);
      this.#values.delete(attemptsKey);
      return 'locked';
    }
    return 'invalid';
  }
}

export function createRedisOtpStore(client) {
  return {
    async incrementWithinWindow(key, ttlSeconds) {
      const count = await client.incr(key);
      if (count === 1) await client.expire(key, ttlSeconds);
      return count;
    },
    async acquireCooldown(phoneKey, ttlSeconds) {
      const result = await client.set(`otp:cooldown:${phoneKey}`, '1', { NX: true, EX: ttlSeconds });
      return result === 'OK';
    },
    async releaseCooldown(phoneKey) {
      await client.del(`otp:cooldown:${phoneKey}`);
    },
    async setOtp(phoneKey, value, ttlSeconds) {
      await client.multi()
        .set(`otp:code:${phoneKey}`, value, { EX: ttlSeconds })
        .del(`otp:attempts:${phoneKey}`)
        .exec();
    },
    async deleteOtp(phoneKey) {
      await client.del(`otp:code:${phoneKey}`);
    },
    async consumeOtp(phoneKey, codeHash, maxAttempts, ttlSeconds) {
      const result = await client.eval(CONSUME_OTP_SCRIPT, {
        keys: [`otp:code:${phoneKey}`, `otp:attempts:${phoneKey}`],
        arguments: [codeHash, String(maxAttempts), String(ttlSeconds)],
      });
      if (result === 1) return 'verified';
      if (result === -1) return 'locked';
      if (result === -2) return 'invalid';
      return 'missing';
    },
  };
}

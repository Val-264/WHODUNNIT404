import { describe, it, expect, vitest } from 'vitest';
import { Server } from '../src/server.js';

vitest.mock('../src/server');

describe('App testing', () => {
  it('should call the server function', async () => {
    await import('../src/app.js');

    expect(Server).toHaveBeenCalledTimes(1);
    expect(Server).toHaveBeenLastCalledWith({
      port: Number(process.env.PORT) || 3000,
      routes: expect.any(Function),
    });

    expect(Server.prototype.start).toHaveBeenCalledTimes(1);
  });
});
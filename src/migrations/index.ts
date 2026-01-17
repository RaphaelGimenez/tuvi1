import * as migration_20260116_211935 from './20260116_211935';

export const migrations = [
  {
    up: migration_20260116_211935.up,
    down: migration_20260116_211935.down,
    name: '20260116_211935'
  },
];

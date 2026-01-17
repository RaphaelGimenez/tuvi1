import * as migration_20260116_211935 from './20260116_211935';
import * as migration_20260117_092924 from './20260117_092924';

export const migrations = [
  {
    up: migration_20260116_211935.up,
    down: migration_20260116_211935.down,
    name: '20260116_211935',
  },
  {
    up: migration_20260117_092924.up,
    down: migration_20260117_092924.down,
    name: '20260117_092924'
  },
];

## Changes

### 1.0.7
- Moved all fixing of RedisClient functions and adaptation of the RedisClient prototype to happen at module load time 
  in order to fix sequencing bugs where promise-returning "Async" functions installed later by `redis-client-cache` 
  were NOT seeing the fixed and adapter functions

### 1.0.5
- Added unit tests to verify `ping` function works as expected

### 1.0.4
- Replaced `getDefaultHost` function with `defaultHost` property
- Replaced `getDefaultPort` function with `defaultPort` property

### 1.0.3
- Added `.npmignore`
- Renamed `release_notes.md` to `CHANGES.md`
- Updated dependencies

### 1.0.2
- Minor updates to .gitignore
- Removed unnecessary `logging-utils` & `deep-equals` dependencies

### 1.0.1
- Updated rcc-core dependency

### 1.0.0
- Initial version
- Added `getDefaultHost` and `getDefaultPort` functions to `rcc-ioredis-adapter` module

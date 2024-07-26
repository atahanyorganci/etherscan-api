# Etherscan API Client

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

`@yorganci/etherscan-api` is [Etherscan API][etherscan-docs] client for Node.js and the browser with zod validation and caching.

## Features

- Validates registry responses using [`zod`](https://github.com/colinhacks/zod).
- Supports response caching with [`unstorage`](https://github.com/unjs/unstorage).
- Compatible with both Node.js and browser environments.
- Works seamlessly with third-party npm-compatible registries.

## Useful Links

- [Etherscan API documentation][etherscan-docs]
- [`ohash` docs](https://github.com/unjs/ohash) for serializing cache keys.
- [`unstorage` drivers](https://unstorage.unjs.io/drivers) for caching layer.

## Usage

Install `@yorganci/etherscan-api` npm package:

```sh
# yarn
yarn add @yorganci/etherscan-api

# npm
npm install @yorganci/etherscan-api

# pnpm
pnpm add @yorganci/etherscan-api
```

## License

[MIT](./LICENSE)

[npm-version-src]: https://img.shields.io/npm/v/@yorganci/etherscan-api?style=for-the-badge&logo=git&label=release
[npm-version-href]: https://npmjs.com/package/@yorganci/etherscan-api
[npm-downloads-src]: https://img.shields.io/npm/dm/@yorganci/etherscan-api?style=for-the-badge&logo=npm
[npm-downloads-href]: https://npmjs.com/package/@yorganci/etherscan-api
[bundle-src]: https://img.shields.io/bundlephobia/minzip/@yorganci/etherscan-api?style=for-the-badge
[bundle-href]: https://bundlephobia.com/result?p=%40yorganci%2Fetherscan-api
[license-src]: https://img.shields.io/github/license/atahanyorganci/etherscan-api.svg?style=for-the-badge
[license-href]: https://github.com/atahanyorganci/etherscan-api/blob/main/LICENSE
[etherscan-docs]: https://docs.etherscan.io/

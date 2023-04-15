# Dashflare

An **unofficial** [Cloudflare](https://www.cloudflare.com/) dashboard built on top of [Cloudflare API](https://api.cloudflare.com).

> This website is an Unofficial control panel for Cloudflare™ and is not associated Cloudflare, Inc. in anyway.
>
> Cloudflare and the Cloudflare logo are trademarks and/or registered trademarks of Cloudflare, Inc. in the United States and other jurisdictions.

## Demo

https://dashflare.skk.moe

## Features

- [x] List all available zones
- [x] Universal SSL
  - [x] Modify Universal SSL CA
  - [x] Update SSL verification methods (CNAME, HTTP, TXT)
- [ ] DNS
  - [x] List DNS records
  - [ ] Edit DNS records
    - [x] Support simple records (A, AAAA, TXT, CNAME)
    - [ ] Support LOC records
    - [ ] Support HTTPS records
    - [ ] Support MX records
    - [ ] Support SRV records
    - [ ] Support other records
  - [x] Delete DNS records
  - [x] Search / Filter DNS records
  - [ ] Purge Cache with extra settings (Country, Vary, CORS Origin)

## Techstack

- [React](https://react.dev)
- [React Router](https://reactrouter.com)
- [SWR](https://swr.vercel.app) - React Hooks for Data Fetching
- [Mantine](https://mantine.dev) - A fully featured React components library

## Build

```sh
git clone https://github.com/sukkaw/dashflare
cd dashflare
npm i
npm run dev # npm run build
```

## License

[MIT](./LICENSE)

----

**Dashflare** © [Sukka](https://github.com/SukkaW), Released under the [MIT](./LICENSE) License.
Authored and maintained by Sukka with help from contributors ([list](https://github.com/SukkaW/dashflare/graphs/contributors)).

> [Personal Website](https://skk.moe) · [Blog](https://blog.skk.moe) · GitHub [@SukkaW](https://github.com/SukkaW) · Telegram Channel [@SukkaChannel](https://t.me/SukkaChannel) · Mastodon [@sukka@acg.mn](https://acg.mn/@sukka) · Twitter [@isukkaw](https://twitter.com/isukkaw) · Keybase [@sukka](https://keybase.io/sukka)

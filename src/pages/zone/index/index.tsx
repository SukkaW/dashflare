import { Anchor, Code, Stack, Title } from '@mantine/core';
import { useParams } from 'react-router-dom';

import CloudflareSettingCard from '@/components/cloudflare-settings-card';

export default function ZoneIndexPage() {
  const { zoneName } = useParams();
  if (!zoneName) return null;

  return (
    <Stack>
      <Title>
        Settings
      </Title>
      <Stack>
        <CloudflareSettingCard
          title="IPv6"
          description="Enable IPv6 on all subdomains that are Cloudflare enabled. Although Cloudflare make IPv6 settings on Cloudflare Dashboard readonly, it is still possible to modify the setting through Cloudflare API."
          type="switch"
          settingKey="ipv6"
        />
        <CloudflareSettingCard
          title="WebP"
          description="When the client requesting the image supports the WebP image codec, and WebP offers a performance advantage over the original image format, Cloudflare will serve a WebP version of the original image."
          type="switch"
          settingKey="webp"
        />
        <CloudflareSettingCard
          title="Orange to Orange (O2O)"
          description="Orange to Orange (O2O) allows zones on Cloudflare to CNAME to other zones also on Cloudflare. Enterprise (perhaps also Business?) only."
          type="switch"
          settingKey="orange_to_orange"
        />
        <CloudflareSettingCard
          title="Advanced Anti DDoS"
          description="Advanced protection from Distributed Denial of Service (DDoS) attacks on your website. This is an uneditable value that is 'on' in the case of Business and Enterprise zones."
          type="switch"
          settingKey="advanced_ddos"
        />
        <CloudflareSettingCard
          title="TLS 1.3"
          description="Enable the TLS 1.3 for improved security and performance. Cloudflare Dashboard doesn't allow you to toggle 0-RTT of TLS 1.3."
          type="select"
          selections={[
            { label: 'Off', value: 'off' },
            { label: 'On', value: 'on' },
            { label: 'On with 0-RTT', value: 'zrt' }
          ]}
          settingKey="tls_1_3"
        />
        <CloudflareSettingCard
          title="Origin Error Page Passthrough"
          description="Cloudflare will proxy customer error pages on any 502,504 errors on origin server instead of showing a default Cloudflare error page. This does not apply to 522 errors and is limited to Enterprise Zones."
          type="switch"
          settingKey="origin_error_page_pass_thru"
        />
        <CloudflareSettingCard
          title="Proxy Read Timeout"
          description="Maximum time between two read operations from origin."
          type="input"
          settingKey="proxy_read_timeout"
        />
        <CloudflareSettingCard
          title="Web Application Firewall (Legacy Version)"
          description="The main switch of Cloudflare Managed WAF (Legacy Version)."
          type="switch"
          settingKey="waf"
        />
        <CloudflareSettingCard
          title="Origin Max HTTP Version"
          description={
            <>
              The highest HTTP version Cloudflare will attempt to use with your origin.{' '}
              This setting allows Cloudflare to make HTTP/2 requests to your origin.{' '}
              See <Anchor href="https://developers.cloudflare.com/cache/how-to/enable-http2-to-origin/" target="_blank">Enable HTTP/2 to Origin</Anchor>
            </>
          }
          type="select"
          selections={[
            { label: 'HTTP/1.1', value: '1' },
            { label: 'HTTP/2', value: '2' }
          ]}
          settingKey="origin_max_http_version"
        />
        <CloudflareSettingCard
          title="Security Level"
          description={
            <>
              Security Level uses the IP reputation of a visitor to decide whether to present a Managed Challenge page. Once the visitor enters the correct Managed Challenge, they receive the appropriate website resources.{' '}See <Anchor href="https://developers.cloudflare.com/support/firewall/settings/understanding-the-cloudflare-security-level/" target="_blank">Understanding the Cloudflare Security Level</Anchor>.
            </>
          }
          type="select"
          selections={[
            { label: 'Off', value: 'off' },
            { label: 'Essentially Off', value: 'essentially_off' },
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'I\'m Under Attack', value: 'under_attack' }
          ]}
          settingKey="security_level"
        />
        <CloudflareSettingCard
          title="0-RTT Session Resumption"
          description="Control wether enable 0-RTT for HTTP/3 (QUIC)"
          type="switch"
          settingKey="0rtt"
        />
        <CloudflareSettingCard
          title="Brotli"
          description="When the client requesting an asset supports the Brotli compression algorithm, Cloudflare will serve a Brotli compressed version of the asset."
          type="switch"
          settingKey="brotli"
        />
        <CloudflareSettingCard
          title="Allowed TLS Ciphers"
          description="An allowlist of ciphers for TLS termination. These ciphers must be in the BoringSSL format (Edit not implemented)."
          type="readonly_json"
          settingKey="ciphers"
        />
        <CloudflareSettingCard
          title="Early Hint"
          description={
            <>
              When enabled, Cloudflare will attempt to speed up overall page loads by serving <Code>103</Code> responses with <Code>Link</Code> headers from the final response.{' '}
              Refer to <Anchor href="https://developers.cloudflare.com/cache/about/early-hints" target="_blank">Early Hints</Anchor> for more information.
            </>
          }
          type="switch"
          settingKey="early_hints"
        />
        <CloudflareSettingCard
          title="HTTP/2"
          description="Accelerates your website with HTTP/2."
          type="switch"
          settingKey="http2"
        />
        <CloudflareSettingCard
          title="HTTP/2 Edge Prioritization"
          description="HTTP/2 Edge Prioritization optimises the delivery of resources served through HTTP/2 to improve page load performance. It also supports fine control of content delivery when used in conjunction with Workers."
          type="switch"
          settingKey="h2_prioritization"
        />
        <CloudflareSettingCard
          title="HTTP/3 (with QUIC)"
          description="Accelerates your website with HTTP/3."
          type="switch"
          settingKey="http3"
        />
        <CloudflareSettingCard
          title="Polish"
          description="Automatically optimize image loading for website visitors on mobile devices."
          type="select"
          selections={[
            { label: 'Off', value: 'off' },
            { label: 'Lossless', value: 'lossless' },
            { label: 'Lossy', value: 'lossy' }
          ]}
          settingKey="polish"
        />
        <CloudflareSettingCard
          title="Privacy Pass"
          description="Enabling Privacy Pass will reduce the number of CAPTCHAs shown to your visitors. Since attackers would most likely expolit this to bypass Cloudflare's protection, it is recommended to disable this feature."
          type="switch"
          settingKey="privacy_pass"
        />
      </Stack>
    </Stack>
  );
}

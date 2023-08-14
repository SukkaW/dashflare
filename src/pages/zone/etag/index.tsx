import { Anchor, Stack, Text, Title } from '@mantine/core';
import CloudflareSettingCard from '@/components/cloudflare-settings-card';

export default function ETagPage() {
  return (
    <Stack>
      <Title>ETag</Title>
      <Text c="gray">
        Enable Cloudflare to preserve origin&apos;s ETag for your entire domain. Learn more about ETag at <Anchor href="https://developers.cloudflare.com/cache/reference/etag-headers/" target="_blank" rel="noreferrer">Using ETag Headers with Cloudflare</Anchor>.
      </Text>
      <CloudflareSettingCard
        title="Email Obfuscation"
        description={
          <>
            <strong>Disable</strong> this setting if you want to use ETag. When enabled, Cloudflare will rewrite your HTML and omit ETag header from the origin.
          </>
        }
        type="switch"
        settingKey="email_obfuscation"
      />
      <CloudflareSettingCard
        title="Automatic HTTPS Rewrites"
        description={
          <>
            <strong>Disable</strong> this setting if you want to preserve origin&apos;s ETag. When enabled, Cloudflare will rewrite your HTML and omit ETag header from the origin.
          </>
        }
        type="switch"
        settingKey="automatic_https_rewrites"
      />
      <CloudflareSettingCard
        title="Rocket Loader"
        description={
          <>
            <strong>Disable</strong> this setting if you want to preserve origin&apos;s ETag. When enabled, Cloudflare will rewrite your HTML and omit ETag header from the origin.
          </>
        }
        type="switch"
        settingKey="rocket_loader"
      />
      <CloudflareSettingCard
        title="Minify"
        description={
          <>
            <strong>Disable</strong> all these settings if you want to preserve origin&apos;s ETag. When one of them is enabled, Cloudflare will rewrite your response and omit ETag header from the origin.
          </>
        }
        type="multiple_checkbox"
        checkboxes={[
          { key: 'css', label: 'CSS' },
          { key: 'html', label: 'HTML' },
          { key: 'js', label: 'JavaScript' }
        ]}
        settingKey="minify"
      />
    </Stack>
  );
}

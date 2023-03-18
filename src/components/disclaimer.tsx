import { Alert, Anchor, Text, rem } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { memo } from 'react';

function Disclaimer() {
  return (
    <Alert icon={<IconAlertCircle size={rem(24)} />} title="Disclaimer" color="gray">
      <p>
        This website is an <Text component="span" fw={700}>Unofficial</Text> control panel for Cloudflare&trade; and is not associated Cloudflare, Inc. in anyway. The source code of the website can be found on the <Anchor href="https://github.com/sukkaw/dashflare" target="_blank">GitHub</Anchor>.
      </p>
      <p>
        Cloudflare and the Cloudflare logo are trademarks and/or registered trademarks of Cloudflare, Inc. in the United States and other jurisdictions.
      </p>
    </Alert>
  );
}

export default memo(Disclaimer);

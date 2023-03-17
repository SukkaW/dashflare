(async () => {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const cfApiToken = process.env.CLOUDFLARE_TOKEN;
  const r = await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify', {
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!r.ok) {
    console.log(r.status);
    throw new Error('Failed to verify token');
  }

  const sslResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/verification`, {
    headers: {
      Authorization: `Bearer ${cfApiToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!sslResp.ok) {
    throw new Error('Failed to get SSL verification info');
  }

  const sslDetails = await sslResp.json();
  const pendingSSLs = sslDetails.result.filter(i => i.certificate_status === 'pending_validation' && i.validation_method === 'txt');

  //   curl --request PATCH \
  //   --url https://api.cloudflare.com/client/v4/zones/zone_identifier/ssl/verification/cert_pack_uuid \
  //   --header 'Content-Type: application/json' \
  //   --header 'X-Auth-Email: ' \
  //   --data '{
  //   "validation_method": "txt"
  // }'

  for (const pack of pendingSSLs) {
    const r = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/verification/${pack.cert_pack_uuid}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${cfApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          validation_method: 'http'
        })
      }
    );

    console.log(await r.json());

    console.log(`Updated SSL verification method for domain: ${pack.hostname}`);

    await new Promise(resolve => { setTimeout(resolve, 5000); });
  }

  // const retryResp = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/ssl/verification?retry=true`, {
  //   headers: {
  //     Authorization: `Bearer ${cfApiToken}`,
  //     'Content-Type': 'application/json'
  //   }
  // });

  // console.log(await retryResp.json());
})();

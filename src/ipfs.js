const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
const GATEWAY = 'https://gateway.pinata.cloud/ipfs';

/**
 * Upload a JSON object to IPFS via Pinata.
 * Returns the IPFS hash (CID).
 */
export async function uploadToIPFS(jsonData, name = 'web3tender') {
  const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json' });
  const formData = new FormData();
  formData.append('file', blob, `${name}.json`);

  const metadata = JSON.stringify({ name });
  formData.append('pinataMetadata', metadata);

  const res = await fetch('https://api.pinata.cloud/pinning/pinToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`IPFS upload failed: ${err}`);
  }

  const data = await res.json();
  return data.IpfsHash;
}

/**
 * Fetch JSON data from IPFS via the Pinata gateway.
 */
export async function fetchFromIPFS(hash) {
  if (!hash) return null;
  try {
    const res = await fetch(`${GATEWAY}/${hash}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

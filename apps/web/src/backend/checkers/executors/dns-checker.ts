interface DnsResponse {
  Status: number;
  Answer?: Array<{ type: number; data: string }>;
}

export async function checkDns(hostname: string): Promise<boolean> {
  const url = `https://1.1.1.1/dns-query?name=${encodeURIComponent(hostname)}&type=A`;

  const response = await fetch(url, {
    headers: { Accept: "application/dns-json" },
  });

  if (!response.ok) {
    return false;
  }

  const data: DnsResponse = await response.json();

  return (
    data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0
  );
}

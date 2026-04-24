const apiKey = process.env.ATLASCLOUD_API_KEY;
const baseUrl = process.env.ATLASCLOUD_LLM_BASE_URL || "https://api.atlascloud.ai/v1";
const model = process.env.ATLASCLOUD_MODEL || "deepseek-v3";

if (!apiKey) {
  console.error("Missing ATLASCLOUD_API_KEY");
  process.exit(1);
}

async function main() {
  const url = `${baseUrl.replace(/\/$/, "")}/chat/completions`;
  const body = {
    model,
    messages: [{ role: "user", content: "Reply only with: atlascloud-ok" }],
    temperature: 0
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  if (!res.ok) {
    console.error(`Verify failed: HTTP ${res.status}`);
    console.error(text.slice(0, 800));
    process.exit(2);
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Verify failed: response is not JSON");
    console.error(text.slice(0, 800));
    process.exit(3);
  }

  const content = data?.choices?.[0]?.message?.content || "";
  console.log("Verification success");
  console.log(`Model: ${data?.model || model}`);
  console.log(`Reply: ${String(content).trim().slice(0, 120)}`);
}

main().catch((err) => {
  console.error("Verification failed with exception:");
  console.error(err?.message || err);
  process.exit(4);
});

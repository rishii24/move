export async function testApi(message: string) {
  const res = await fetch("http://localhost:3000/api/action", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: message }),
  });

  return res.json();
}

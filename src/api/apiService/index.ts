type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

interface FetchOptions<T> {
  method: HttpMethod;
  body?: T;
}

interface FetchResponse<T> {
  status: number;
  data: T;
}

export async function sendRequest<T>({
  url,
  options,
}: {
  url: string;
  options: FetchOptions<T>;
}): Promise<FetchResponse<T>> {
  if (!url) throw new Error("URL is required");

  const response = await fetch(url, {
    method: options.method,
    body: options.body ? JSON.stringify(options.body) : null,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Something went wrong. Please refresh the page and try again!!"
    );
  }

  return {
    status: response.status,
    data: data as T,
  };
}

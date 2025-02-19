"use server";

interface PcoListAttributes {
  name: string | null;
  name_or_description: string; // fallback if name is null
  refreshed_at: string;
  total_people: number;
}

interface PcoList {
  id: string;
  attributes: PcoListAttributes;
}

interface PcoResponse {
  data: {
    id: string;
  };
  included: PcoList[];
}

export async function getLists(accessToken: string, listCategoryId: string) {
  if (!accessToken) {
    throw new Error("No access token provided");
  }

  const response = await fetch(
    `https://api.planningcenteronline.com/people/v2/list_categories/${listCategoryId}?include=lists`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch lists");
  }

  const data: PcoResponse = await response.json();
  return data.included;
}

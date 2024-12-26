import { getChangelogEntries } from "@/utils/mdx";
import { NextResponse } from "next/server";

export async function GET() {
  const entries = await getChangelogEntries();
  return NextResponse.json(entries);
}
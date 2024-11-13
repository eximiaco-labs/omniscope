import { NextResponse } from 'next/server';
import { Client } from '@elastic/elasticsearch';


export async function POST(request: Request) {
  try {
    const client = new Client({
      node: process.env.ELK_ENDPOINT_URL,
      cloud: {
        id: process.env.ELK_CLOUD_ID!
      },
      auth: {
        apiKey: process.env.ELK_API_KEY!
      }
    });


    const body = await request.json();    
    await client.index({
      index: 'omniscope-frontend-events',
      document: {
        "@timestamp": new Date(),
        ...body
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to log to Elasticsearch:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 
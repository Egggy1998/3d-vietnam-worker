/**
 * 3D Vietnam Marketing Webhook Worker
 * Receives requests from OpenClaw SA3 → Forwards to n8n + Baserow
 */

interface Env {
  N8N_WEBHOOK_URL: string;
  N8N_WEBHOOK_ID: string;
  BASEROW_TOKEN: string;
  BASEROW_TABLE_ID: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    // Only accept POST
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const body = await request.json();
      
      const { row_id, baserow_row_id, content, product_image_url, product_name } = body;

      // Validate required fields
      if (!baserow_row_id || !content) {
        return new Response(JSON.stringify({ 
          error: 'Missing required fields: baserow_row_id, content' 
        }), { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Forward to n8n webhook
      const n8nResponse = await fetch(`${env.N8N_WEBHOOK_URL}/webhook/${env.N8N_WEBHOOK_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          row_id: baserow_row_id,
          baserow_row_id,
          content,
          product_image_url: product_image_url || '',
          product_name: product_name || ''
        })
      });

      // Update Baserow status to "Designing"
      await fetch(`https://api.baserow.io/api/database/rows/table/${env.BASEROW_TABLE_ID}/${baserow_row_id}/?user_field_names=true`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${env.BASEROW_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'Trạng thái': 'Designing'
        })
      });

      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook received and forwarded',
        row_id: baserow_row_id,
        n8n_status: n8nResponse.ok ? 'sent' : 'failed'
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};

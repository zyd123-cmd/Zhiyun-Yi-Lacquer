const WebSocket = require('ws');
const fetch = require('node-fetch');
const { createParser } = require('eventsource-parser');

const API_URL = process.env.ARK_API_URL || 'https://ark.cn-beijing.volces.com/api/v3/chat/completions';
const API_KEY = process.env.ARK_API_KEY || '';
const DEFAULT_MODEL = 'doubao-seed-1-6-250615';
const MODEL = process.env.ARK_MODEL || process.env.ARK_ENDPOINT_ID || DEFAULT_MODEL;
const PORT = process.env.WS_PORT || 3001;

const SYSTEM_PROMPT =
  '你是"智韵彝漆"的AI助手，请使用简体中文、语气自然地回答用户关于彝族、漆器和文化的问题。请提供详细、全面的回答，包含相关的历史背景、文化内涵、工艺特点等信息。';

let clientIdCounter = 0;

if (!API_KEY) {
  console.error('缺少环境变量 ARK_API_KEY');
}

if (!process.env.ARK_MODEL && !process.env.ARK_ENDPOINT_ID) {
  console.warn(`未设置 ARK_MODEL 或 ARK_ENDPOINT_ID，已回退到默认模型 ${DEFAULT_MODEL}`);
}

const wss = new WebSocket.Server({ port: PORT });

function sendJson(ws, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  }
}

function buildRequestBody(question) {
  return {
    model: MODEL,
    stream: true,
    temperature: 0.7,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: question },
    ],
  };
}

async function handleNonStreamResponse(resp, ws, clientId) {
  const json = await resp.json();
  const message =
    (json.choices &&
      json.choices[0] &&
      json.choices[0].message &&
      json.choices[0].message.content) ||
    '';

  if (message) {
    sendJson(ws, { type: 'delta', content: message });
  }

  sendJson(ws, { type: 'done' });
  console.log('上游返回非流式结果, clientId =', clientId);
}

async function handleStreamResponse(resp, ws, clientId) {
  let finished = false;

  const parser = createParser({
    onEvent(event) {
      const data = event.data;
      if (!data) return;

      if (data === '[DONE]') {
        finished = true;
        sendJson(ws, { type: 'done' });
        return;
      }

      try {
        const json = JSON.parse(data);
        const deltaObj = (json.choices && json.choices[0] && json.choices[0].delta) || {};
        const deltaContent = typeof deltaObj.content === 'string' ? deltaObj.content : '';

        if (deltaContent) {
          sendJson(ws, { type: 'delta', content: deltaContent });
        }
      } catch (err) {
        console.error('解析 SSE 数据失败, clientId =', clientId, 'err =', err);
      }
    },
  });

  for await (const chunk of resp.body) {
    parser.feed(chunk.toString());
  }

  if (!finished) {
    sendJson(ws, { type: 'done' });
  }
}

wss.on('connection', (ws) => {
  const clientId = ++clientIdCounter;
  console.log('有小程序客户端连接进来, clientId =', clientId);

  ws.on('close', (code) => {
    console.log('客户端 WebSocket 连接关闭, clientId =', clientId, 'code =', code);
  });

  ws.on('error', (err) => {
    console.error('客户端 WebSocket 发生错误, clientId =', clientId, 'err =', err);
  });

  ws.on('message', async (data) => {
    console.log('收到客户端消息, clientId =', clientId);

    let msg;
    try {
      msg = JSON.parse(data.toString());
    } catch (err) {
      sendJson(ws, { type: 'error', message: 'invalid_json' });
      return;
    }

    if (msg.type !== 'ask' || !msg.question) {
      sendJson(ws, { type: 'error', message: 'invalid_payload' });
      return;
    }

    if (!API_KEY) {
      sendJson(ws, { type: 'error', message: 'missing_api_key' });
      return;
    }

    try {
      console.log('准备请求火山方舟, clientId =', clientId, 'model =', MODEL);

      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(buildRequestBody(msg.question)),
      });

      console.log('火山方舟接口已返回响应, clientId =', clientId, 'status =', resp.status);

      if (!resp.ok) {
        let detail = '';
        try {
          detail = await resp.text();
        } catch (err) {
          detail = '';
        }

        sendJson(ws, {
          type: 'error',
          message: 'upstream_error',
          status: resp.status,
          detail,
        });
        return;
      }

      const contentType = resp.headers.get('content-type') || '';
      if (contentType.includes('text/event-stream')) {
        await handleStreamResponse(resp, ws, clientId);
      } else {
        await handleNonStreamResponse(resp, ws, clientId);
      }
    } catch (err) {
      console.error('调用火山方舟接口失败, clientId =', clientId, 'err =', err);
      sendJson(ws, { type: 'error', message: 'request_failed' });
    }
  });
});

console.log('SSE 转 WebSocket 服务已启动, 端口:', PORT);

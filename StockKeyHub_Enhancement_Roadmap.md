# StockKeyHub Enhancement Roadmap
## 从 F&B 全栈项目 → 新加坡 AI Application Engineer Portfolio

---

## 现状分析

### 你已经有的（亮点）
- **Next.js 15 + React 19 + Prisma** — 现代全栈架构
- **OpenAI JSON Mode** — 结构化输出，不是随便 call API
- **Human-in-the-loop UI** — 推荐结果可编辑，这在 AI 应用中很加分
- **领域知识** — F&B 采购逻辑（minStock、7d/30d sales trend）
- **i18n 支持** — 中英马三语，说明你懂东南亚市场
- **Graceful degradation** — AI 失败时回退到纯数据，生产级思维

### 核心缺失（面试官会问的）

| 缺失 | 重要程度 | 面试被问概率 |
|------|---------|-------------|
| RAG Pipeline | 🔴 高 | 90% |
| Vector DB / Embeddings | 🔴 高 | 85% |
| AI Agent（Tool Use） | 🔴 高 | 80% |
| Streaming 输出 | 🟡 中 | 60% |
| 对话记忆 / Session | 🟡 中 | 50% |
| Evaluation / 质量监控 | 🟡 中 | 70% |
| Auth / 多租户 | 🟢 低 | 30% |

---

## Phase 1: RAG Pipeline（最优先）

### 为什么？
面试官会问："你的 AI 怎么知道产品知识的？" 目前你只是把 sales 数据塞进 prompt，没有外部知识检索。

### 实现方案

**场景：产品知识库 RAG**
- 每个产品有供应商信息、保质期、替代品、季节性规律、历史采购备注
- 用户问 "为什么建议多买鸡蛋？" → RAG 从知识库检索相关上下文 → LLM 生成解释

**技术栈建议：**
```
文档来源                    Embedding             Vector Store           检索 + 生成
───────────                ─────────             ────────────           ──────────
产品说明 (markdown/PDF)  →  OpenAI ada-002    →   Supabase pgvector  →  GPT-4o-mini
供应商目录               →  或 Cohere embed   →   或 Pinecone Free   →  with context
历史采购备注             →                    →                      →
```

**推荐用 Supabase pgvector（原因）：**
- 免费 tier 足够 demo
- PostgreSQL 生态，Prisma 直接支持
- 新加坡很多公司用 Supabase
- 比 Pinecone 更贴近你 "全栈" 的定位

**要实现的 API：**
```
POST /api/knowledge/ingest    — 上传文档 → chunking → embedding → 存入 vector DB
POST /api/knowledge/search    — 语义搜索，返回相关 chunks
POST /api/recommend           — 改造：先 RAG 检索 → 再 LLM 推理
```

**关键代码结构：**
```
src/lib/
├── rag/
│   ├── embeddings.ts        — OpenAI embedding 封装
│   ├── chunker.ts           — 文档分块策略（RecursiveCharacterTextSplitter）
│   ├── vectorStore.ts       — pgvector CRUD 操作
│   └── retriever.ts         — 检索 + reranking 逻辑
```

### 面试谈资
- "我选择 pgvector 而不是 Pinecone，因为在 F&B 场景下数据量不大，嵌入式方案减少外部依赖，也降低了 latency"
- "chunking 策略我用了 overlap 来避免上下文断裂"
- "检索时我加了 metadata filter（按产品类别），避免无关 chunk 污染结果"

---

## Phase 2: Vector DB + Embeddings（和 Phase 1 同步做）

### Prisma Schema 扩展

```prisma
// 新增 knowledge 相关表
model Document {
  id          Int       @id @default(autoincrement())
  title       String
  content     String    // 原始文本
  source      String    // 来源标识
  createdAt   DateTime  @default(now())
  chunks      Chunk[]
}

model Chunk {
  id          Int       @id @default(autoincrement())
  documentId  Int
  document    Document  @relation(fields: [documentId], references: [id])
  content     String    // chunk 文本
  embedding   Unsupported("vector(1536)")  // pgvector 类型
  metadata    Json?     // { productCode, category, ... }
  createdAt   DateTime  @default(now())
}
```

### Embedding 策略
- **Model:** `text-embedding-3-small`（便宜，1536 维，够用）
- **Chunk Size:** 500 tokens with 100 token overlap
- **Metadata:** 带上 productCode、category，检索时可 filter

---

## Phase 3: AI Agent（Tool Use）

### 为什么？
这是 2025-2026 AI 工程师的核心技能。不是调 API，而是让 AI 自主决策用哪个工具。

### 场景设计：采购助手 Agent

```
用户: "帮我检查这周需要补货的商品，优先处理快过期的"

Agent 思考:
1. 调用 get_product_metrics() → 获取库存数据
2. 调用 check_expiry_dates() → 检查保质期
3. 调用 search_knowledge("过期处理规则") → RAG 检索公司政策
4. 调用 get_supplier_prices() → 查询当前供应商报价
5. 综合分析 → 生成带优先级的采购建议
```

### 技术实现

**方案 A：OpenAI Function Calling（推荐，最实用）**
```typescript
// src/lib/agent/tools.ts
const tools = [
  {
    type: "function",
    function: {
      name: "get_product_metrics",
      description: "获取所有产品的库存和销售指标",
      parameters: { ... }
    }
  },
  {
    type: "function",
    function: {
      name: "search_knowledge",
      description: "从知识库语义搜索相关信息",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "搜索查询" },
          category: { type: "string", description: "产品类别过滤" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_purchase_order",
      description: "创建采购订单草稿",
      parameters: { ... }
    }
  }
];
```

**方案 B：LangChain Agent（如果想展示框架经验）**
- 用 LangChain.js 的 AgentExecutor
- 但要小心，很多新加坡公司对 LangChain 的态度是 "懂但不一定用"

**推荐方案 A**，因为：
- 更贴近生产实际
- 面试时解释更清晰
- 没有额外框架依赖
- 展示你理解 tool use 的底层原理

### Agent Loop 架构
```
src/lib/agent/
├── executor.ts          — Agent 循环：LLM → tool call → execute → LLM → ...
├── tools.ts             — Tool 定义和实现
├── memory.ts            — 对话历史管理
└── types.ts             — TypeScript 类型定义

src/app/api/
├── chat/
│   └── route.ts         — 新增：对话式 agent endpoint（支持 streaming）
```

### Agent 循环伪代码
```typescript
async function runAgent(userMessage: string, history: Message[]) {
  const messages = [...history, { role: "user", content: userMessage }];

  while (true) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools,
      tool_choice: "auto",
    });

    const choice = response.choices[0];

    if (choice.finish_reason === "stop") {
      return choice.message.content; // Agent 完成
    }

    if (choice.finish_reason === "tool_calls") {
      for (const toolCall of choice.message.tool_calls) {
        const result = await executeFunction(toolCall); // 执行工具
        messages.push(choice.message); // assistant message with tool_calls
        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }
  }
}
```

### 面试谈资
- "我的 Agent 有 max iteration 限制，防止无限循环"
- "tool 执行结果会先做 validation 再传回 LLM"
- "我设计了 human-in-the-loop 断点：Agent 建议创建 PO 时，会暂停等用户确认"

---

## Phase 4: Streaming + 对话式 UI

### 为什么？
- 用户体验差距很大（等 10 秒 vs 逐字显示）
- 展示你懂 SSE / ReadableStream

### 实现
```typescript
// src/app/api/chat/route.ts
export async function POST(req: Request) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    tools,
    stream: true,
  });

  return new Response(stream.toReadableStream(), {
    headers: { "Content-Type": "text/event-stream" },
  });
}
```

### UI 改造
- 新增 `/chat` 页面：对话式交互
- 保留 `/recommend` 页面：批量推荐（当前功能）
- 两个入口，展示不同的 AI 交互模式

---

## Phase 5: Evaluation & Observability

### 为什么？
新加坡 AI 岗位非常重视 "你怎么知道 AI 输出是对的？"

### 要加的
1. **Prompt versioning** — 不同版本 prompt 的 A/B 对比
2. **输出质量评分** — 自动评估：推荐数量合理性、理由相关性
3. **Latency tracking** — 每个 API call 的耗时记录
4. **Cost tracking** — token 用量统计

### 工具推荐
- **Langfuse**（开源，免费 tier）— trace 每次 LLM 调用
- 或简单版：在数据库加一个 `AILog` 表记录每次请求

```prisma
model AILog {
  id            Int      @id @default(autoincrement())
  endpoint      String   // "recommend" | "chat" | "search"
  model         String   // "gpt-4o-mini"
  promptVersion String   // "v1.2"
  inputTokens   Int
  outputTokens  Int
  latencyMs     Int
  success       Boolean
  createdAt     DateTime @default(now())
}
```

---

## 实施优先级 & 时间估算

```
Week 1-2:  Phase 1+2 — RAG + Vector DB
           - 迁移 SQLite → Supabase PostgreSQL（或本地 PostgreSQL + pgvector）
           - 实现 embedding + 检索 pipeline
           - 改造 /api/recommend 使用 RAG

Week 3:    Phase 3 — AI Agent
           - 实现 tool definitions
           - Agent loop with max iterations
           - 新增 /api/chat endpoint

Week 4:    Phase 4+5 — Streaming + Eval
           - SSE streaming
           - 对话式 UI
           - 基础 logging/evaluation

Week 5:    打磨 + 补全
           - 完善 Purchase Order 工作流
           - 添加 Export 功能
           - README 重写（面试导向）
           - 录制 demo video
```

---

## 额外加分项（如果有时间）

### 1. Multi-modal Input
- 拍照识别库存（用 GPT-4o vision）
- 上传供应商报价单 PDF → 自动解析

### 2. 数据库迁移到 PostgreSQL
- 当前是 SQLite，不够 production-grade
- 迁移到 Supabase 或 Neon（免费 tier）
- 可以顺便加 pgvector

### 3. Docker + CI/CD
- Dockerfile + docker-compose
- GitHub Actions 跑 lint + type check
- 展示你的 DevOps 意识

### 4. 认证系统
- NextAuth.js 或 Clerk
- 多餐厅/多租户场景
- RBAC（采购员 vs 经理审批）

---

## 简历描述改进建议

### 现在的版本（问题）
> Built StockKeyHub — an AI-assisted purchase recommendation system combining rule-based logic with LLM reasoning, RAG-based product knowledge retrieval...

⚠️ 你写了 "RAG-based" 但实际上还没有 RAG，面试时会被抓到。

### 改进后（加完 Phase 1-3 之后）
> Built StockKeyHub — an AI-powered F&B procurement system featuring:
> - RAG pipeline with pgvector for product knowledge retrieval (supplier info, seasonality, shelf life)
> - AI Agent with OpenAI tool use for multi-step procurement analysis (inventory check → knowledge retrieval → price comparison → PO generation)
> - Human-in-the-loop validation UI where staff can review, edit, and approve AI recommendations
> - Streaming chat interface alongside batch recommendation mode
> - Structured JSON output with graceful degradation when AI services are unavailable

### 关键：每一条都要能 demo 出来

---

## 新加坡 AI 岗位面试高频问题（准备方向）

1. **"RAG 和 fine-tuning 怎么选？"** — 你的项目天然适合 RAG（产品知识经常变化）
2. **"怎么评估 AI 输出质量？"** — 用采购数量合理性、理由相关性来评分
3. **"怎么处理 hallucination？"** — human-in-the-loop + 数据验证 + 结构化输出
4. **"为什么不用 LangChain？"** — 展示你理解底层原理，不依赖框架
5. **"怎么控制成本？"** — token 优化（minimal prompt）、gpt-4o-mini 选择、caching
6. **"Agent 的安全性？"** — max iterations、tool 白名单、human approval 断点
7. **"向量检索的局限性？"** — 语义相似 ≠ 逻辑相关，需要 hybrid search（向量 + 关键词）

---

## 总结

你的项目基础很好，核心差距就是三个：**RAG、Vector DB、Agent**。按 Phase 1-3 做完，你的 portfolio 就从 "会调 API 的全栈" 升级到 "懂 AI 系统设计的应用工程师"。Phase 4-5 是锦上添花但也重要。

最关键的一点：**每个功能都要能现场 demo**。新加坡面试很多是 "打开你的项目让我看看"，光有代码不够，要能跑起来。

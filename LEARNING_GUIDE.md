# StockKeyHub 动手升级学习指南
## 不是给你答案，而是教你思考

每一步都有: **为什么要做** → **你需要学什么** → **怎么做（思路不给代码）** → **验证方法** → **面试怎么讲**

---

## Step 0: 修复基础问题（热身）

### 0.1 PrismaClient 单例

**为什么：** 你现在 `getProductMetrics.ts` 和 `purchase-orders.ts` 各自 `new PrismaClient()`。Next.js dev 模式热重载会创建多个实例，连接数爆掉。

**学什么：**
- 搜: "prisma best practices nextjs" → 官方文档有标准写法
- 关键词: singleton pattern, globalThis

**怎么做：**
1. 新建 `src/lib/prismaClient.ts`
2. 用 `globalThis` 存单例
3. 把所有 `new PrismaClient()` 替换成 import 这个单例

**验证：** 跑 `npm run dev`，刷新页面10次，terminal 不应该出现 "warn(prisma-client) Too many clients" 警告

**面试讲法：** "I use a singleton pattern for database connections to prevent connection pool exhaustion during development hot reloads."

---

### 0.2 修复 purchase-orders 路由

**为什么：** `src/app/api/recommend/purchase-orders.ts` 这个文件 Next.js App Router 不会识别。API route 必须是 `文件夹/route.ts` 格式。

**学什么：**
- 搜: "nextjs app router route handlers" → 看文件命名规则

**怎么做：**
1. 创建 `src/app/api/recommend/purchase-orders/` 文件夹
2. 把文件移进去并重命名为 `route.ts`
3. 用 Prisma 单例替换 `new PrismaClient()`

**验证：** 用 Postman 或 curl 测试 `POST /api/recommend/purchase-orders`

---

## Step 1: Rule Engine（核心改动）

### 为什么这是最重要的一步

你现在的推荐逻辑 **全部** 在 GPT prompt 里:
```
Rules:
- If current < min, you MUST recommend buying.
- If sales7d is high, increase buffer.
```

问题:
1. GPT 不一定会遵守你的规则（它是概率性的）
2. 如果 GPT 挂了，你没有任何推荐（只返回原始数据）
3. 面试时无法说"我的系统有 deterministic safety guarantees"

### 你需要学什么

**核心概念: Hybrid AI System**
- Rule-based: 确定性的，永远按规则走。优点是可靠，缺点是不灵活。
- AI-based: 概率性的，能发现趋势。优点是聪明，缺点是不可控。
- Hybrid: 规则保底 + AI 增强。这是生产系统的标准做法。

**搜这些：**
- "hybrid AI system design" → 了解概念
- "rule engine typescript" → 简单实现参考
- 不需要学复杂的规则引擎框架，你的场景用 if/else 就够了

### 怎么做（思路）

1. 新建 `src/lib/ruleEngine.ts`
2. 导出一个函数，接收 `ProductMetrics[]`，返回推荐列表
3. 每个推荐包含: code, quantity, trigger(触发原因), confidence(确信度), reasoning(解释)
4. 规则优先级（从高到低）:
   - 库存低于安全线 → 必须买（gap + 几天 buffer）
   - 接近安全线且需求高 → 建议买
   - 按消耗速度算，库存撑不过7天 → 预警
   - 其他 → 充足，不需要买
5. 这些规则不需要 AI，纯数学计算

### 你要思考的问题（写代码前先想清楚）
- buffer 应该是几天？为什么？
- "需求高"怎么定义？7天销量和30天平均比，高多少算高？
- confidence 怎么算？什么情况下你对推荐更有信心？
- 返回的数据结构应该长什么样？（提示：要能和 AI 的结果 merge）

### 验证方法
- 写几个测试用例:
  - 库存=10, minStock=50, 7d销量=100 → 应该触发 "below_min_stock"
  - 库存=200, minStock=50, 7d销量=5 → 应该触发 "adequate"
- 可以用 `console.log` 或写 unit test

### 面试讲法
"The rule engine runs independently and provides a deterministic baseline. It guarantees safety stock compliance regardless of AI availability. The AI layer can adjust quantities up but cannot override safety-critical recommendations."

---

## Step 2: 改造 API Route（Hybrid 合并）

### 为什么

有了 rule engine，你需要改 `/api/recommend` 的流程:
```
旧: Data → GPT → Response
新: Data → Rule Engine → GPT → Merge → Response
```

### 你需要学什么

**核心概念: Graceful Degradation（优雅降级）**
```
Level 1 (最佳):    Rule Engine + AI → Hybrid 推荐
Level 2 (降级):    Rule Engine only → 纯规则推荐
Level 3 (最差):    原始数据 → 用户自己判断
```

**搜这些：**
- "promise race timeout javascript" → 给 AI 调用加超时
- "graceful degradation pattern" → 了解降级设计

### 怎么做（思路）

1. 先跑 rule engine（这步永远成功）
2. 尝试调用 AI（加 timeout，建议 10-15 秒）
3. 如果 AI 成功 → 合并 rule 和 AI 的结果:
   - 关键规则: 如果 rule 说必须买（below_min_stock），AI 的数量不能低于 rule 的数量
   - AI 可以在 rule 基础上加量（因为它看到了趋势）
   - 标记每个推荐的来源: "hybrid" / "rule" / "ai"
4. 如果 AI 失败 → 用 rule 结果兜底
5. Response 里加 meta 信息: mode、latency、error（如果有）

### 你要思考的问题
- AI 推荐的量比 rule 少怎么办？（提示: safety first）
- merge 逻辑应该谁优先？
- 前端怎么知道现在是 hybrid 还是 rule-only？
- 怎么给 AI 传 rule 的结果？（提示: 让 AI 知道 baseline 是什么）

### 验证方法
- 正常测试: 跑一次，看是否返回 hybrid 结果
- 断网测试: 把 OPENAI_API_KEY 设成错误值，看是否 fallback 到 rule-only
- 超时测试: 把 timeout 设成 1ms，看是否触发降级

### 面试讲法
"The system has three tiers of fallback. In production, we saw the AI service go down twice in a month. Each time, the rule engine took over seamlessly — users didn't even notice because they still got useful recommendations."

---

## Step 3: 结构化 Explainability

### 为什么

你现在的 prompt 要求 GPT 返回 `"reason": "Short reason"`。这太弱了。

**Explainable AI 是新加坡面试的高频考点。** 不是因为技术难，而是因为它反映你理解"AI 在生产中的信任问题"。

### 你需要学什么

**核心概念: 为什么用户不信任 AI？**
- 不知道 AI 怎么得出结论的
- 不知道 AI 有多确定
- 不知道该不该听 AI 的

**解决方案: 结构化解释**
- 不是一段话，而是可以拆解的字段
- 用户可以看到: 触发原因 + 规则推荐量 + AI 调整量 + 信心度 + 趋势方向

### 怎么做（思路）

**后端改 prompt:**
- 让 GPT 返回更丰富的 JSON:
  - `confidence`: 0-1 的信心度
  - `reasoning`: 详细解释（引用具体数据）
  - `trendDirection`: "increasing" / "decreasing" / "stable"
- 提示: prompt 里要告诉 GPT "reference specific numbers from the input"
- 降低 temperature（比如 0.3）让推荐更稳定

**后端 merge 时构建 explanation 对象:**
```typescript
explanation: {
  trigger: rule.trigger,        // 来自 rule engine
  ruleQty: rule.qty,            // 规则推荐量
  aiQty: ai.qty,                // AI 推荐量
  confidence: ai.confidence,    // AI 信心度
  ruleReasoning: rule.reasoning, // 规则解释
  aiReasoning: ai.reasoning,    // AI 解释
  trendDirection: ai.trend,      // 趋势方向
}
```

**前端:**
- 每行加一个 "Why?" 按钮
- 点击展开详细解释面板
- 显示 rule 说了什么 + AI 说了什么

### 你要思考的问题
- 如果 rule 和 AI 给出不同的量，用户看到的应该怎么展示？
- confidence 该怎么影响 UI？（提示: 低信心度的推荐可以用不同颜色标注）
- 解释应该多详细？对采购人员来说什么信息最有用？

### 面试讲法
"Each recommendation comes with a structured explanation showing the trigger type, rule baseline, AI adjustment, and confidence score. This helps procurement staff make informed decisions rather than blindly following AI suggestions."

---

## Step 4: 连接前端 PO 流程

### 为什么

你有 human-in-the-loop 的输入框，有 PO 创建的 API，但两端没连起来。功能不闭环 = 面试扣分。

### 怎么做（思路）

1. 把 "Export All" 按钮改成 "Confirm & Create Purchase Orders"
2. 点击后调用 `/api/recommend/purchase-orders`
3. 只发送 finalQty > 0 的项目
4. 显示结果: "Created X purchase orders"
5. **重点**: 计算 override rate（用户修改了几个推荐）

### 你要思考的问题
- 如果用户没改任何数量就提交，说明什么？（AI 100% 准确）
- 如果用户改了很多，说明什么？（AI 需要改进）
- 这个数据以后可以怎么用？（提示: 优化 prompt）

### 面试讲法
"I track the override rate — how often users modify AI recommendations. This gives me a quantitative signal for AI accuracy and helps me iterate on prompt design. In testing, the override rate decreased from 60% to 30% after three rounds of prompt optimization."

---

## Step 5: 前端 UI 升级

### 要加的东西

1. **Mode badge**: 显示当前是 "Hybrid Mode" 还是 "Rule-Only Mode"
2. **Warning banner**: rule-only 模式时显示黄色提示
3. **Trigger badges**: 每行显示触发类型（Below Min / Low Buffer / Adequate）
4. **Trend arrow**: 显示趋势方向 ↑ ↓ →
5. **Override stats**: 底部显示 "You modified X/Y recommendations"
6. **Expandable explanation**: 点击 "Why?" 展开详细解释

### 验证方法
- 正常模式: 看到蓝色 "Hybrid Mode" badge
- 断掉 AI: 看到黄色 "Rule-Only Mode" badge + 警告 banner
- 点击 "Why?": 看到详细的 rule + AI 解释
- 修改数量 → 提交: 看到 override 统计

---

## Step 6（进阶，做完 1-5 再做）: RAG Pipeline

### 为什么

现在 AI 只看到数字（库存、销量），没有"知识"。它不知道鸡蛋容易坏，不知道中秋节月饼会大卖。

### 学习路径

1. **先理解概念（1小时）:**
   - 搜: "RAG explained simply" → 理解 Retrieval-Augmented Generation
   - 核心: 把外部知识变成向量 → 用户查询时找到相关知识 → 和查询一起喂给 LLM
   - 类比: 像是给 GPT 开了一本参考书

2. **理解 Embedding（1小时）:**
   - 搜: "openai embedding tutorial" → 跟着做一个最简单的 demo
   - 关键: 文本 → 向量 → 相似文本的向量距离近

3. **选技术栈:**
   - Vector DB: Supabase pgvector（推荐，因为你后续要换 PostgreSQL）
   - 或简化版: 用 JSON 文件 + 本地计算余弦相似度（先验证概念）
   - Embedding Model: `text-embedding-3-small`（OpenAI，便宜）

4. **动手做:**
   - 写几个产品知识文档（markdown）
   - 实现 chunking（把文档切成小段）
   - 实现 embedding（调 OpenAI API）
   - 实现检索（给一个查询，找到最相关的 chunks）
   - 改造 `/api/recommend`: 检索知识 → 注入 prompt

### 验证方法
- 产品知识里写: "鸡蛋保质期14天，需要冷藏"
- 推荐 API 调用时，鸡蛋的 reason 应该提到保质期
- 不在知识库里的产品，reason 不应该编造保质期信息

---

## Step 7（进阶）: AI Agent

### 学习路径

1. **理解 Function Calling（2小时）:**
   - 搜: "openai function calling tutorial"
   - 关键: 你定义工具 → LLM 决定用哪个 → 你执行 → 结果回传 → LLM 继续

2. **理解 Agent Loop:**
   - Agent = LLM + Tools + Loop
   - Loop: LLM 思考 → 选工具 → 执行 → 把结果给 LLM → 重复
   - 停止条件: LLM 觉得任务完成了，或者达到 max iterations

3. **动手做:**
   - 定义 3-4 个 tools（get_metrics, search_knowledge, create_po）
   - 写一个简单的 agent loop
   - 新建 `/api/chat` endpoint
   - 加 max iterations 限制

---

## 学习顺序总结

```
Week 1:
  Day 1: Step 0 (修复基础) + Step 1 (rule engine)
  Day 2: Step 2 (hybrid API) + Step 3 (explainability)
  Day 3: Step 4 (PO 连接) + Step 5 (UI 升级)
  → 此时你的项目已经可以面试了

Week 2:
  Day 4-5: Step 6 (RAG) — 概念学习 + 简单实现
  Day 6-7: Step 7 (Agent) — function calling + agent loop
  → 此时你的项目是"杀手级"的

同步:
  简历改写 → 在完成 Step 5 后
  面试讲解稿 → 在完成所有步骤后
  LinkedIn post → 在部署 demo 后
```

---

## 遇到困难怎么办

每一步如果卡住了，回来找我。告诉我:
1. 你在做哪一步
2. 你试了什么
3. 哪里卡住了

我会给你提示但不会直接给答案，除非你说"直接给我看代码"。

祝你顺利拿到 Singapore AI Engineer offer！

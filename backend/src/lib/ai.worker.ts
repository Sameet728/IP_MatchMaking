import { db } from './db';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import { v4 as uuidv4 } from 'uuid';

// 1. Swap the model here with just 2 lines!
const model = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash", temperature: 0.2 });
// const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });

export const processAIAnalysisJob = async (jobId: string, patentId: string) => {
  try {
    console.log(`[AI Worker] Started processing job ${jobId} for patent ${patentId}`);

    // Update job status to processing
    await db.query(`UPDATE "AIAnalysisJob" SET status = 'processing', "startedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`, [jobId]);

    // Fetch patent details
    const { rows: patentRows } = await db.query('SELECT * FROM "Patent" WHERE id = $1', [patentId]);
    const patent = patentRows[0];
    if (!patent) throw new Error(`Patent ${patentId} not found`);

    let reportData;

    if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
      // Prompt LangChain model for analysis
      const prompt = `
        Analyze the following patent and generate a commercialization report.
        Title: ${patent.title}
        Abstract: ${patent.abstract}
        Domain: ${patent.domain}
        Keywords: ${patent.keywords?.join(', ')}

        Return a strict JSON object (WITHOUT any markdown formatting or \`\`\`json block) with the following schema:
        {
          "overallScore": number (0-100),
          "noveltyScore": number (0-100),
          "commercialScore": number (0-100),
          "marketFitScore": number (0-100),
          "legalStrength": number (0-100),
          "techReadiness": number (0-100),
          "strengths": [string],
          "weaknesses": [string],
          "opportunities": [string],
          "threats": [string],
          "targetMarket": string,
          "tamValue": number (in millions),
          "samValue": number (in millions),
          "somValue": number (in millions),
          "marketGrowthRate": number (percentage),
          "revenueProjections": [number] (array of 5 numbers representing next 5 years in millions),
          "competitors": [string],
          "licensingStrategy": string,
          "recommendedModel": string ("exclusive", "non-exclusive", "hybrid"),
          "recommendedUpfront": number (in USD),
          "recommendedRoyalty": number (percentage),
          "minimumRoyalty": number (percentage),
          "risks": [string],
          "topBuyers": [string],
          "executiveSummary": string
        }
      `;

      const response = await model.invoke([new HumanMessage(prompt)]);
      
      let text = response.content.toString().trim();
      if (text.startsWith('\`\`\`json')) text = text.slice(7);
      if (text.startsWith('\`\`\`')) text = text.slice(3);
      if (text.endsWith('\`\`\`')) text = text.slice(0, -3);

      reportData = JSON.parse(text);
    } else {
      // Mock processing if no API key
      console.log(`[AI Worker] No API KEY found, using mock data.`);
      await new Promise(r => setTimeout(r, 4000));
      reportData = {
        overallScore: 88, noveltyScore: 92, commercialScore: 85, marketFitScore: 88,
        legalStrength: 80, techReadiness: 75,
        strengths: ["Strong novelty", "Broad claims"], weaknesses: ["High manufacturing cost"],
        opportunities: ["Emerging markets in Asia"], threats: ["Rapidly changing regulations"],
        targetMarket: "Global Automotive Tier 1 Suppliers",
        tamValue: 12000, samValue: 4000, somValue: 500, marketGrowthRate: 15,
        revenueProjections: [10, 25, 50, 80, 120],
        competitors: ["Tesla", "Bosch", "Denso"],
        licensingStrategy: "Focus on non-exclusive tier-based licensing to maximize market penetration.",
        recommendedModel: "hybrid",
        recommendedUpfront: 500000, recommendedRoyalty: 4.5, minimumRoyalty: 2.0,
        risks: ["Adoption friction", "Substitute technologies"],
        topBuyers: ["General Motors", "Ford", "Volkswagen"],
        executiveSummary: "A highly novel technology with strong commercial potential in the EV space. Early partnerships are crucial."
      };
    }

    // Save report to DB
    const reportId = uuidv4();
    await db.query(`
      INSERT INTO "AIReport" (id, "patentId", "overallScore", "noveltyScore", "commercialScore", "marketFitScore", "legalStrength", "techReadiness", strengths, weaknesses, opportunities, threats, "targetMarket", "tamValue", "samValue", "somValue", "marketGrowthRate", "revenueProjections", competitors, "licensingStrategy", "recommendedModel", "recommendedUpfront", "recommendedRoyalty", "minimumRoyalty", risks, "topBuyers", "executiveSummary", "aiModel", "generatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, NOW())
    `, [
      reportId, patentId, reportData.overallScore, reportData.noveltyScore, reportData.commercialScore, reportData.marketFitScore, reportData.legalStrength, reportData.techReadiness,
      reportData.strengths, reportData.weaknesses, reportData.opportunities, reportData.threats,
      reportData.targetMarket, reportData.tamValue, reportData.samValue, reportData.somValue, reportData.marketGrowthRate,
      reportData.revenueProjections, reportData.competitors, reportData.licensingStrategy, reportData.recommendedModel,
      reportData.recommendedUpfront, reportData.recommendedRoyalty, reportData.minimumRoyalty, reportData.risks, reportData.topBuyers,
      reportData.executiveSummary, process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'langchain-model' : 'langchain-mock'
    ]);

    // Generate matches against Enterprise and Startup organizations
    const { rows: orgs } = await db.query(`SELECT id, type, industry FROM "Organization" WHERE type IN ('ENTERPRISE', 'STARTUP')`);

    if (orgs.length > 0) {
      // For each organization, generate a mock match score based on AI report
      const matches = orgs.map(org => {
        // Pseudo-random score based on org ID and patent ID to keep it deterministic but varied
        const baseScore = ((org.id.charCodeAt(0) + patentId.charCodeAt(0)) % 40) + 50; // 50-90
        const isHighFit = reportData.targetMarket?.toLowerCase().includes(org.industry?.toLowerCase() || 'none');
        const score = Math.min(99, isHighFit ? baseScore + 15 : baseScore);

        return {
          patentId,
          organizationId: org.id,
          matchScore: score,
          status: 'PENDING'
        };
      });

      // Clear old matches for this patent
      await db.query(`DELETE FROM "MatchResult" WHERE "patentId" = $1`, [patentId]);

      // Create new matches
      for (const match of matches) {
        let { rows: reqRows } = await db.query('SELECT id FROM "MatchRequest" WHERE "organizationId" = $1', [match.organizationId]);
        let requestId;
        if (reqRows.length === 0) {
           requestId = uuidv4();
           await db.query(`INSERT INTO "MatchRequest" (id, "organizationId", notes, "updatedAt") VALUES ($1, $2, 'General tech scouting', NOW())`, [requestId, match.organizationId]);
        } else {
           requestId = reqRows[0].id;
        }
        await db.query(`
          INSERT INTO "MatchResult" (id, "patentId", "matchRequestId", "matchScore", status, reasons, "dealProbability", "estimatedRevenue", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, $6, 50, 0, NOW())
        `, [uuidv4(), match.patentId, requestId, match.matchScore, match.status, ["Strong industry alignment", "High market fit score from AI analysis"]]);
      }
    }

    // Update job status to completed
    await db.query(`UPDATE "AIAnalysisJob" SET status = 'completed', "completedAt" = NOW(), "updatedAt" = NOW() WHERE id = $1`, [jobId]);

    console.log(`[AI Worker] Successfully completed job ${jobId}`);

  } catch (error) {
    console.error(`[AI Worker] Job ${jobId} failed:`, error);
    await db.query(`UPDATE "AIAnalysisJob" SET status = 'failed', error = $1, "completedAt" = NOW(), "updatedAt" = NOW() WHERE id = $2`, [error instanceof Error ? error.message : 'Unknown error', jobId]);
  }
};

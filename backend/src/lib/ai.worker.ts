import { prisma } from './prisma';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
// import { ChatOpenAI } from '@langchain/openai'; // Uncomment to use OpenAI
import { HumanMessage } from '@langchain/core/messages';

// 1. Swap the model here with just 2 lines!
const model = new ChatGoogleGenerativeAI({ model: "gemini-2.5-flash", temperature: 0.2 });
// const model = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });

export const processAIAnalysisJob = async (jobId: string, patentId: string) => {
  try {
    console.log(`[AI Worker] Started processing job ${jobId} for patent ${patentId}`);

    // Update job status to processing
    await prisma.aIAnalysisJob.update({
      where: { id: jobId },
      data: { status: 'processing', startedAt: new Date() }
    });

    // Fetch patent details
    const patent = await prisma.patent.findUnique({ where: { id: patentId } });
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
    await prisma.aIReport.create({
      data: {
        patentId,
        ...reportData,
        aiModel: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'langchain-model' : 'langchain-mock',
      }
    });

    // Generate matches against Enterprise and Startup organizations
    const orgs = await prisma.organization.findMany({
      where: { type: { in: ['ENTERPRISE', 'STARTUP'] } }
    });

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
          status: 'PENDING' as const,
        };
      });

      // Clear old matches for this patent
      await prisma.matchResult.deleteMany({ where: { patentId } });

      // Create new matches
      for (const match of matches) {
        let request = await prisma.matchRequest.findFirst({ where: { organizationId: match.organizationId } });
        if (!request) {
           request = await prisma.matchRequest.create({
             data: { organizationId: match.organizationId, notes: 'General tech scouting' }
           });
        }
        await prisma.matchResult.create({
          data: {
            patentId: match.patentId,
            matchRequestId: request.id,
            matchScore: match.matchScore,
            status: match.status,
            reasons: ["Strong industry alignment", "High market fit score from AI analysis"],
            dealProbability: 50,
            estimatedRevenue: 0,
          }
        });
      }
    }

    // Update job status to completed
    await prisma.aIAnalysisJob.update({
      where: { id: jobId },
      data: { status: 'completed', completedAt: new Date() }
    });

    console.log(`[AI Worker] Successfully completed job ${jobId}`);

  } catch (error) {
    console.error(`[AI Worker] Job ${jobId} failed:`, error);
    await prisma.aIAnalysisJob.update({
      where: { id: jobId },
      data: { status: 'failed', error: error instanceof Error ? error.message : 'Unknown error', completedAt: new Date() }
    });
  }
};

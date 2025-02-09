-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "portfolioHistoryId" TEXT;

-- AddForeignKey
ALTER TABLE "Trade" ADD CONSTRAINT "Trade_portfolioHistoryId_fkey" FOREIGN KEY ("portfolioHistoryId") REFERENCES "PortfolioHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

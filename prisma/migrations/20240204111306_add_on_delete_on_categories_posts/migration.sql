-- DropForeignKey
ALTER TABLE "CategoriesPosts" DROP CONSTRAINT "CategoriesPosts_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "CategoriesPosts" DROP CONSTRAINT "CategoriesPosts_postId_fkey";

-- AddForeignKey
ALTER TABLE "CategoriesPosts" ADD CONSTRAINT "CategoriesPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CategoriesPosts" ADD CONSTRAINT "CategoriesPosts_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

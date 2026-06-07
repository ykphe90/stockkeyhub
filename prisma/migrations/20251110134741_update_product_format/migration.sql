-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chineseName" TEXT NOT NULL,
    "minStock" INTEGER NOT NULL,
    "uom" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "imageUrl" TEXT
);
INSERT INTO "new_Product" ("chineseName", "code", "id", "imageUrl", "minStock", "name", "unitPrice", "uom") SELECT "chineseName", "code", "id", "imageUrl", "minStock", "name", "unitPrice", "uom" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_code_key" ON "Product"("code");
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

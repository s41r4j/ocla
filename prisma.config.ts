import path from "node:path";
import { defineConfig } from "prisma/config";

function resolveDatabaseUrl() {
    return (
        process.env.DATABASE_URL ??
        process.env.POSTGRES_PRISMA_URL ??
        process.env.POSTGRES_URL_NON_POOLING ??
        process.env.POSTGRES_URL
    );
}

export default defineConfig({
    schema: path.join("prisma", "schema.prisma"),
    datasource: {
        url: resolveDatabaseUrl() ?? ""
    }
});

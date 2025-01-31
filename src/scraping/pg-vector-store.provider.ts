import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PoolConfig } from "pg";

export const PGVectorStoreProvider: Provider = {
  provide: 'PGVectorStore',
  useFactory: async (configService: ConfigService) => {
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
    });
    const config = {
      postgresConnectionOptions: {
        type: "postgres",
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        user: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
      } as PoolConfig,
      tableName: "scraping_vector_store",
      columns: {
        idColumnName: "ID",
        vectorColumnName: "vector",
        contentColumnName: "content",
        metadataColumnName: "metadata",
      },
      // supported distance strategies: cosine (default), innerProduct, or euclidean
      distanceStrategy: "cosine" as DistanceStrategy,
    };
    return await PGVectorStore.initialize(embeddings, config);
  },
  inject: [ConfigService],
};
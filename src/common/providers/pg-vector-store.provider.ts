import {
  DistanceStrategy,
  PGVectorStore,
} from "@langchain/community/vectorstores/pgvector";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PoolConfig } from "pg";
import { DataSource } from "typeorm";

export const PGVectorStoreProvider: Provider = {
  provide: 'PGVectorStore',
  useFactory: async (configService: ConfigService, dataSource: DataSource) => {
    const result = await dataSource.query(
      `SELECT * FROM settings LIMIT 1`
    );

    const apiKey = result?.[0]?.openAIAPIKey;
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey
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
  inject: [ConfigService, DataSource],
};
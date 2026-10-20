// Module is the building block of NestJS — every feature is a module
import { Module } from '@nestjs/common';

// ConfigModule reads your .env file
// ConfigService lets you grab values from it (like DATABASE_URL)
import { ConfigModule, ConfigService } from '@nestjs/config';

// TypeOrmModule connects NestJS to your PostgreSQL database
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { CasesModule } from './cases/cases.module.js';
import { ScenesModule } from './scenes/scenes.module.js';
import { CluesModule } from './clues/clues.module.js';
import { SuspectsModule } from './suspects/suspects.module.js';
import { DialogueModule } from './dialogue/dialogue.module.js';
import { EvidenceModule } from './evidence/evidence.module.js';
import { GameStateModule } from './game-state/game-state.module.js';
import { ScriptedEventsModule } from './scripted-events/scripted-events.module.js';
import { AudioModule } from './audio/audio.module.js';

// @Module is a decorator — it tells NestJS
// "this class is a module, here's what it needs"
@Module({
  // imports = other modules this module depends on
  imports: [
    // Load the .env file and make it available everywhere
    // Without this, the app can't read DATABASE_URL
    ConfigModule.forRoot({
      isGlobal: true, // any module can access env variables,
      // not just this one
    }),

    // Connect to PostgreSQL
    // "forRootAsync" means it waits for the config to load
    // before connecting — it needs DATABASE_URL first
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule], // give it access to config
      inject: [ConfigService], // inject the service that
      // reads env variables

      // useFactory is a function that returns the
      // database configuration
      useFactory: (configService: ConfigService) => ({
        type: 'postgres', // we're using PostgreSQL
        url: configService.get('DATABASE_URL'), // grab the
        // connection string from .env
        autoLoadEntities: true, // automatically find all
        // table definitions we create
        synchronize: true, // auto-create tables from
        // our TypeScript code
        // DEV ONLY — turn off
        // in production
      }),
    }),

    AuthModule,

    CasesModule,

    ScenesModule,

    CluesModule,

    SuspectsModule,

    DialogueModule,

    EvidenceModule,

    GameStateModule,

    ScriptedEventsModule,

    AudioModule,
  ],
})

// This is the root module — the starting point of the entire
// backend. Every other module (clues, suspects, auth) will
// be imported here
export class AppModule {}

import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { MongooseInstrumentation } from 'opentelemetry-instrumentation-mongoose';

import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import dotenv from 'dotenv';

// import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
// diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`,
});

const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT,
});

const oltpExporter = new OTLPTraceExporter({
  url: `https://api.honeycomb.io/v1/traces`,
  headers: {
    'x-honeycomb-team': process.env.HONEYCOMB_API_KEY,
  },
});

// const traceExporter = jaegerExporter;
const traceExporter =
  process.env.NODE_ENV === 'production' ? jaegerExporter : oltpExporter;

const spanProcessor =
  process.env.NODE_ENV === `production` || process.env.NODE_ENV === `test`
    ? new BatchSpanProcessor(traceExporter)
    : new SimpleSpanProcessor(traceExporter);

// const spanProcessor = new SimpleSpanProcessor(traceExporter);

export const otelSDK = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: `gomgom-${process.env.NODE_ENV}`,
  }),
  spanProcessor,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new MongooseInstrumentation(),
  ],
});

process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => console.log('SDK shut down successfully'),
      (err) => console.log('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});

import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MeterVerse API",
      version: "1.0.0",
      description: "Enterprise utility metering and billing platform API",
      contact: { name: "MeterVerse Engineering" },
    },
    servers: [{ url: "/api", description: "API v1" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        Error: { type: "object", properties: { error: { type: "string" } } },
        Customer: {
          type: "object", properties: {
            id: { type: "string" }, name: { type: "string" }, email: { type: "string" },
            phone: { type: "string" }, status: { type: "string" }, area: { type: "string" },
          },
        },
        Meter: {
          type: "object", properties: {
            id: { type: "string" }, meterId: { type: "string" }, type: { type: "string" },
            status: { type: "string" }, serial: { type: "string" }, location: { type: "string" },
          },
        },
        Invoice: {
          type: "object", properties: {
            id: { type: "string" }, number: { type: "string" }, amount: { type: "number" },
            status: { type: "string" }, dueDate: { type: "string" }, customerId: { type: "string" },
          },
        },
        Payment: {
          type: "object", properties: {
            id: { type: "string" }, amount: { type: "number" }, method: { type: "string" },
            status: { type: "string" }, customerId: { type: "string" },
          },
        },
        Tariff: {
          type: "object", properties: {
            id: { type: "string" }, name: { type: "string" }, type: { type: "string" },
            status: { type: "string" }, rates: { type: "array", items: { type: "object" } },
          },
        },
        Reading: {
          type: "object", properties: {
            id: { type: "string" }, value: { type: "number" }, meterId: { type: "string" },
            status: { type: "string" }, timestamp: { type: "string" },
          },
        },
        SIMCard: {
          type: "object", properties: {
            id: { type: "string" }, iccid: { type: "string" }, simNumber: { type: "string" },
            status: { type: "string" }, operator: { type: "string" },
          },
        },
        BillRun: {
          type: "object", properties: {
            id: { type: "string" }, periodStart: { type: "string" }, periodEnd: { type: "string" },
            status: { type: "string" }, totalCount: { type: "integer" }, totalAmount: { type: "number" },
          },
        },
      },
    },
  },
  apis: ["./src/routes/*.js"],
}

export const swaggerSpec = swaggerJsdoc(options)
export { swaggerUi }

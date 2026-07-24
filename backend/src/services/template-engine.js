import { prisma } from "../db.js"

function renderTemplate(template, variables) {
  let result = template
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g")
    result = result.replace(regex, String(value ?? ""))
  }
  return result
}

const DEFAULT_TEMPLATES = {
  invoice_header: "INVOICE {{INVOICE_NUMBER}}\nDate: {{DATE}}\nDue: {{DUE_DATE}}\nCustomer: {{CUSTOMER_NAME}}",
  invoice_line: "{{QTY}} × {{DESCRIPTION}} @ {{RATE}} = {{AMOUNT}}",
  invoice_footer: "Total: {{TOTAL}} EGP\nAmount in words: {{AMOUNT_IN_WORDS}}",
  statement_header: "STATEMENT — {{CUSTOMER_NAME}}\nPeriod: {{PERIOD_START}} to {{PERIOD_END}}",
  statement_line: "{{DATE}} | {{DESCRIPTION}} | {{AMOUNT}} | Balance: {{BALANCE}}",
  statement_footer: "Closing Balance: {{CLOSING_BALANCE}} EGP",
}

export async function seedTemplates() {
  for (const [key, body] of Object.entries(DEFAULT_TEMPLATES)) {
    await prisma.notificationTemplate.upsert({
      where: { key },
      update: { body },
      create: { key, name: key.replace(/_/g, " "), type: "template", body, variables: "[]" },
    })
  }
}

export async function renderInvoiceTemplate(invoice, customer, items) {
  const header = await prisma.notificationTemplate.findUnique({ where: { key: "invoice_header" } })
  const line = await prisma.notificationTemplate.findUnique({ where: { key: "invoice_line" } })
  const footer = await prisma.notificationTemplate.findUnique({ where: { key: "invoice_footer" } })

  const vars = {
    INVOICE_NUMBER: invoice.number || invoice.id,
    DATE: invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString() : "",
    DUE_DATE: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "",
    CUSTOMER_NAME: customer?.name || "",
    TOTAL: (invoice.amount || 0).toFixed(2),
    AMOUNT_IN_WORDS: "See attached",
  }

  let output = renderTemplate(header?.body || DEFAULT_TEMPLATES.invoice_header, vars) + "\n\n"
  for (const item of items || []) {
    output += renderTemplate(line?.body || DEFAULT_TEMPLATES.invoice_line, {
      QTY: item.quantity || 1,
      DESCRIPTION: item.description || "",
      RATE: item.unitPrice || 0,
      AMOUNT: item.amount || 0,
    }) + "\n"
  }
  output += "\n" + renderTemplate(footer?.body || DEFAULT_TEMPLATES.invoice_footer, vars)
  return output
}

export async function getTemplate(key) {
  const t = await prisma.notificationTemplate.findUnique({ where: { key } })
  return t?.body || DEFAULT_TEMPLATES[key] || ""
}

export async function setTemplate(key, body) {
  return prisma.notificationTemplate.upsert({
    where: { key },
    update: { body },
    create: { key, name: key.replace(/_/g, " "), type: "template", body, variables: "[]" },
  })
}

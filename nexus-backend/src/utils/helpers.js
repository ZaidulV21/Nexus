// nexus-backend/src/utils/helpers.js
const { v4: uuidv4 } = require('uuid')

const generateId = () => uuidv4()

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

const generateQuoteNumber = (count) => {
  const year   = new Date().getFullYear()
  const padded = String(count + 1).padStart(3, '0')
  return `NXS-${year}-${padded}`
}

const generateInvoiceNumber = (count) => {
  const year   = new Date().getFullYear()
  const padded = String(count + 1).padStart(3, '0')
  return `NXS-INV-${year}-${padded}`
}

const calculateGST = (subtotal, taxPercent = 18) => {
  const taxAmount   = (subtotal * taxPercent) / 100
  const totalAmount = subtotal + taxAmount
  return {
    subtotal:    Math.round(subtotal * 100)    / 100,
    taxAmount:   Math.round(taxAmount * 100)   / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

module.exports = { generateId, formatINR, generateQuoteNumber, generateInvoiceNumber, calculateGST, formatDate }

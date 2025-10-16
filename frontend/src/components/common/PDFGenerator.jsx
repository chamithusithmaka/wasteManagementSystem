import { jsPDF } from 'jspdf';

/**
 * Generate a PDF document with company branding
 * @param {Object} options - PDF generation options
 * @param {string} options.title - Document title
 * @param {string} options.filename - Filename for download (without .pdf)
 * @param {Object} options.document - Document data
 * @param {Array} options.tableColumns - Column definitions for table
 * @param {Array} options.tableData - Row data for table
 * @param {Object} options.summary - Summary information
 * @param {string} options.footer - Footer text
 * @returns {void} - Triggers download
 */
const generatePDF = ({
  title,
  filename,
  document,
  tableColumns,
  tableData,
  summary,
  footer = 'UrbanWasteX - Eco-friendly waste management solutions'
}) => {
  // Create new PDF
  const doc = new jsPDF();
  
  // Set green theme colors
  const primaryColor = '#2F855A'; // Green 700
  const secondaryColor = '#276749'; // Green 800
  
  // Add header with colored rectangle instead of logo
  doc.setFillColor(primaryColor);
  doc.rect(10, 10, 25, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text('UWX', 16, 25);
  
  // Add header text
  doc.setTextColor(secondaryColor);
  doc.setFontSize(22);
  doc.text('UrbanWasteX', 40, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text('Eco-friendly waste management', 40, 30);
  
  // Add horizontal line
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(10, 40, 200, 40);
  
  // Add title
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor);
  doc.text(title, 10, 55);
  
  // Add document info
  let yPos = 65;
  if (document) {
    Object.entries(document).forEach(([key, value]) => {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`${key}:`, 10, yPos);
      doc.setTextColor(0);
      doc.text(`${value}`, 50, yPos);
      yPos += 7;
    });
  }
  
  // Draw table manually instead of using autoTable
  if (tableData && tableData.length > 0) {
    yPos += 5;
    
    // Draw table header
    doc.setFillColor(primaryColor);
    doc.rect(10, yPos, 180, 10, 'F');
    doc.setTextColor(255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    
    // Positions for columns - adjust as needed for your data
    const colWidths = [120, 60]; // For 2 columns
    let xPos = 15;
    
    // Draw column headers
    tableColumns.forEach((col, i) => {
      doc.text(col, xPos, yPos + 6);
      xPos += colWidths[i];
    });
    
    // Reset for table body
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0);
    yPos += 10;
    
    // Draw rows
    tableData.forEach((row, rowIndex) => {
      // Light green background for even rows
      if (rowIndex % 2 === 0) {
        doc.setFillColor(230, 245, 230); // Light green
        doc.rect(10, yPos, 180, 10, 'F');
      }
      
      xPos = 15;
      row.forEach((cell, i) => {
        // Check if it's a discount/deduction (starts with minus)
        if (cell.toString().startsWith('-')) {
          doc.setTextColor(255, 0, 0); // Red for negative values
        } else {
          doc.setTextColor(0);
        }
        doc.text(cell.toString(), xPos, yPos + 6);
        xPos += colWidths[i];
      });
      
      yPos += 10;
    });
    
    // Draw table border
    doc.setDrawColor(200);
    doc.rect(10, yPos - (tableData.length * 10) - 10, 180, (tableData.length * 10) + 10);
  }
  
  // Add summary section
  if (summary) {
    yPos += 10;
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(120, yPos, 190, yPos);
    
    yPos += 10;
    Object.entries(summary).forEach(([key, value]) => {
      doc.setTextColor(80);
      doc.text(`${key}:`, 120, yPos);
      
      // Format value as currency if it's a number
      const formattedValue = typeof value === 'number' 
        ? `LKR ${value.toFixed(2)}` 
        : value;
      
      // Highlight total with bold text and green color
      if (key.toLowerCase().includes('total')) {
        doc.setFont(undefined, 'bold');
        doc.setTextColor(primaryColor);
        doc.text(`${formattedValue}`, 170, yPos);
        doc.setFont(undefined, 'normal');
      } else {
        doc.setTextColor(0);
        doc.text(`${formattedValue}`, 170, yPos);
      }
      yPos += 7;
    });
  }
  
  // Add footer
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(0.5);
  doc.line(10, 280, 200, 280);
  
  doc.setTextColor(100);
  doc.setFontSize(8);
  doc.text(footer, 105, 285, { align: 'center' });
  
  // Add page number and generation date
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 10, 285);
  doc.text(`Page 1`, 200, 285, { align: 'right' });
  
  // Save the PDF
  doc.save(`${filename}.pdf`);
};

export default generatePDF;
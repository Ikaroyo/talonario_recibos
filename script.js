// Wait for DOM to be fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Clear out existing event listeners and reimplementing
  detachAndReattachListeners();
  
  // Set default date to today
  setTodayDate();
  
  // Load the last saved receipt number
  const lastReceiptNumber = localStorage.getItem('lastReceiptNumber') || '000000';
  const numeroLeft = document.getElementById('numero-left');
  const numeroRight = document.getElementById('numero-right');
  if (numeroLeft && numeroRight) {
    numeroLeft.value = lastReceiptNumber;
    numeroRight.value = lastReceiptNumber;
  }
  
  console.log('Script initialized - DOM fully loaded');
});

// Function to remove all existing listeners and reattach them properly
function detachAndReattachListeners() {
  // Define field pairs to sync - this ensures we don't miss any
  const fieldPairs = [
    ['numero-left', 'numero-right'],
    ['dia-left', 'dia-right'],
    ['mes-left', 'mes-right'],
    ['anio-left', 'anio-right'],
    ['nombre-left', 'nombre-right'],
    ['domicilio-left', 'domicilio-right'],
    ['cuit-left', 'cuit-right'],
    ['concepto-line1-left', 'concepto-line1-right'],
    ['concepto-line2-left', 'concepto-line2-right']
  ];
  
  // Special handling for importe/total fields
  setupImporteListeners();
  
  // Set up all other field pairs
  fieldPairs.forEach(pair => {
    const leftElem = document.getElementById(pair[0]);
    const rightElem = document.getElementById(pair[1]);
    
    if (leftElem && rightElem) {
      // Clear existing listeners
      leftElem.removeAttribute('oninput');
      rightElem.removeAttribute('oninput');
      
      // Clean clone to remove all event listeners
      const newLeftElem = leftElem.cloneNode(true);
      const newRightElem = rightElem.cloneNode(true);
      
      leftElem.parentNode.replaceChild(newLeftElem, leftElem);
      rightElem.parentNode.replaceChild(newRightElem, rightElem);
      
      // Add fresh event listeners
      newLeftElem.addEventListener('input', function() {
        newRightElem.value = this.value;
      });
      
      newRightElem.addEventListener('input', function() {
        newLeftElem.value = this.value;
      });
    }
  });
}

function setupImporteListeners() {
  const importeLeft = document.getElementById('importe-left');
  const totalRight = document.getElementById('total-right');
  
  if (importeLeft && totalRight) {
    // Clear existing listeners
    importeLeft.removeAttribute('oninput');
    totalRight.removeAttribute('oninput');
    
    // Clean clone to remove all event listeners
    const newImporteLeft = importeLeft.cloneNode(true);
    const newTotalRight = totalRight.cloneNode(true);
    
    importeLeft.parentNode.replaceChild(newImporteLeft, importeLeft);
    totalRight.parentNode.replaceChild(newTotalRight, totalRight);
    
    // Add fresh event listeners
    newImporteLeft.addEventListener('input', function() {
      newTotalRight.value = this.value;
      updateCantidadPesos(this.value);
    });
    
    newTotalRight.addEventListener('input', function() {
      newImporteLeft.value = this.value;
      updateCantidadPesos(this.value);
    });
    
    // Format on blur
    newImporteLeft.addEventListener('blur', function() {
      if (this.value) {
        const rawValue = this.value.replace(/[^\d.,]/g, '').replace(',', '.');
        const numericValue = parseFloat(rawValue) || 0;
        this.value = formatImporteValue(numericValue);
        newTotalRight.value = this.value;
      }
    });
    
    newTotalRight.addEventListener('blur', function() {
      if (this.value) {
        const rawValue = this.value.replace(/[^\d.,]/g, '').replace(',', '.');
        const numericValue = parseFloat(rawValue) || 0;
        this.value = formatImporteValue(numericValue);
        newImporteLeft.value = this.value;
      }
    });
  }
}

// Function to update cantidad-pesos fields
function updateCantidadPesos(value) {
  // Parse the value to get a clean number
  const rawValue = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
  const importeValue = parseFloat(rawValue) || 0;
  const cantidadPesos1 = document.getElementById('cantidad-pesos-1');
  const cantidadPesos2 = document.getElementById('cantidad-pesos-2');
  
  if (importeValue > 0 && cantidadPesos1 && cantidadPesos2) {
    // Get integer and decimal parts
    const integerPart = Math.floor(importeValue);
    const decimalPart = Math.round((importeValue - integerPart) * 100);
    
    // Generate text for pesos and cents with proper Spanish grammar
    let pesosText = "";
    if (integerPart === 1) {
      pesosText = "un peso";
    } else {
      pesosText = numeroALetras(integerPart) + " pesos";
    }
    
    let centsText = "";
    if (decimalPart > 0) {
      if (decimalPart === 1) {
        centsText = " con un centavo";
      } else {
        centsText = " con " + numeroALetras(decimalPart) + " centavos";
      }
    }
    
    // Set text content
    cantidadPesos1.textContent = pesosText + centsText;
    cantidadPesos2.textContent = `($ ${formatImporteValue(importeValue)})`;
  } else if (cantidadPesos1 && cantidadPesos2) {
    cantidadPesos1.textContent = '';
    cantidadPesos2.textContent = '';
  }
}

// Improved Spanish number to words function
function numeroALetras(numero) {
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const decenas = ['', 'diez', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];
  
  numero = Math.floor(numero);
  
  if (numero === 0) return 'cero';
  if (numero === 1) return 'uno'; // For grammatical correctness when used with pesos/centavos
  
  let resultado = '';
  
  // Special case for thousands
  if (numero === 1000) return 'mil';
  
  // Millions
  if (numero >= 1000000) {
    if (Math.floor(numero / 1000000) === 1) {
      resultado = 'un millón ';
    } else {
      resultado = numeroALetras(Math.floor(numero / 1000000)) + ' millones ';
    }
    numero %= 1000000;
  }
  
  // Thousands
  if (numero >= 1000) {
    if (Math.floor(numero / 1000) === 1) {
      resultado += 'mil ';
    } else {
      resultado += numeroALetras(Math.floor(numero / 1000)) + ' mil ';
    }
    numero %= 1000;
  }
  
  // Hundreds
  if (numero >= 100) {
    if (numero === 100) {
      resultado += 'cien ';
    } else {
      resultado += centenas[Math.floor(numero / 100)] + ' ';
    }
    numero %= 100;
  }
  
  // Tens and units
  if (numero > 0) {
    if (numero < 10) {
      resultado += unidades[numero];
    } else if (numero < 20) {
      resultado += especiales[numero - 10];
    } else {
      if (numero % 10 === 0) {
        resultado += decenas[Math.floor(numero / 10)];
      } else {
        resultado += decenas[Math.floor(numero / 10)] + ' y ' + unidades[numero % 10];
      }
    }
  }
  
  return resultado.trim();
}

// Función para limpiar todos los campos
function resetForm() {
  const inputs = document.querySelectorAll('input[type="text"]');
  for (let input of inputs) {
    if (input.id === 'numero-left' || input.id === 'numero-right') {
      input.value = '000000';
    } else {
      input.value = '';
    }
  }
  console.log('Form reset completed');
  
  // Don't reset the receipt number - instead increment it by 1
  const numeroLeft = document.getElementById('numero-left');
  const numeroRight = document.getElementById('numero-right');
  
  if (numeroLeft && numeroRight) {
    try {
      const currentNumber = parseInt(numeroLeft.value) || 0;
      const newNumber = (currentNumber + 1).toString().padStart(6, '0');
      numeroLeft.value = newNumber;
      numeroRight.value = newNumber;
      localStorage.setItem('lastReceiptNumber', newNumber);
    } catch (e) {
      console.error('Error incrementing receipt number:', e);
    }
  }

  // Reset the date to today
  setTodayDate();
}

// Function to set today's date in the date fields
function setTodayDate() {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const year = today.getFullYear();
  
  // Set date in left side
  const diaLeft = document.getElementById('dia-left');
  const mesLeft = document.getElementById('mes-left');
  const anioLeft = document.getElementById('anio-left');
  
  if (diaLeft && mesLeft && anioLeft) {
    diaLeft.value = day;
    mesLeft.value = month;
    anioLeft.value = year;
  }
  
  // Set date in right side
  const diaRight = document.getElementById('dia-right');
  const mesRight = document.getElementById('mes-right');
  const anioRight = document.getElementById('anio-right');
  
  if (diaRight && mesRight && anioRight) {
    diaRight.value = day;
    mesRight.value = month;
    anioRight.value = year;
  }
}

// Function to save receipt as PDF
function saveReceipt() {
  const receiptContainer = document.querySelector('.recibo-container');
  
  // Use html2canvas and jsPDF to create PDF
  html2canvas(receiptContainer).then(canvas => {
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    
    // Calculate ratio to fit receipt in PDF
    const ratio = Math.min(width / canvas.width, height / canvas.height);
    const imgWidth = canvas.width * ratio;
    const imgHeight = canvas.height * ratio;
    
    // Center the image in the PDF
    const x = (width - imgWidth) / 2;
    const y = (height - imgHeight) / 2;
    
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    
    // Generate filename with receipt number and date
    const receiptNum = document.getElementById('numero-left').value || '000000';
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10);
    const filename = `recibo_${receiptNum}_${dateStr}.pdf`;
    
    pdf.save(filename);
  });
}

// Log to check if script file is being loaded
console.log('Script file loaded');

// Function to save receipt as PDF
function guardarPDF() {
  // Check if required libraries are loaded
  if (!window.html2canvas || !window.jsPDF) {
    alert('Error: Las bibliotecas necesarias para crear PDF no están cargadas correctamente.');
    return;
  }

  const receiptContainer = document.querySelector('.recibo-container');
  
  // Display loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.style.position = 'fixed';
  loadingMessage.style.top = '50%';
  loadingMessage.style.left = '50%';
  loadingMessage.style.transform = 'translate(-50%, -50%)';
  loadingMessage.style.background = 'rgba(0, 0, 0, 0.7)';
  loadingMessage.style.color = 'white';
  loadingMessage.style.padding = '20px';
  loadingMessage.style.borderRadius = '5px';
  loadingMessage.style.zIndex = '9999';
  loadingMessage.textContent = 'Generando PDF...';
  document.body.appendChild(loadingMessage);
  
  // Make sure the divs are properly captured in the PDF
  const cantidadPesos1 = document.getElementById('cantidad-pesos-1');
  const cantidadPesos2 = document.getElementById('cantidad-pesos-2');
  
  if (cantidadPesos1) cantidadPesos1.style.border = '1px solid #ddd';
  if (cantidadPesos2) cantidadPesos2.style.border = '1px solid #ddd';
  
  // Use html2canvas to capture the receipt
  html2canvas(receiptContainer, {
    scale: 2,
    useCORS: true,
    logging: false
  }).then(canvas => {
    try {
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with correct dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate ratio to fit receipt in PDF
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight) * 0.95;
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      
      // Center the image in the PDF
      const x = (pageWidth - finalWidth) / 2;
      const y = (pageHeight - finalHeight) / 2;
      
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Generate filename with receipt number and date - FIX DATE ISSUE
      const receiptNum = document.getElementById('numero-left').value || '000000';
      const today = new Date();
      
      // Format the date correctly - use local timezone to prevent off-by-one errors
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const filename = `recibo_${receiptNum}_${dateStr}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      console.log('PDF generated successfully');
    } catch (e) {
      console.error('Error generating PDF:', e);
      alert('Error al generar el PDF: ' + e.message);
    } finally {
      // Remove loading message
      document.body.removeChild(loadingMessage);
    }
  }).catch(err => {
    console.error('Error capturing receipt:', err);
    alert('Error al capturar el recibo: ' + err.message);
    document.body.removeChild(loadingMessage);
  });
}

// Function to create a new receipt
function nuevoRecibo() {
  // First clear all fields
  limpiarCampos();
  
  // Then increment the receipt number
  incrementarNumeroRecibo();
  
  // Set today's date
  setTodayDate();
}

// Function to clear all fields - updated to handle divs
function limpiarCampos() {
  const inputs = document.querySelectorAll('input[type="text"]');
  for (let input of inputs) {
    // Skip receipt numbers
    if (input.id === 'numero-left' || input.id === 'numero-right') {
      continue;
    }
    // Skip date fields if we want to preserve them
    else if (input.id === 'dia-left' || input.id === 'mes-left' || input.id === 'anio-left' ||
             input.id === 'dia-right' || input.id === 'mes-right' || input.id === 'anio-right') {
      continue;
    }
    // Clear all other fields
    else {
      input.value = '';
    }
  }
  
  // Clear div content for cantidad-pesos fields
  const cantidadPesos1 = document.getElementById('cantidad-pesos-1');
  const cantidadPesos2 = document.getElementById('cantidad-pesos-2');
  
  if (cantidadPesos1) cantidadPesos1.textContent = '';
  if (cantidadPesos2) cantidadPesos2.textContent = '';
  
  console.log('Campos limpiados');
}

// Function to increment receipt number
function incrementarNumeroRecibo() {
  const numeroLeft = document.getElementById('numero-left');
  const numeroRight = document.getElementById('numero-right');
  
  if (numeroLeft && numeroRight) {
    try {
      const currentNumber = parseInt(numeroLeft.value.replace(/\D/g, '')) || 0;
      const newNumber = (currentNumber + 1).toString().padStart(6, '0');
      numeroLeft.value = newNumber;
      numeroRight.value = newNumber;
      localStorage.setItem('lastReceiptNumber', newNumber);
      console.log('Número de recibo incrementado a:', newNumber);
    } catch (e) {
      console.error('Error al incrementar el número de recibo:', e);
    }
  }
}

// Replace the old resetForm function with the new functions
window.resetForm = nuevoRecibo;
window.guardarPDF = guardarPDF;
window.nuevoRecibo = nuevoRecibo;
window.limpiarCampos = limpiarCampos;

// Ensure importe field updates cantidad-pesos when modified from either side
document.addEventListener('DOMContentLoaded', function() {
  // Re-initialize sync for importe and total
  const importeLeft = document.getElementById('importe-left');
  const totalRight = document.getElementById('total-right');
  
  if (importeLeft && totalRight) {
    // Direct synchronization without using syncFields function
    ['input', 'change', 'paste'].forEach(eventType => {
      importeLeft.addEventListener(eventType, function() {
        totalRight.value = this.value;
        updateCantidadPesos(this.value);
      });
      
      totalRight.addEventListener(eventType, function() {
        importeLeft.value = this.value;
        updateCantidadPesos(this.value);
      });
    });
    
    // Format on blur
    importeLeft.addEventListener('blur', formatCurrencyField);
    totalRight.addEventListener('blur', formatCurrencyField);
  }
});

// Separate function to update cantidad-pesos
function updateCantidadPesos(value) {
  // Parse the value to get a clean number
  const rawValue = String(value).replace(/[^\d.,]/g, '').replace(',', '.');
  const importeValue = parseFloat(rawValue) || 0;
  const cantidadPesos1 = document.getElementById('cantidad-pesos-1');
  const cantidadPesos2 = document.getElementById('cantidad-pesos-2');
  
  if (importeValue > 0 && cantidadPesos1 && cantidadPesos2) {
    // Get integer and decimal parts
    const integerPart = Math.floor(importeValue);
    const decimalPart = Math.round((importeValue - integerPart) * 100);
    
    // Generate text for pesos and cents with proper Spanish grammar
    let pesosText = "";
    if (integerPart === 1) {
      pesosText = "un peso";
    } else {
      pesosText = numeroALetras(integerPart) + " pesos";
    }
    
    let centsText = "";
    if (decimalPart > 0) {
      if (decimalPart === 1) {
        centsText = " con un centavo";
      } else {
        centsText = " con " + numeroALetras(decimalPart) + " centavos";
      }
    }
    
    // Set text content
    cantidadPesos1.textContent = pesosText + centsText;
    cantidadPesos2.textContent = `($ ${formatImporteValue(importeValue)})`;
  } else if (cantidadPesos1 && cantidadPesos2) {
    cantidadPesos1.textContent = '';
    cantidadPesos2.textContent = '';
  }
}

// Helper function to format currency values
function formatCurrencyField() {
  if (this.value) {
    const rawValue = this.value.replace(/[^\d.,]/g, '').replace(',', '.');
    const numericValue = parseFloat(rawValue) || 0;
    this.value = formatImporteValue(numericValue);
  }
}

// Function to format importe values consistently
function formatImporteValue(value) {
  if (value !== undefined && value !== null) {
    // Format number with proper thousand separators and decimal places
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
  return '';
}
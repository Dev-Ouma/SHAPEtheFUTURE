import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Helper to load image as base64
const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading image', error);
    return '';
  }
};

export const generateFeesPDF = async (fees: any[]) => {
  const doc = new jsPDF('p', 'mm', 'a4'); // Portrait A4
  
  // Header function
  const drawHeader = async (isFirstPage: boolean) => {
    if (isFirstPage) {
      try {
        const logoBase64 = await getBase64ImageFromUrl('/logo.png');
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 14, 12, 35, 16);
        }
      } catch (e) {}
      
      doc.setFontSize(20);
      doc.setTextColor(1, 74, 99);
      doc.text('Open University of Kenya', 55, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text('Detailed Fee Structure Breakdown', 55, 27);
    }
    
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, isFirstPage ? 38 : 15);
  };

  await drawHeader(true);
  
  let currentY = 45;

  fees.forEach((f, index) => {
    // Add page if we're near the bottom
    if (currentY > 230) {
      doc.addPage();
      drawHeader(false);
      currentY = 25;
    }

    // Programme Header
    doc.setFontSize(14);
    doc.setTextColor(1, 74, 99); // Primary
    doc.setFont('helvetica', 'bold');
    doc.text(f.program?.title?.toUpperCase() || 'UNKNOWN PROGRAMME', 14, currentY);
    
    currentY += 6;
    doc.setFontSize(10);
    doc.setTextColor(100); // Gray
    doc.setFont('helvetica', 'normal');
    
    const schoolText = f.program?.school?.name || 'N/A';
    const levelText = f.program?.level || 'N/A';
    const yearText = f.academic_year?.year_range || 'N/A';
    doc.text(`${schoolText}  •  Level: ${levelText}  •  Academic Year: ${yearText}`, 14, currentY);
    
    currentY += 5;

    // Compile Fees List
    const tableBody: any[] = [];
    
    const addFee = (name: string, amount: number) => {
      if (amount > 0) {
        tableBody.push([name, `KES ${amount.toLocaleString()}`]);
      }
    };

    const tuition = Number(f.tuition_fee || 0);
    addFee('Tuition Fee', tuition);
    addFee('Registration Fee', Number(f.registration_fee || 0));
    addFee('Student Activity Fee', Number(f.student_activity_fee || 0));
    addFee('Examination Fee', Number(f.examination_fee || 0));
    addFee('Technology Fee', Number(f.technology_fee || 0));
    addFee('Library Fee', Number(f.library_fee || 0));
    addFee('Practical/Laboratory Fee', Number(f.practical_laboratory_fee || 0));

    let otherTotal = 0;
    if (Array.isArray(f.other_fees)) {
      f.other_fees.forEach((of: any) => {
        const amt = Number(of.amount || 0);
        if (amt > 0) {
          tableBody.push([of.name || 'Other Fee', `KES ${amt.toLocaleString()}`]);
          otherTotal += amt;
        }
      });
    }

    const legacyTotal = Number(f.registration_fee || 0) + Number(f.student_activity_fee || 0) + Number(f.examination_fee || 0) + Number(f.technology_fee || 0) + Number(f.library_fee || 0) + Number(f.practical_laboratory_fee || 0);
    const totalYear = tuition + legacyTotal + otherTotal;
    const totalSem = totalYear / 2;

    // Add empty row for spacing
    tableBody.push(['', '']);
    
    // Add Totals
    tableBody.push([{ content: 'Total Per Year', styles: { fontStyle: 'bold', textColor: [1, 74, 99] } }, { content: `KES ${totalYear.toLocaleString()}`, styles: { fontStyle: 'bold', textColor: [1, 74, 99] } }]);
    tableBody.push([{ content: 'Estimated Cost Per Semester', styles: { fontStyle: 'bold', textColor: [100, 100, 100] } }, { content: `KES ${totalSem.toLocaleString()}`, styles: { fontStyle: 'bold', textColor: [100, 100, 100] } }]);

    autoTable(doc, {
      startY: currentY,
      body: tableBody,
      theme: 'plain',
      styles: { fontSize: 10, cellPadding: 2 },
      columnStyles: {
        0: { cellWidth: 100 },
        1: { cellWidth: 50, halign: 'right' }
      },
      margin: { left: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;
    
    // Add a divider line if not the last item
    if (index < fees.length - 1 && currentY < 270) {
      doc.setDrawColor(220, 220, 220);
      doc.line(14, currentY, 196, currentY);
      currentY += 10;
    }
  });

  doc.save('OUK_Fee_Structure.pdf');
};

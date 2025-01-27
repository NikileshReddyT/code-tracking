import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

const PdfDownloadButton = ({ studentId }) => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    if (studentId) {
      fetchReportData();
    }
  }, [studentId]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const storedData = localStorage.getItem(`reportData_${studentId}`);
      if (storedData) {
        setReportData(JSON.parse(storedData));
      } else {
        const response = await axios.post("https://keen-radiance-production.up.railway.app/api/v1/frontend/generatereport", {
          universityId: studentId
        });
        if (response.data) {
          setReportData(response.data);
          localStorage.setItem(`reportData_${studentId}`, JSON.stringify(response.data));
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!reportData) return;

    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let currentY = 40;

    const addPage = () => {
      doc.addPage();
      currentY = 40;
    };

    const checkPageSpace = (requiredSpace) => {
      if (currentY + requiredSpace > pageHeight - 40) addPage();
    };

    // Header with maroon color and swapped text
    doc.setFillColor(128, 0, 0); // Maroon color
    doc.rect(0, 0, pageWidth, 60, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING", pageWidth / 2, 30, { align: "center" });
    doc.setFontSize(16);
    doc.text("KONERU LAKSHMAIAH EDUCATION FOUNDATION", pageWidth / 2, 50, { align: "center" });

    currentY = 100;

    // Styled Student Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${reportData.studentName}`, pageWidth / 2, currentY, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`ID: ${reportData.studentId}`, pageWidth / 2, currentY + 20, { align: "center" });

    currentY += 60;

    // Total Credits and Courses - Aligned to Both Ends
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(`Total Registered Courses: ${reportData.totalRegisteredCourses}`, 40, currentY);
    doc.text(`Total Registered Credits: ${reportData.totalRegisteredCredits}`, pageWidth - 40, currentY, { align: "right" });

    currentY += 40;

    // Categories
    reportData.categories.forEach((category) => {
      checkPageSpace(60);

      doc.setFillColor(230, 230, 230);
      doc.rect(30, currentY - 20, pageWidth - 60, 30, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(category.categoryName, 40, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Required courses: ${category.minRequiredCourses}`, 40, currentY + 20);
      doc.text(`Completed courses: ${category.registeredCourses}`, 450, currentY + 20);
      currentY += 30;

      if (Array.isArray(category.courses) && category.courses.length > 0) {
        // Sort courses by year and then by semester (Odd Sem first, Even Sem second)
        const sortedCourses = category.courses.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year.localeCompare(b.year);
          }
          return a.semester === "Odd Sem" ? -1 : 1;
        });

        const tableData = sortedCourses.map(course => [
          course.year?.toString() || "-",
          course.semester || "-",
          course.courseCode,
          course.courseName,
          course.credits?.toString() || "-",
          course.grade || "Not Released"
        ]);

        doc.autoTable({
          head: [["Year", "Semester", "Course Code", "Name", "Credits", "Result"]],
          body: tableData,
          startY: currentY,
          margin: { horizontal: 30 },
          styles: { cellPadding: 2, fontSize: 10, overflow: 'linebreak', halign: 'center', valign: 'middle' },
          headStyles: { fillColor: [160, 110, 110], fontStyle: 'bold' },
          didDrawPage: () => (currentY = 80)
        });

        currentY = doc.lastAutoTable.finalY + 50;
      } else {
        currentY -= 10;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(115, 65, 65);
        doc.text("No courses registered", pageWidth / 2, currentY + 20, { align: "center" });
        doc.setTextColor(0, 0, 0);
        currentY += 60;
      }
    });

    // Footer with maroon color
    doc.setFillColor(128, 0, 0);
    doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(`Total Registered Courses: ${reportData.totalRegisteredCourses}`, 40, pageHeight - 15);
    doc.text(`Total Registered Credits: ${reportData.totalRegisteredCredits}`, pageWidth - 40, pageHeight - 15, { align: "right" });

    doc.save(`${reportData.studentId}_Exit_Requirement_Report.pdf`);
  };

  return (
    <div className="flex justify-center mt-4">
      <button
        onClick={generatePDF}
        disabled={loading || !reportData}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200 disabled:bg-gray-400"
      >
        {loading ? "Loading data..." : "Download"}
      </button>
    </div>
  );
};

export default PdfDownloadButton;

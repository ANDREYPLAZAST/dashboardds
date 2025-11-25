"use client";

import { Student } from "../columns";
import { useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getDatePositionCoordinates } from "@/lib/certificateDateCoordinates";

export interface DateCertificateData {
  studentName: string;
  birthDate: string;
  certificateNumber: string;
  courseDate: string;
}

export function useDateCertificateGenerator() {
  const generateDateCertificate = useCallback(async (data: DateCertificateData) => {
    try {
      const pdfTemplatePath = '/templates_certificates/date.pdf';

      // Cargar el template PDF
      const templateResponse = await fetch(pdfTemplatePath);
      if (!templateResponse.ok) {
        throw new Error(`Failed to load PDF template: ${pdfTemplatePath}`);
      }

      const templateBytes = await templateResponse.arrayBuffer();
      const pdfDoc = await PDFDocument.load(templateBytes);

      // Obtener la primera página
      const pages = pdfDoc.getPages();
      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      // Cargar fuente Times-Roman
      const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

      // Helper para dibujar texto centrado/izquierda/derecha con color opcional
      const drawText = (
        text: string,
        x: number,
        y: number,
        fontSize: number,
        align: 'left' | 'center' | 'right' = 'left',
        color = rgb(0, 0, 0)
      ) => {
        const textWidth = timesFont.widthOfTextAtSize(text, fontSize);
        const textHeight = timesFont.heightAtSize(fontSize);

        let finalX = x;
        if (align === 'center') {
          finalX = x - (textWidth / 2);
        } else if (align === 'right') {
          finalX = x - textWidth;
        }

        const pdfY = height - y - (textHeight / 2);

        firstPage.drawText(text, {
          x: finalX,
          y: pdfY,
          size: fontSize,
          font: timesFont,
          color,
        });
      };

      // Dibujar datos en el certificado
      // studentName (centrado) - 3 veces en diferentes posiciones
      drawText(data.studentName, 263, 125, 14, 'center');
      drawText(data.studentName, 263, 405, 14, 'center');
      drawText(data.studentName, 263, 680, 14, 'center');

      // birthDate (centrado)
      if (data.birthDate) {
        drawText(data.birthDate, 263, 135, 14, 'center');
      drawText(data.birthDate, 263, 415, 14, 'center');
      drawText(data.birthDate, 263, 780, 14, 'center');

      }

      // certn - Certificate Number (centrado) - usar color personalizado y un poco más grande
      if (data.certificateNumber) {
        // color #8e855f
        const certColor = rgb(142 / 255, 133 / 255, 95 / 255);
        drawText(data.certificateNumber, 163, 394, 12, 'center', certColor);
      }

      // courseDate (centrado)
      if (data.courseDate) {
        drawText(data.courseDate, 390, 500, 12, 'center');
      }

      // Generar el PDF
      const pdfBytes = await pdfDoc.save();
      return new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error generating DATE certificate PDF:', error);
      throw error;
    }
  }, []);

  const generateMultipleDateCertificates = useCallback(
    async (students: Student[]) => {
      try {
        const pdfs: Blob[] = [];
        const studentsPerPage = 3;

        // Procesar estudiantes en grupos de 3
        for (let i = 0; i < students.length; i += studentsPerPage) {
          const studentsGroup = students.slice(i, i + studentsPerPage);

          // Cargar el template PDF
          const pdfTemplatePath = '/templates_certificates/date.pdf';
          const templateResponse = await fetch(pdfTemplatePath);
          if (!templateResponse.ok) {
            throw new Error(`Failed to load PDF template: ${pdfTemplatePath}`);
          }

          const templateBytes = await templateResponse.arrayBuffer();
          const pdfDoc = await PDFDocument.load(templateBytes);

          // Obtener la primera página
          const pages = pdfDoc.getPages();
          const firstPage = pages[0];
          const { height } = firstPage.getSize();

          // Cargar fuente Times-Roman
          const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

          // Helper para dibujar texto centrado/izquierda/derecha con color opcional
          const drawText = (
            text: string,
            x: number,
            y: number,
            fontSize: number,
            align: 'left' | 'center' | 'right' = 'left',
            color = rgb(0, 0, 0)
          ) => {
            const textWidth = timesFont.widthOfTextAtSize(text, fontSize);
            const textHeight = timesFont.heightAtSize(fontSize);

            let finalX = x;
            if (align === 'center') {
              finalX = x - (textWidth / 2);
            } else if (align === 'right') {
              finalX = x - textWidth;
            }

            const pdfY = height - y - (textHeight / 2);

            firstPage.drawText(text, {
              x: finalX,
              y: pdfY,
              size: fontSize,
              font: timesFont,
              color,
            });
          };

          // Dibujar cada estudiante en su posición correspondiente (1, 2, o 3)
          for (let studentIndex = 0; studentIndex < studentsGroup.length; studentIndex++) {
            const student = studentsGroup[studentIndex];
            const position = (studentIndex + 1) as 1 | 2 | 3;

            // Obtener coordenadas para esta posición
            const coordinates = getDatePositionCoordinates(position);

            // Preparar datos del estudiante
            const studentName = `${student.first_name.toUpperCase()} ${student.last_name.toUpperCase()}`;
            const birthDate = student.birthDate 
              ? new Date(student.birthDate).toLocaleDateString('en-US')
              : '';
            const certificateNumber = student.certn !== null && student.certn !== undefined 
              ? String(student.certn)
              : '';
            const courseDate = student.courseDate
              ? new Date(student.courseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  timeZone: 'UTC'
                })
              : '';

            // Dibujar cada campo en su posición
            if (coordinates.studentName) {
              drawText(studentName, coordinates.studentName.x, coordinates.studentName.y, 10, 'left');
            }

            if (coordinates.birthDate && birthDate) {
              drawText(birthDate, coordinates.birthDate.x, coordinates.birthDate.y, 9, 'left');
            }

            if (coordinates.certificateNumber && certificateNumber) {
              // Slightly larger font and custom color for certificate number (#8e855f)
              const certColor = rgb(142 / 255, 133 / 255, 95 / 255);
              drawText(certificateNumber, coordinates.certificateNumber.x, coordinates.certificateNumber.y, 12, 'left', certColor);
            }

            if (coordinates.courseDate && courseDate) {
              drawText(courseDate, coordinates.courseDate.x, coordinates.courseDate.y, 9, 'left');
            }
          }

          // Guardar el PDF con los 3 estudiantes (o menos si es el último grupo)
          const pdfBytes = await pdfDoc.save();
          pdfs.push(new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' }));
        }

        return pdfs;
      } catch (error) {
        console.error('Error generating multiple DATE certificates:', error);
        throw error;
      }
    },
    []
  );

  return {
    generateDateCertificate,
    generateMultipleDateCertificates,
  };
}
